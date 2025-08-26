# Dockerfile for youtaab-hotel-front (Vite + React + PM2)

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
RUN npm install -g pm2 serve
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Serve the build with PM2
CMD ["pm2-runtime", "serve", "dist", "5000", "--spa"]

EXPOSE 5000
