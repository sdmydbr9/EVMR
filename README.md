# EVMR: Electronic Veterinary Medical Records System

A comprehensive microservice-based application for managing veterinary practices, medical records, appointments, inventory, and clinic operations.

## Demo Users

The system includes built-in demo users that are dynamically created during system initialization:

- **Pet Parent**: petparent_demo@vetsphere.com / demodemo
- **Veterinarian**: vet_demo@vetsphere.com / demodemo (with dynamically generated VET ID)
- **Organization Admin**: org_demo@vetsphere.com / demodemo (with dynamically generated ORG ID)

To view the actual demo user credentials with their dynamically generated IDs:
```bash
# Docker environment
docker exec -it petsphere-application node /app/backend/docker-show-demo-users.js
```

## Automatic Demo Data

The system is pre-configured with comprehensive demo data for all three user types that is automatically loaded when you start the containers. All screens and features are populated with realistic data for testing and demonstration purposes.

**One-Click Setup**: Simply run `docker compose up -d` and all demo data will be automatically loaded!

```bash
# Start the Docker containers with demo data
docker compose up -d
```

No additional script execution is needed - the demo data is loaded automatically during container initialization.

## System Overview

EVMR is designed to streamline veterinary practice management with the following modules:

- **Patient Management**: Store and retrieve complete patient records
- **Electronic Medical Records**: SOAP format medical documentation
- **Appointment Scheduling**: Schedule and manage appointments
- **Inventory Management**: Track medications and supplies
- **Reporting & Analytics**: Generate insights from practice data
- **Multi-Location & User Management**: Support for multiple clinics and staff roles

## Architecture

### Tech Stack

- **Frontend**: React.js with Material UI
- **Backend**: Node.js with Express
- **Databases**: MongoDB (microservices) and PostgreSQL (legacy system)
- **Authentication**: JWT-based authentication with Redis caching
- **Containerization**: Docker and Docker Compose

### System Architecture

The system follows a microservice architecture pattern:

```
┌─────────────┐      ┌───────────────────────────────────────┐
│   React     │      │            API Gateway               │
│  Frontend   │<─────┤   (Main Backend Express Server)      │
└─────────────┘      └───────────────┬───────────────────────┘
                                     │
                 ┌──────────────────┼──────────────────────┐
                 │                  │                       │
        ┌────────V─────┐   ┌───────V────────┐    ┌────────V─────┐
        │ Auth Service  │   │ Patient Service│    │ Appointment  │
        │  (MongoDB)    │   │   (MongoDB)    │    │   Service    │
        └────────┬─────┘   └────────┬───────┘    └────────┬─────┘
                 │                  │                       │
                 │                  │                       │
        ┌────────V─────┐   ┌───────V────────┐    ┌────────V─────┐
        │  Inventory   │   │   Reporting    │    │ Notification  │
        │   Service    │   │    Service     │    │   Service     │
        └──────────────┘   └────────────────┘    └──────────────┘
                 │                  │                       │
                 └──────────────────┼───────────────────────┘
                                    │
                          ┌─────────V──────────┐
                          │    PostgreSQL      │
                          │    (Legacy DB)     │
                          └────────────────────┘
```

## Microservices

The system is composed of the following microservices:

- **Auth Service**: Handles user authentication, authorization, and user management
- **Patient Service**: Manages patient records and medical history
- **Appointment Service**: Handles scheduling and appointment management
- **Inventory Service**: Tracks medications, supplies, and inventory management
- **Reporting Service**: Generates reports and analytics
- **Notification Service**: Manages notifications and alerts

## Database Schema

The system uses both MongoDB (for microservices) and PostgreSQL (for legacy components):

### MongoDB Collections
- **users**: User accounts and authentication information
- **patients**: Patient records and medical history
- **appointments**: Appointment scheduling information
- **inventory**: Inventory and supply tracking

### PostgreSQL Tables (Legacy)
- **clinics**: Stores clinic location information
- **owners**: Stores pet owner details
- **users**: Stores staff accounts with role-based permissions
- **patients**: Stores pet/patient information
- **medical_records**: Stores SOAP format visit records
- **appointments**: Stores scheduling information
- **inventory_items**: Tracks clinic supplies and medications

## Prerequisites

- Docker and Docker Compose (for Docker setup)
- Node.js (>=18.0.0) and npm (for development)
- MongoDB (for microservices)
- PostgreSQL (for legacy components)
- Redis (for caching)

## Running the Application

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd EVMR
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   # Database configuration
   POSTGRES_USER=evmr_user
   POSTGRES_DB=evmr_database
   DB_PASSWORD=your_secure_password
   POSTGRES_HOST=petsphere-db
   POSTGRES_PORT=5432

   # Authentication
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRATION=24h
   REFRESH_TOKEN_EXPIRATION=7d

   # Application settings
   PORT=3786
   NODE_ENV=production
   APP_NAME=EVMR

   # Frontend configuration
   REACT_APP_API_URL=http://0.0.0.0:3786/api
   REACT_APP_BACKEND_URL=http://0.0.0.0:3786

   # MongoDB configuration
   MONGODB_URI=mongodb://mongodb:27017/evmr

   # Redis configuration
   REDIS_HOST=redis
   REDIS_PORT=7529

   # Microservices ports
   AUTH_SERVICE_PORT=5101
   PATIENT_SERVICE_PORT=5102
   APPOINTMENT_SERVICE_PORT=5103
   INVENTORY_SERVICE_PORT=5104
   REPORTING_SERVICE_PORT=5105
   NOTIFICATION_SERVICE_PORT=5106
   ```

3. Build and start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application at `http://0.0.0.0:3786`

### Container Structure

The Docker setup includes:

- **petsphere-app**: Main application container (API Gateway)
- **petsphere-db**: PostgreSQL database container
- **mongodb**: MongoDB database container
- **redis**: Redis cache container
- **auth-service**: Authentication microservice
- **patient-service**: Patient management microservice
- **appointment-service**: Appointment scheduling microservice
- **inventory-service**: Inventory management microservice
- **reporting-service**: Reporting and analytics microservice
- **notification-service**: Notification microservice

## API Endpoints

The system provides the following RESTful API endpoints:

### Authentication Service
- `POST /api/auth/login`: Authenticate user and get JWT token
- `POST /api/auth/register`: Register new user (admin approval required)
- `POST /api/auth/refresh`: Refresh access token
- `GET /api/auth/verify`: Verify token validity
- `GET /api/auth/demo-credentials`: Get demo user credentials

### Patient Service
- `GET /api/patients`: List all patients
- `GET /api/patients/:id`: Get patient details
- `POST /api/patients`: Create new patient
- `PUT /api/patients/:id`: Update patient
- `DELETE /api/patients/:id`: Delete patient (soft delete)
- `POST /api/patients/:id/medical-history`: Add medical history entry
- `POST /api/patients/:id/vaccinations`: Add vaccination record
- `POST /api/patients/:id/allergies`: Add allergy information
- `POST /api/patients/:id/medications`: Add medication information

### Medical Records
- `GET /api/medical-records`: Get all medical records
- `GET /api/medical-records/patient/:id`: Get patient's medical records
- `GET /api/medical-records/:id`: Get specific medical record
- `POST /api/medical-records`: Create new medical record
- `PUT /api/medical-records/:id`: Update medical record

### Appointment Service
- `GET /api/appointments`: List appointments
- `GET /api/appointments/:id`: Get appointment details
- `POST /api/appointments`: Schedule new appointment
- `PUT /api/appointments/:id`: Update appointment
- `DELETE /api/appointments/:id`: Cancel appointment
- `GET /api/appointments/doctor/:id`: Get doctor's appointments
- `GET /api/appointments/patient/:id`: Get patient's appointments

### Inventory Service
- `GET /api/inventory`: List inventory items
- `POST /api/inventory`: Add inventory item
- `PUT /api/inventory/:id`: Update inventory item
- `DELETE /api/inventory/:id`: Remove inventory item
- `GET /api/inventory/low-stock`: Get low stock items
- `POST /api/inventory/:id/restock`: Restock inventory item

### Reporting Service
- `GET /api/reports/daily`: Generate daily report
- `GET /api/reports/monthly`: Generate monthly report
- `GET /api/reports/revenue`: Generate revenue report
- `GET /api/reports/patient-visits`: Generate patient visits report
- `GET /api/reports/doctor-workload`: Generate doctor workload report

## Frontend Structure

The React frontend is organized as follows:

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Common components (Login, ProtectedRoute, etc.)
│   │   ├── layout/      # Layout components (AppLayout, etc.)
│   │   ├── petParent/   # Pet parent specific components
│   │   ├── veterinarian/ # Veterinarian specific components
│   │   └── organisation/ # Organization specific components
│   ├── services/        # API service functions
│   ├── context/         # React context providers
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── App.jsx          # Main application component
│   └── index.jsx        # Application entry point
```

### Key Features

- Responsive design for desktop and mobile
- Role-based access control (Pet Parent, Veterinarian, Organization)
- Interactive appointment scheduler with calendar view
- SOAP format medical record creation and management
- Inventory tracking with low-stock alerts
- Comprehensive reporting and analytics dashboard
- Multi-location support for veterinary practices

## Development

### Environment Setup

1. Install dependencies for all services:
   ```bash
   npm run install:all
   ```

2. Configure your development environment:
   - Set up MongoDB database
   - Set up PostgreSQL database
   - Set up Redis cache
   - Create appropriate `.env` files

### Available Scripts

- `npm start`: Start both frontend and backend in development mode
- `npm run start:backend`: Start only the backend service
- `npm run start:frontend`: Start only the frontend service
- `npm run install:all`: Install dependencies for all services
- `npm run build`: Build the frontend for production

## Microservices Structure

### Main Backend (API Gateway)
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
└── server.js        # Main server file
```

### Auth Service
```
services/auth-service/
├── src/
│   ├── config/      # Configuration files
│   ├── middleware/  # Express middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── index.js     # Service entry point
```

### Patient Service
```
services/patient-service/
├── src/
│   ├── middleware/  # Express middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── index.js     # Service entry point
```

### Appointment Service
```
services/appointment-service/
├── src/
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── index.js     # Service entry point
```

## Security Features

- JWT-based authentication with token refresh
- Password hashing with bcrypt
- Role-based access control
- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting for API endpoints
- Redis for token blacklisting and session management

## Deployment

For production deployment:

1. Ensure your `.env` file contains production-ready settings
2. Build and start containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```

## Backup and Restore

### PostgreSQL Backup

```bash
docker exec petsphere-database pg_dump -U evmr_user -d evmr_database > postgres_backup.sql
```

### MongoDB Backup

```bash
docker exec mongodb mongodump --out /data/backup
docker cp mongodb:/data/backup ./mongodb_backup
```

### Restore PostgreSQL

```bash
cat postgres_backup.sql | docker exec -i petsphere-database psql -U evmr_user -d evmr_database
```

### Restore MongoDB

```bash
docker cp ./mongodb_backup mongodb:/data/backup
docker exec mongodb mongorestore /data/backup
```

## Admin Service

The system includes an admin service for user registration approval and system administration:

- **URL**: http://0.0.0.0:3789
- **Credentials**: Use the admin credentials defined in your `.env` file

## Troubleshooting

### Common Issues

- **Database Connection Issues**: Verify database credentials and connection strings
- **Container Startup Failures**: Check logs with `docker-compose logs`
- **API Errors**: Verify services are running with health checks
  ```bash
  curl http://0.0.0.0:3786/health  # Main application
  curl http://0.0.0.0:5101/health  # Auth service
  curl http://0.0.0.0:5102/health  # Patient service
  curl http://0.0.0.0:5103/health  # Appointment service
  ```
- **Microservice Communication Issues**: Check network connectivity between containers

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.