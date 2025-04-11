# Stage 1: Build frontend assets
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
# Install frontend dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install --legacy-peer-deps && \
    npm install ajv@8.12.0

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Setup backend and combine with frontend
FROM node:18-alpine AS backend

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy backend source code
COPY backend/ ./

# Create directory for serving static files
RUN mkdir -p ./public

# Copy built frontend assets from the frontend-build stage
COPY --from=frontend-build /app/frontend/build ./public

# Copy documentation files to public directory
COPY docs/website ./public/docs/website

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3786
# Database connection will be provided at runtime via docker-compose
# JWT secret will be provided at runtime for security

# Expose the application port
EXPOSE 3786

# Health check to ensure application is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3786/health || exit 1

# Run the application
CMD ["node", "server.js"]

# This Dockerfile containerizes the EVMR system with its multiple modules:
# - Patient Management: Served through the backend API endpoints and frontend interface
# - Electronic Medical Records: Stored and retrieved via backend, displayed in frontend
# - Appointment Scheduling: Managed through backend services with frontend calendar views
# - Inventory Management: Tracked through database operations via backend API
# - Reporting & Analytics: Generated by backend and visualized in frontend
# - Multi-Location & User Management: Enforced through backend authorization middleware 
