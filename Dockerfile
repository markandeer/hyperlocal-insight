FROM node:22-alpine
WORKDIR /app

# Install server deps (works even without package-lock.json)
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy needed code
COPY server ./server
COPY shared ./shared

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-lc", "cd server && npm start"]
