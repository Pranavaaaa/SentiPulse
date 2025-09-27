# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy frontend package files
COPY client/package*.json ./client/
WORKDIR /app/client

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY client/ ./

# Build frontend
RUN npm run build

# Backend stage
FROM node:18-alpine AS backend

# Install Python and build dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    opencv-dev \
    pkgconfig

# Set working directory
WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Python requirements and install dependencies
COPY python_services/requirements.txt ./python_services/
RUN pip3 install --no-cache-dir -r python_services/requirements.txt

# Copy Python services
COPY python_services/ ./python_services/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy server files
COPY server/ ./server/

# Create uploads directory
RUN mkdir -p server/uploads

# Expose ports
EXPOSE 3000 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server/index.js"]
