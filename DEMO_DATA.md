# EVMR Demo Data

This document explains the demo data automatically loaded in the EVMR system.

## Available Demo Users

The system includes built-in demo users for testing purposes:

- **Pet Parent**: petparent_demo@evmr.com / demodemo
- **Veterinarian**: vet_demo@evmr.com / demodemo (VET ID: VET12345)
- **Organization Admin**: org_demo@evmr.com / demodemo (ORG ID: ORG12345)

## Automatic Demo Data Loading

The demo data is **automatically loaded** when you start the Docker containers. No additional steps are required!

```bash
# Simply run
docker compose up -d
```

All demo data will be initialized automatically during the PostgreSQL container startup.

## Viewing Demo User Credentials

To view the demo user credentials:

```bash
docker exec -it evmr-application node /app/backend/docker-show-demo-users.js
```

## Demo Data Included

The demo data includes:

- **Users**: Pet parent, veterinarian, and admin users
- **Clinic**: EVMR Demo Clinic with contact information
- **Patients/Pets**: Several pets of different species with owners
- **Appointments**: Scheduled and completed appointments
- **Inventory**: Medications, vaccines, and supplies
- **Medical Records**: SOAP-format medical records for some patients

## Login Instructions

### Pet Parent Login
1. Select "Pet Parent" option on the login screen
2. Enter the email: petparent_demo@evmr.com
3. Enter the password: demodemo
4. Click "Log In"

### Veterinarian Login
1. Select "Veterinarian" option on the login screen
2. Enter the email: vet_demo@evmr.com
3. Enter the password: demodemo
4. Enter the VET ID: VET12345
5. Click "Log In"

### Organization Admin Login
1. Select "Institute Admin" option on the login screen
2. Enter the email: org_demo@evmr.com
3. Enter the password: demodemo
4. Enter the ORG ID: ORG12345
5. Click "Log In"

## Manual Data Manipulation

If you need to make changes to the demo data or add more data, you can connect to the PostgreSQL database:

```bash
docker exec -it evmr-database psql -U evmr_user -d evmr_database
```

## Resetting Demo Data

To reset the demo data, you can:

1. Remove the Docker volumes:
   ```bash
   docker compose down -v
   ```

2. Restart the EVMR containers:
   ```bash
   docker compose up -d
   ```

The demo data will be automatically reloaded during container initialization.

## Troubleshooting

If you encounter issues with the demo data:

1. Make sure the Docker containers are running:
   ```bash
   docker ps
   ```

2. Check the logs for errors:
   ```bash
   docker logs evmr-database
   docker logs evmr-application
   ```

3. If the demo data doesn't appear to be loaded, try resetting the containers:
   ```bash
   docker compose down -v
   docker compose up -d
   ``` 