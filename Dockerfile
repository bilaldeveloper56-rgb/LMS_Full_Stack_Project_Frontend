# Stage 1 (builder)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2 (production)
FROM node:20-alpine AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY package*.json ./
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
