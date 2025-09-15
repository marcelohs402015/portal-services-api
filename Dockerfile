# 🚀 Portal Services - Railway Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY appserver/package*.json ./appserver/
COPY appclient/package*.json ./appclient/

# Install dependencies
RUN npm ci
RUN cd appserver && npm ci
RUN cd ../appclient && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN cd appserver && npm run build
RUN cd ../appclient && npm run build

# Expose port
EXPOSE 10000

# Start the server
CMD ["cd", "appserver", "&&", "npm", "start"]
