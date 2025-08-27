# Use official Node.js LTS image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Copy package.json for production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Add entrypoint to run migrations then start
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Expose the port (default NestJS port)
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
