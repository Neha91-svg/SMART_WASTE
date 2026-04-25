# Use Node.js for backend and frontend build
FROM node:22-slim AS build

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install

# Build frontend
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Setup server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/

# --- Final Image ---
FROM node:22-slim

WORKDIR /app

# Copy built server and frontend
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/server
EXPOSE 5000

CMD ["node", "server.js"]
