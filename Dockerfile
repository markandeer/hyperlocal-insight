# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Install deps (server only) ----
FROM base AS deps
COPY server/package*.json ./server/
RUN cd server && npm ci

# ---- Run ----
FROM base AS runner
WORKDIR /app

COPY --from=deps /app/server/node_modules ./server/node_modules
COPY server ./server

ENV NODE_ENV=production
# Railway sets PORT; this default is fine
ENV PORT=3000

EXPOSE 3000
CMD ["sh", "-lc", "cd server && npm start"]

