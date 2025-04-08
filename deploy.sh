#!/bin/bash

# EVMR Deployment Script
# This script builds and deploys the EVMR system using Docker Compose

# Set script to exit on error
set -e

echo "===== EVMR System Deployment ====="
echo "Starting deployment process..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "ERROR: .env file not found!"
  echo "Please create a .env file with all required variables. You can use .env.example as a template."
  exit 1
fi

# Make sure Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Docker is not running or not accessible!"
  echo "Please start Docker and try again."
  exit 1
fi

# Stop and remove any existing containers
echo "Stopping and removing any existing containers..."
docker compose down

# Build the images
echo "Building Docker images..."
docker compose build

# Start the database first
echo "Starting database service..."
docker compose up -d evmr-db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10
until docker compose exec -T evmr-db pg_isready -U "${POSTGRES_USER:-evmr_user}" -d "${POSTGRES_DB:-evmr_database}" 2>/dev/null; do
  echo "Database is not ready yet. Waiting 5 seconds..."
  sleep 5
done
echo "Database is ready!"

# Start the main application
echo "Starting EVMR application service..."
docker compose up -d evmr-app

# Start the admin service
echo "Starting Admin service..."
docker compose up -d evmr-admin

# Check if services are running
echo "Checking service status..."
docker compose ps

# Display logs for each service
echo "Displaying logs for database..."
docker compose logs --tail=20 evmr-db

echo "Displaying logs for EVMR application..."
docker compose logs --tail=20 evmr-app

echo "Displaying logs for Admin service..."
docker compose logs --tail=20 evmr-admin

# Display deployment information
echo "===== Deployment Complete! ====="
echo "EVMR Application should be running at: http://localhost:3786"
echo "Admin Service should be running at: http://localhost:3789"
echo "Database is running on port: 5431"
echo ""
echo "Service status:"
docker compose ps

# Display logs
echo ""
echo "To view logs for all services, run: docker compose logs -f"
echo "To view logs for a specific service, run: docker compose logs -f [service-name]"
echo "  Available services: evmr-app, evmr-admin, evmr-db"
echo ""
echo "To stop all services, run: docker compose down"
echo "To restart all services, run: docker compose restart" 