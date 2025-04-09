# Components Directory Structure

This directory contains all React components organized by user type and functionality.

## Directory Structure

### User Type Based Components

- `petParent/` - Components specific to pet parent users
  - `forms/` - Forms used by pet parents
  - `index.js` - Barrel file for easier imports

- `veterinarian/` - Components specific to veterinarian users
  - `forms/` - Forms used by veterinarians
  - `index.js` - Barrel file for easier imports

- `organisation/` - Components specific to organisation users (vet clinics/hospitals)
  - `forms/` - Forms used by organisation users
  - `dashboard/` - Dashboard components for organisation analytics and management
  - `index.js` - Barrel file for easier imports

### Shared Components

- `common/` - Shared components used across the application
  - `index.js` - Barrel file for easier imports

- `layout/` - Layout components (AppLayout, etc.)
  - `index.js` - Barrel file for easier imports

## Role Clarification

- **Pet Parent**: Pet owners who can schedule appointments, view their pets' records, etc.
- **Veterinarian**: Doctors who manage patient visits, medical records, etc.
- **Organisation**: Vet clinics/hospitals that manage inventory, staff, schedules, etc.
- **Admin**: System administrators who handle registration/approval (runs on a separate service on port 3789)

## Using Components

Import components using the barrel files to keep imports clean:

```jsx
// Instead of:
import PetParentDashboard from './components/petParent/PetParentDashboard';
import VaccinationForm from './components/petParent/forms/VaccinationForm';

// Use:
import { PetParentDashboard, VaccinationForm } from './components/petParent';
```

This structure makes it easier to:
1. Find components based on user type
2. Maintain related components together
3. Understand which components are used by which user types
4. Share common code between different user types 