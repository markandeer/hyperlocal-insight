# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install all deps (including dev, needed to build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build server + client
RUN npm run build


# ---------- Runtime stage ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built output and runtime files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared

# Railway provides PORT automatically
CMD ["npm", "run", "start"]
