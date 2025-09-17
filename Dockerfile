# Portal Services API - Production Dockerfile for Render
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY appserver/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY appserver/ .

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files to reduce image size
RUN rm -rf src/ tsconfig*.json *.md docs/ tests/ && \
    rm -rf node_modules/@types && \
    npm prune --production

# Create logs directory
RUN mkdir -p logs

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Debug environment variables (remove in production)
RUN echo "🔍 Environment Debug:" && node debug-env.js

# Start the application
CMD ["node", "dist/server.js"]