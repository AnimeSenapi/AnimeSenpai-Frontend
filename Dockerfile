# Multi-stage build for AnimeSenpai Frontend
FROM oven/bun:1.0.0-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1.0.0-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    curl \
    tini \
    dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S animesenpai -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb

# Install production dependencies
RUN bun install --frozen-lockfile --production

# Set ownership
RUN chown -R animesenpai:nodejs /app
USER animesenpai

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Use tini as init system
ENTRYPOINT ["tini", "--"]

# Start the application
CMD ["bun", "run", "start"]
