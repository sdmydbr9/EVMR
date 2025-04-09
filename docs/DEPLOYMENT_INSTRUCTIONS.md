# EVMR System Deployment Instructions

This document provides detailed instructions for deploying the EVMR (Electronic Veterinary Medical Records) system using Docker Compose.

## Prerequisites

- Docker Engine (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git (for cloning the repository)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EVMR
```

### 2. Configure Environment Variables

The system requires environment variables to be set properly. A sample `.env.example` file is provided.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with appropriate values:
   ```bash
   # Important: Update the following values with secure passwords
   DB_PASSWORD=postgres        # Database password
   JWT_SECRET=<secure-random-string>
   ADMIN_PASSWORD=<secure-admin-password>
   SMTP_PASS=<mail-server-password>
   ```

### 3. Run the Deployment Script

A deployment script is provided to automate the build and deployment process:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Build the Docker images
- Start the database first and wait for it to be ready
- Start the main EVMR application
- Start the admin service
- Display logs and service status

### 4. Access the Applications

After successful deployment, you can access:

- **EVMR Application**: http://0.0.0.0:3786
- **Admin Service**: http://0.0.0.0:3789
- **Database**: Available on port 5431 (only accessible to the containers by default)

## Docker Compose Commands

- **Start all services**: `docker compose up -d`
- **Stop all services**: `docker compose down`
- **Restart services**: `docker compose restart`
- **View logs**: `docker compose logs -f`
- **View logs for specific service**: `docker compose logs -f [service-name]`
  - Available services: `evmr-app`, `evmr-admin`, `evmr-db`

## Data Persistence

The system uses Docker volumes for data persistence:

- `evmr-db-data`: Stores all PostgreSQL data
- `evmr-uploads`: Stores uploaded files (lab results, x-rays, etc.)
- `evmr-logs`: Stores application logs
- `evmr-admin-logs`: Stores admin service logs

These volumes ensure that your data persists even if the containers are stopped or removed.

## Security Considerations

1. In production, update all default passwords in the `.env` file
2. Consider using Docker secrets for sensitive information
3. Configure proper network security
4. Set up regular database backups by creating a backup script

## Troubleshooting

### Database Connection Issues

If the application can't connect to the database:
- Check the database logs: `docker compose logs evmr-db`
- Verify that the database password in the `.env` file matches the one in `docker-compose.yml`
- Ensure the database is fully initialized before starting the application

### Application Not Starting

If the application fails to start:
- Check application logs: `docker compose logs evmr-app`
- Ensure all required environment variables are set correctly in the `.env` file

### Admin Service Issues

If the admin service is not functioning:
- Check admin service logs: `docker compose logs evmr-admin`
- Verify that it can connect to the database
- Ensure the JWT_SECRET is consistent across all services