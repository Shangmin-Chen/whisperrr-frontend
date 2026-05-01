# Multi-stage build for React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./
COPY src ./src
COPY public ./public

RUN npm run build

# Development stage (for live reloading)
FROM node:20-alpine AS development

# Set working directory
WORKDIR /app

# Copy configuration files
COPY package.json package-lock.json ./
COPY tsconfig.json tailwind.config.js postcss.config.js vite.config.ts ./
COPY index.html ./
COPY public ./public

# Install all dependencies (including dev dependencies)
RUN npm ci

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
