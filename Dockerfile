# ---------- Build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps using lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy the full repo and build
COPY . .
RUN npm run build

# ---------- Run ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only production deps at runtime
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bring over the built output + anything needed at runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Railway sets PORT automatically; your app should read process.env.PORT
EXPOSE 3000
CMD ["node", "dist/index.cjs"]
