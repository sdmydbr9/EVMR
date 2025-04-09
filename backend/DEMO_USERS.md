# EVMR Demo Users

This document explains the demo user accounts available in the EVMR system.

## Available Demo Users

The following demo user accounts are automatically created when the application starts:

1. **Pet Parent**
   - Email: petparent_demo@evmr.com
   - Password: demodemo
   - Role: client

2. **Veterinarian**
   - Email: vet_demo@evmr.com
   - Password: demodemo
   - Role: veterinarian
   - VET ID: Auto-generated (see instructions below to find it)

3. **Organization Admin**
   - Email: org_demo@evmr.com
   - Password: demodemo
   - Role: admin
   - ORG ID: Auto-generated (see instructions below to find it)

## Viewing Demo User Credentials

To view the demo user credentials including the auto-generated VET ID and ORG ID, run:

```bash
# For local environment
node show-demo-users.js

# For Docker environment
docker exec -it evmr-application node show-demo-users.js
```

This will display all the demo users with their login details.

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
4. Enter the VET ID shown when running the show-demo-users.js script
5. Click "Log In"

### Organization Admin Login
1. Select "Institute Admin" option on the login screen
2. Enter the email: org_demo@evmr.com
3. Enter the password: demodemo
4. Enter the ORG ID shown when running the show-demo-users.js script
5. Click "Log In"

## Notes

- These demo users are intended for testing and demonstration purposes only
- The demo accounts have full access to their respective role functionalities
- Each time the application is restarted, the same demo users are used, but VET ID and ORG ID values may change
- Never use these demo accounts in a production environment 