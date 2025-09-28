# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for SQLite and mDNS
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    avahi-dev \
    avahi-tools \
    dbus \
    curl

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install backend dependencies
RUN npm install

# Install frontend dependencies and build
COPY client/ ./client/
RUN cd client && npm install && npm run build

# Copy server code
COPY server/ ./server/
COPY README.md ./

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/chat.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/messages || exit 1

# Start the application
CMD ["node", "server/index.js"]
