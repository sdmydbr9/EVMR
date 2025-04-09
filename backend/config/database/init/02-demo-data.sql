-- Demo data for EVMR system
-- This script adds sample data for the three types of users: Pet Parent, Veterinarian, and Admin

-- Insert demo clinic
INSERT INTO clinics (name, address, phone, email)
VALUES ('EVMR Demo Clinic', '123 Veterinary Lane, Demo City', '555-123-4567', 'demo-clinic@evmr.com')
ON CONFLICT DO NOTHING;

-- Insert demo users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  role VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add three demo users with hashed 'demodemo' passwords
-- Note: In a real production system, passwords would be hashed with bcrypt
INSERT INTO users (name, email, password_hash, role, details)
VALUES 
  ('Pet Parent Demo', 'petparent_demo@evmr.com', '$2a$10$K4iYhOXBl2yBWq1zs7T7F.dVlxuaoq5TA/zbL6HJGrnFdyQNgV4Y2', 'client', '{"phone": "555-111-2222", "address": "456 Pet Owner St, Demo City"}'),
  ('Veterinarian Demo', 'vet_demo@evmr.com', '$2a$10$K4iYhOXBl2yBWq1zs7T7F.dVlxuaoq5TA/zbL6HJGrnFdyQNgV4Y2', 'veterinarian', '{"unique_id": "VET12345", "specialization": "Small Animals", "license_number": "DVM-12345", "clinic_id": 1}'),
  ('Admin Demo', 'org_demo@evmr.com', '$2a$10$K4iYhOXBl2yBWq1zs7T7F.dVlxuaoq5TA/zbL6HJGrnFdyQNgV4Y2', 'admin', '{"organisation_id": "ORG12345", "clinic_id": 1, "permissions": ["manage_users", "manage_clinics", "view_reports"]}')
ON CONFLICT (email) DO NOTHING;

-- Insert demo pet owners
INSERT INTO owners (name, phone, email, address)
VALUES 
  ('John Demo', '555-111-2222', 'john.demo@example.com', '123 Pet Owner St, Demo City'),
  ('Jane Demo', '555-333-4444', 'jane.demo@example.com', '456 Animal Lover Ave, Demo City'),
  ('Alex Demo', '555-555-6666', 'alex.demo@example.com', '789 Furry Friend Blvd, Demo City')
ON CONFLICT DO NOTHING;

-- Insert demo patients/pets
INSERT INTO patients (name, species, breed, date_of_birth, gender, color, weight, microchip_id, owner_id, clinic_id)
VALUES
  ('Max', 'Dog', 'Labrador Retriever', '2020-03-15', 'Male', 'Golden', 32.5, 'CHIP123456', 1, 1),
  ('Bella', 'Dog', 'German Shepherd', '2021-05-10', 'Female', 'Black and Tan', 28.7, 'CHIP234567', 1, 1),
  ('Oliver', 'Cat', 'Domestic Shorthair', '2019-11-22', 'Male', 'Orange Tabby', 4.2, 'CHIP345678', 2, 1),
  ('Luna', 'Cat', 'Siamese', '2022-01-05', 'Female', 'Seal Point', 3.8, 'CHIP456789', 2, 1),
  ('Rocky', 'Dog', 'Bulldog', '2018-07-30', 'Male', 'Brindle', 24.3, 'CHIP567890', 3, 1),
  ('Charlie', 'Bird', 'Parakeet', '2021-09-12', 'Male', 'Blue', 0.1, NULL, 3, 1)
ON CONFLICT DO NOTHING;

-- Create service types table if not exists
CREATE TABLE IF NOT EXISTS service_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price NUMERIC(10,2),
  clinic_id INTEGER REFERENCES clinics(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo service types
INSERT INTO service_types (name, description, duration, price, clinic_id)
VALUES
  ('Wellness Exam', 'Regular health check-up and preventive care', 30, 50.00, 1),
  ('Vaccination', 'Administration of vaccines', 15, 25.00, 1),
  ('Dental Cleaning', 'Professional teeth cleaning under anesthesia', 60, 120.00, 1),
  ('Surgery - Spay/Neuter', 'Reproductive sterilization procedure', 90, 200.00, 1),
  ('X-Ray', 'Radiographic imaging', 45, 75.00, 1)
ON CONFLICT DO NOTHING;

-- Create inventory table if not exists
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_per_unit NUMERIC(10,2),
  minimum_quantity INTEGER NOT NULL,
  clinic_id INTEGER REFERENCES clinics(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo inventory items
INSERT INTO inventory_items (name, description, category, quantity, unit, price_per_unit, minimum_quantity, clinic_id)
VALUES
  ('Rabies Vaccine', 'For immunization against rabies', 'Vaccine', 50, 'dose', 15.00, 10, 1),
  ('Amoxicillin 250mg', 'Broad-spectrum antibiotic', 'Medication', 200, 'tablet', 0.75, 50, 1),
  ('Gauze Pads 4x4', 'Sterile dressing for wounds', 'Supply', 500, 'piece', 0.25, 100, 1),
  ('Flea & Tick Prevention - Small Dog', 'Monthly topical treatment', 'Medication', 30, 'application', 12.50, 5, 1),
  ('Surgical Gloves', 'Sterile gloves for procedures', 'Supply', 100, 'pair', 1.25, 20, 1)
ON CONFLICT DO NOTHING;

-- Create appointments table if not exists
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  service_id INTEGER REFERENCES service_types(id),
  scheduled_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'scheduled', 'completed', 'cancelled', 'no-show'
  notes TEXT,
  clinic_id INTEGER REFERENCES clinics(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo appointments
INSERT INTO appointments (patient_id, service_id, scheduled_date, status, notes, clinic_id)
VALUES
  (1, 1, NOW() + INTERVAL '1 day', 'scheduled', 'Annual wellness check', 1),
  (2, 2, NOW() + INTERVAL '2 days', 'scheduled', 'Due for rabies vaccination', 1),
  (3, 1, NOW() + INTERVAL '3 days', 'scheduled', 'Weight loss concern', 1),
  (4, 3, NOW() + INTERVAL '5 days', 'scheduled', 'Tartar buildup on teeth', 1),
  (5, 4, NOW() + INTERVAL '7 days', 'scheduled', 'Scheduled neutering procedure', 1),
  (6, 1, NOW() - INTERVAL '1 day', 'completed', 'Annual checkup completed', 1)
ON CONFLICT DO NOTHING;

-- Create medical_records table if not exists
CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  visit_date TIMESTAMP NOT NULL,
  subjective TEXT, -- S in SOAP
  objective TEXT, -- O in SOAP
  assessment TEXT, -- A in SOAP
  plan TEXT, -- P in SOAP
  vet_id INTEGER REFERENCES users(id),
  clinic_id INTEGER REFERENCES clinics(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo medical records
INSERT INTO medical_records (patient_id, visit_date, subjective, objective, assessment, plan, vet_id, clinic_id)
VALUES
  (1, NOW() - INTERVAL '30 days', 'Owner reports Max has been lethargic and not eating well for 2 days', 'Temperature: 103.2°F, HR: 100, RR: 24. Mild dehydration. Tender on abdominal palpation.', 'Suspect gastroenteritis, possible dietary indiscretion', 'Subcutaneous fluids administered. Prescribed metronidazole 250mg BID for 7 days. Bland diet for 5 days. Recheck if not improving in 48 hours.', 2, 1),
  
  (3, NOW() - INTERVAL '15 days', 'Annual wellness exam. No concerns reported by owner.', 'Weight: 4.2kg (stable). Temperature: 101.5°F, HR: 160, RR: 28. Dental tartar present. Otherwise normal exam.', 'Healthy adult cat with early dental disease', 'Recommended dental cleaning in next 3-6 months. FVRCP booster administered. Monthly flea preventative dispensed.', 2, 1),
  
  (5, NOW() - INTERVAL '45 days', 'Owner concerned about skin rash and itching for past week', 'Multiple erythematous, pruritic lesions on ventral abdomen and axillary regions. Mild secondary excoriation present.', 'Allergic dermatitis, likely environmental trigger', 'Prescribed prednisone 10mg daily for 5 days, then 5mg daily for 5 days. Recommended hypoallergenic shampoo weekly. Discussed environmental management.', 2, 1)
ON CONFLICT DO NOTHING; 