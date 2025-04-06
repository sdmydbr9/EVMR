FROM node:18-alpine

# Set working directory
WORKDIR /app/admin-service

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Create and set permissions on logs directory
RUN mkdir -p /app/admin-service/logs && chmod 777 /app/admin-service/logs

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3789

# Expose the port the app runs on
EXPOSE 3789

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3789/health || exit 1

# Run the application
CMD ["node", "server.js"] 