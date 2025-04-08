# Electronic Veterinary Medical Records (EVMR) System

A comprehensive full-stack application for managing electronic veterinary medical records, appointments, inventory, and clinic operations.

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
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Containerization**: Docker and Docker Compose

### System Architecture

```
┌─────────────┐      ┌─────────────┐     ┌────────────────┐
│   React     │──────│   Express   │─────│   PostgreSQL   │
│  Frontend   │<─────│   Backend   │<────│    Database    │
└─────────────┘      └─────────────┘     └────────────────┘
      │                    │                     │
      │                    │                     │
┌─────V────────────────────V─────────────────────V─────┐
│                   Docker Containers                   │
└─────────────────────────────────────────────────────┘
```

## Database Schema

The system uses the following database tables:

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
- PostgreSQL (for non-Docker development)

## Running the Application

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd evmr
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   # Database configuration
   DB_PASSWORD=your_secure_password

   # Authentication
   JWT_SECRET=your_secure_jwt_secret

   # Application settings
   PORT=3786
   NODE_ENV=production

   # Frontend configuration
   REACT_APP_API_URL=http://0.0.0.0:3786/api
   REACT_APP_BACKEND_URL=http://0.0.0.0:3786
   ```

3. Build and start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application at `http://0.0.0.0:3786`

### Container Structure

The Docker setup includes:

- **evmr-app**: Combined frontend and backend container
- **evmr-db**: PostgreSQL database container

## API Endpoints

The system provides the following RESTful API endpoints:

### Authentication
- `POST /api/users/login`: Authenticate user and get JWT token
- `POST /api/users/register`: Register new user (admin only)

### Patients
- `GET /api/patients`: List all patients
- `GET /api/patients/:id`: Get patient details
- `POST /api/patients`: Create new patient
- `PUT /api/patients/:id`: Update patient
- `DELETE /api/patients/:id`: Delete patient

### Medical Records
- `GET /api/emr/patient/:id`: Get patient's medical records
- `GET /api/emr/:id`: Get specific medical record
- `POST /api/emr`: Create new medical record
- `PUT /api/emr/:id`: Update medical record

### Appointments
- `GET /api/appointments`: List appointments
- `POST /api/appointments`: Schedule new appointment
- `PUT /api/appointments/:id`: Update appointment
- `DELETE /api/appointments/:id`: Cancel appointment

### Inventory
- `GET /api/inventory`: List inventory items
- `POST /api/inventory`: Add inventory item
- `PUT /api/inventory/:id`: Update inventory item
- `DELETE /api/inventory/:id`: Remove inventory item

### Reports
- `GET /api/reports/daily`: Generate daily report
- `GET /api/reports/monthly`: Generate monthly report

## Frontend Structure

The React frontend is organized as follows:

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API service functions
│   ├── context/         # React context providers
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
```

### Key Features

- Responsive design for desktop and mobile
- Role-based access control
- Interactive appointment scheduler
- SOAP format medical record creation
- Inventory tracking with low-stock alerts
- Comprehensive reporting

## Development

### Environment Setup

1. Install dependencies for all services:
   ```bash
   npm run install:all
   ```

2. Configure your development environment:
   - Set up PostgreSQL database
   - Create appropriate `.env` files

### Available Scripts

- `npm start`: Start both frontend and backend in development mode
- `npm run start:backend`: Start only the backend service
- `npm run start:frontend`: Start only the frontend service
- `npm run install:all`: Install dependencies for all services
- `npm run build`: Build the frontend for production

## Backend Structure

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

## Security Features

- JWT-based authentication
- Password hashing
- Role-based access control
- Helmet.js for HTTP headers security
- CORS configuration

## Deployment

For production deployment:

1. Ensure your `.env` file contains production-ready settings
2. Build and start containers in detached mode:
   ```bash
   docker-compose up -d --build
   ```

## Backup and Restore

The system uses PostgreSQL volumes for data persistence. To backup:

```bash
docker exec evmr-database pg_dump -U evmr_user -d evmr_database > backup.sql
```

To restore:

```bash
cat backup.sql | docker exec -i evmr-database psql -U evmr_user -d evmr_database
```

## Troubleshooting

### Common Issues

- **Database Connection Issues**: Verify PostgreSQL credentials and connection string
- **Container Startup Failures**: Check logs with `docker-compose logs`
- **API Errors**: Verify backend is running with `curl http://0.0.0.0:3786/health`

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.