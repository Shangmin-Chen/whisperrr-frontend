# Multi-stage build for React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and configuration files
COPY src ./src
COPY public ./public
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the application
RUN npm run build

# Development stage (for live reloading)
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy configuration files
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY public ./public

# Expose port
EXPOSE 3737

# Start development server
CMD ["npm", "start"]

# Production stage
FROM nginx:1.25-alpine AS production

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3737

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3737 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
