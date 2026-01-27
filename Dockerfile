# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install deps (needs package-lock.json for npm ci)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install prod deps only (again needs lockfile)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=build /app/dist ./dist

# If your server needs runtime files from /server (usually not, but safe):
COPY --from=build /app/server ./server

EXPOSE 3000
CMD ["node", "dist/index.cjs"]
