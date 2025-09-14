# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && npm install -g typescript

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variable to accept connections from any host
ENV HOST=0.0.0.0

# Start the application in development mode
CMD ["npm", "run", "dev"]