# Multi-stage Dockerfile for building and serving the Vite+Vue app

# --- Builder stage: install deps and build static assets ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest and build
COPY . .
RUN npm run build

# --- Runtime stage: serve with nginx ---
FROM nginx:alpine AS runtime

# Use default Nginx config (no custom config required)

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default nginx port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

