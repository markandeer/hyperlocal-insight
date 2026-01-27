FROM node:22-alpine

# 1) Install deps for the server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# 2) Copy the rest of the server code
COPY server/ ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
pm start"]
