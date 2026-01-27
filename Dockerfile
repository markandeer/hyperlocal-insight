FROM node:22-alpine
WORKDIR /app

# Copy ONLY server package files first (better caching)
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci

# Now copy the server source
COPY server/ ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]


