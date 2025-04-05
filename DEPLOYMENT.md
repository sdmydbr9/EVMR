# EVMR Deployment Guide

This guide explains how to deploy the Electronic Veterinary Medical Records (EVMR) system using Docker and Docker Compose.

## Prerequisites

- Docker Engine (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git (to clone the repository)

## Deployment Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd EVMR
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to set secure values for:
   - `DB_PASSWORD`: A strong password for the PostgreSQL database
   - `JWT_SECRET`: A random string for JWT token signing
   - `ADMIN_PASSWORD`: Initial admin user password
   - `SMTP_PASS`: Password for email notifications

3. **Build and start the containers**:
   ```bash
   docker-compose up -d
   ```

4. **Verify the deployment**:
   ```bash
   # Check if containers are running
   docker-compose ps
   
   # Check application logs
   docker-compose logs -f evmr-app
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3786`

## Project Structure

The EVMR system follows a structured organization:

```
evmr/
├── backend/                        # Contains the server-side application code
│   ├── package.json                # Backend dependencies and scripts
│   ├── server.js                   # Main server entry point
│   ├── routes/                     # API route definitions
│   ├── controllers/                # Business logic handlers 
│   ├── models/                     # Database models
│   ├── middleware/                 # Custom middleware functions
│   └── config/                     # Backend configuration files
│
├── frontend/                       # Contains the client-side application code
│   ├── package.json                # Frontend dependencies and scripts
│   ├── public/                     # Static files
│   └── src/                        # Frontend source code
│
├── config/                         # Shared configuration files
├── Dockerfile                      # Multi-stage Dockerfile
├── docker-compose.yml              # Container orchestration configuration
└── .env                            # Environment variables file
```

## Component Structure

The deployment consists of two main containers:

- **evmr-app**: Node.js application serving both backend API and frontend interface
- **evmr-db**: PostgreSQL database storing all system data

## Persistent Data

The following volumes maintain data persistence:

- **evmr-db-data**: Stores all database records
- **evmr-uploads**: Stores uploaded files (lab results, images, documents)
- **evmr-logs**: Stores application logs

## Maintenance

### Database Backup

```bash
# Backup the database
docker exec evmr-database pg_dump -U evmr_user evmr_database > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_file.sql | docker exec -i evmr-database psql -U evmr_user -d evmr_database
```

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker compose down
docker compose up -d --build
```

## Troubleshooting

- **Database connection issues**: Verify PostgreSQL container is running and environment variables are set correctly
- **Application errors**: Check application logs with `docker-compose logs evmr-app`
- **Permission issues**: Ensure volumes have correct permissions

## Security Considerations

- Change default credentials in the `.env` file
- Secure the PostgreSQL port (5432) if exposed in production
- Consider using a reverse proxy like Nginx for SSL termination in production
- Set up proper firewall rules to only allow access to port 3786 from trusted sources 