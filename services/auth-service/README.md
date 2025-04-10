# Authentication Service

The Authentication Service is a microservice responsible for handling user authentication and authorization in the PetSphere system. It provides JWT-based authentication, user management, and role-based access control.

## Features

- User registration and login
- JWT token generation and validation
- Role-based access control (admin, vet, staff, client)
- Session management with Redis
- User profile management
- Secure password handling with bcrypt

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## Environment Variables

The service requires the following environment variables:

```
PORT=5101
NODE_ENV=development
MONGODB_URI=mongodb://mongodb:27017/auth-service
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
REDIS_HOST=redis
REDIS_PORT=7529
LOG_LEVEL=info
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service in development mode:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Docker

The service can be run using Docker:

```bash
docker-compose up auth-service
```

## Health Check

The service provides a health check endpoint:

```
GET /health
```

Returns:
```json
{
  "status": "OK"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens are signed with a secret key
- Redis is used for session management
- Helmet is used for security headers
- Input validation using Joi
- Rate limiting for API endpoints

## Dependencies

- Express.js - Web framework
- MongoDB - Database
- Redis - Session management
- JWT - Token-based authentication
- bcryptjs - Password hashing
- Winston - Logging
- Joi - Input validation
- Helmet - Security headers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 