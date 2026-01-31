import type { Express, NextFunction, Request, Response } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import type { Server as HttpServer } from "http";
import fs from "fs";
import path from "path";

/**
 * Dev-only Vite middleware.
 * In production (Railway), DO NOT call setupVite(). Use serveStatic(app) instead.
 */
export async function setupVite(app: Express, httpServer: HttpServer) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("[vite] setupVite() was called in production. Use serveStatic() instead.");
  }

  const logger = createLogger();

  const vite = await createViteServer({
    logLevel: "info",
    server: {
      middlewareMode: true,
      hmr: { server: httpServer },
    },
    appType: "custom",
  });

  // Let Vite handle HMR + assets
  app.use(vite.middlewares);

  // Serve index.html for non-API routes (dev SSR-ish)
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    // Defensive: if res is somehow not an Express Response, don't crash
    if (!res || typeof (res as any).status !== "function") return next();

    // Never hijack API routes
    const url = req.originalUrl || req.url || "/";
    if (url.startsWith("/api")) return next();

    try {
      // Try common index.html locations
      const candidates = [
        path.resolve(process.cwd(), "client", "index.html"),
        path.resolve(process.cwd(), "index.html"),
      ];
      const indexPath = candidates.find((p) => fs.existsSync(p)) ?? candidates[0];

      const template = fs.readFileSync(indexPath, "utf-8");
      const html = await vite.transformIndexHtml(url, template);

      res.status(200).set("Content-Type", "text/html").end(html);
    } catch (e) {
      try {
        vite.ssrFixStacktrace(e as Error);
      } catch {}
      logger.error(e as any);
      next(e);
    }
  });
}

export async function teardownVite(vite: { close: () => Promise<void> } | null) {
  if (!vite) return;
  await vite.close();
}
