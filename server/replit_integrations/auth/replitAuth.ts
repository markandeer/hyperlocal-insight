import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

/**
 * Resolve OIDC config once per hour (memoized).
 * Supports:
 * - Railway: OIDC_CLIENT_ID / OIDC_CLIENT_SECRET / OIDC_ISSUER_URL
 * - Replit:  REPL_ID and default issuer https://replit.com/oidc
 */
const getOidcConfig = memoize(
  async () => {
    const issuerUrl =
      process.env.OIDC_ISSUER_URL ||
      process.env.ISSUER_URL ||
      "https://replit.com/oidc";

    const clientId = (process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "").trim();
    const clientSecret = process.env.OIDC_CLIENT_SECRET; // may be undefined for some flows/providers

    if (!clientId) {
      throw new Error(
        "[AUTH] Missing clientId. Set OIDC_CLIENT_ID (Railway) or REPL_ID (Replit)."
      );
    }

    const issuer = await client.Issuer.discover(issuerUrl);
    return new client.Configuration(issuer, clientId, clientSecret);
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);

  if (!process.env.DATABASE_URL) {
    throw new Error("[AUTH] DATABASE_URL must be set.");
  }
  if (!process.env.SESSION_SECRET) {
    throw new Error("[AUTH] SESSION_SECRET must be set.");
  }

  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // local dev can be false
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

export async function setupAuth(app: Express) {
  // needed on Railway behind proxy for secure cookies + correct req.protocol
  app.set("trust proxy", 1);

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);

    const claims = tokens.claims();

    await authStorage.upsertUser({
      id: claims["sub"],
      email: claims["email"] as string,
      firstName: claims["first_name"] as string,
      lastName: claims["last_name"] as string,
      profileImageUrl: claims["profile_image_url"] as string,
      stripeCustomerId: claims["stripe_customer_id"] as string,
      stripeSubscriptionId: claims["stripe_subscription_id"] as string,
    });

    verified(null, user);
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Keep track of registered strategies (one per domain)
  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (registeredStrategies.has(strategyName)) return;

    const strategy = new Strategy(
      {
        name: strategyName,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify
    );

    passport.use(strategy);
    registeredStrategies.add(strategyName);
  };

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      const clientId = (process.env.OIDC_CLIENT_ID || process.env.REPL_ID || "").trim();

      // Fallback redirect base
      const baseUrl =
        process.env.APP_URL ||
        `${req.protocol}://${req.get("host")}`;

      try {
        // If provider supports RP-initiated logout, build it
        const endSessionUrl = client.buildEndSessionUrl(config, {
          client_id: clientId,
          post_logout_redirect_uri: baseUrl,
        }).href;

        res.redirect(endSessionUrl);
      } catch {
        // If provider doesn't support end_session, just bounce home
        res.redirect(baseUrl);
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) return next();

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
