import { generateDemoPatients, generateDemoVisits } from './demoData';

// Mock delay to simulate network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock patient management API
const patientService = {
  // Get all patients
  getAllPatients: async (params = {}) => {
    await delay(500);
    const patients = generateDemoPatients(50);
    
    // Filter patients if search param is provided
    const filteredPatients = params.search 
      ? patients.filter(patient => 
          `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(params.search.toLowerCase()) ||
          patient.email.toLowerCase().includes(params.search.toLowerCase()) ||
          patient.phone.includes(params.search) ||
          patient.id.toLowerCase().includes(params.search.toLowerCase())
        )
      : patients;
    
    // Sort patients if sortBy is provided
    if (params.sortBy) {
      const [field, order] = params.sortBy.split(':');
      filteredPatients.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return order === 'desc' ? comparison * -1 : comparison;
      });
    }
    
    // Paginate results
    const page = params.page || 0;
    const limit = params.limit || 10;
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
    
    return {
      patients: paginatedPatients,
      pagination: {
        total: filteredPatients.length,
        totalPages: Math.ceil(filteredPatients.length / limit),
        currentPage: page,
        limit
      }
    };
  },
  
  // Get patient by ID
  getPatientById: async (id) => {
    await delay(300);
    const patients = generateDemoPatients(50);
    const patient = patients.find(p => p.id === id);
    
    if (!patient) {
      throw new Error('Patient not found');
    }
    
    return patient;
  },
  
  // Create new patient
  createPatient: async (patientData) => {
    await delay(600);
    const newId = `PAT${1000 + Math.floor(Math.random() * 1000)}`;
    
    const newPatient = {
      id: newId,
      ...patientData,
      registrationDate: new Date().toISOString().split('T')[0],
      petCount: 0,
      lastVisit: null,
      pets: [],
      visits: []
    };
    
    return newPatient;
  },
  
  // Update patient
  updatePatient: async (id, patientData) => {
    await delay(500);
    const patients = generateDemoPatients(50);
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      throw new Error('Patient not found');
    }
    
    const updatedPatient = {
      ...patients[patientIndex],
      ...patientData,
      // Don't overwrite these fields unless explicitly provided
      id: id,
      pets: patients[patientIndex].pets,
      visits: patients[patientIndex].visits,
      registrationDate: patients[patientIndex].registrationDate
    };
    
    return updatedPatient;
  },
  
  // Delete patient
  deletePatient: async (id) => {
    await delay(400);
    return { success: true, message: 'Patient deleted successfully' };
  },
  
  // Get patient visits
  getPatientVisits: async (patientId) => {
    await delay(400);
    const visits = generateDemoVisits(patientId, Math.floor(Math.random() * 5) + 1);
    return visits;
  }
};

export default {
  patients: patientService
}; 