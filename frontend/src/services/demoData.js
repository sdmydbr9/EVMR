// Helper function to generate random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString().split('T')[0];
};

// Helper function to pick a random item from an array
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Generate demo patients data
export const generateDemoPatients = (count = 50) => {
  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Jessica', 'Robert', 'Jennifer', 'William', 'Elizabeth', 'Richard', 'Linda', 'Charles'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Ave', 'Cedar Ln', 'Pine St', 'Elm Dr', 'Lake View Rd', 'River Rd'];
  
  return Array.from({ length: count }, (_, index) => {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const city = randomItem(cities);
    const street = randomItem(streets);
    const houseNumber = Math.floor(100 + Math.random() * 9900);
    const petCount = Math.floor(1 + Math.random() * 3);
    const hasVisited = Math.random() > 0.3;
    
    // Generate a date within the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const registrationDate = randomDate(oneYearAgo, new Date());
    
    // Generate last visit date possibly after registration date
    const lastVisit = hasVisited 
      ? randomDate(new Date(registrationDate), new Date()) 
      : null;
    
    return {
      id: `PAT${1000 + index}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1-555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      registrationDate,
      status: Math.random() > 0.2 ? 'active' : 'inactive',
      petCount,
      lastVisit,
      address: `${houseNumber} ${street}, ${city}`,
      pets: generateDemoPets(petCount, `PAT${1000 + index}`),
      visits: hasVisited ? generateDemoVisits(`PAT${1000 + index}`, Math.floor(1 + Math.random() * 5)) : []
    };
  });
};

// Generate demo pet data
export const generateDemoPets = (count = 3, ownerId) => {
  const petNames = ['Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Luna', 'Bailey', 'Daisy', 'Sadie', 'Rocky', 'Molly', 'Jack', 'Stella', 'Tucker', 'Chloe'];
  const species = ['Dog', 'Cat', 'Bird', 'Rabbit'];
  const dogBreeds = ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Boxer', 'Husky', 'Chihuahua', 'Shih Tzu'];
  const catBreeds = ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Bengal', 'Sphynx', 'British Shorthair', 'Scottish Fold', 'Abyssinian', 'Burmese'];
  const birdBreeds = ['Parakeet', 'Cockatiel', 'Canary', 'Finch', 'Parrot', 'Lovebird', 'Macaw', 'Conure', 'Budgie', 'Dove'];
  const rabbitBreeds = ['Holland Lop', 'Mini Rex', 'Dutch', 'Netherland Dwarf', 'Lionhead', 'Flemish Giant', 'Mini Lop', 'English Angora', 'Jersey Wooly', 'Rex'];
  const colors = ['Black', 'White', 'Brown', 'Gray', 'Golden', 'Spotted', 'Tabby', 'Calico', 'Tricolor', 'Brindle'];
  
  return Array.from({ length: count }, (_, i) => {
    const petSpecies = randomItem(species);
    let breed;
    
    // Choose appropriate breed based on species
    switch(petSpecies) {
      case 'Dog':
        breed = randomItem(dogBreeds);
        break;
      case 'Cat':
        breed = randomItem(catBreeds);
        break;
      case 'Bird':
        breed = randomItem(birdBreeds);
        break;
      case 'Rabbit':
        breed = randomItem(rabbitBreeds);
        break;
      default:
        breed = 'Mixed';
    }
    
    // Generate a birth date within appropriate age range for the species
    const now = new Date();
    let birthDate;
    switch(petSpecies) {
      case 'Dog':
      case 'Cat':
        // Dogs/cats typically live 10-15 years
        const oldestDate = new Date();
        oldestDate.setFullYear(now.getFullYear() - 15);
        birthDate = randomDate(oldestDate, now);
        break;
      case 'Bird':
        // Birds can live longer, up to 20 years
        const birdOldest = new Date();
        birdOldest.setFullYear(now.getFullYear() - 20);
        birthDate = randomDate(birdOldest, now);
        break;
      case 'Rabbit':
        // Rabbits typically live 8-12 years
        const rabbitOldest = new Date();
        rabbitOldest.setFullYear(now.getFullYear() - 12);
        birthDate = randomDate(rabbitOldest, now);
        break;
      default:
        birthDate = randomDate(new Date(now.getFullYear() - 10, 0, 1), now);
    }
    
    // Calculate age in years
    const ageDiff = new Date() - new Date(birthDate);
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    return {
      id: `PET${ownerId}-${i + 1}`,
      name: randomItem(petNames),
      species: petSpecies,
      breed,
      birthDate,
      age,
      color: randomItem(colors),
      weight: (Math.random() * 50 + 0.1).toFixed(1),
      microchip: Math.random() > 0.3 ? `MC${Math.floor(1000000000 + Math.random() * 9000000000)}` : null,
      vaccinationStatus: Math.random() > 0.2 ? 'up-to-date' : 'due',
      medicalConditions: Math.random() > 0.7 ? ['Allergies', 'Arthritis', 'Dental Disease'][Math.floor(Math.random() * 3)] : null
    };
  });
};

// Generate demo visit data
export const generateDemoVisits = (patientId, count = 5) => {
  const visitReasons = ['Routine Checkup', 'Vaccination', 'Injury Treatment', 'Surgery Follow-up', 'Dental Cleaning', 'Emergency Visit', 'Grooming', 'Wellness Exam', 'Allergy Treatment', 'X-ray'];
  const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis', 'Dr. Miller', 'Dr. Wilson', 'Dr. Moore', 'Dr. Taylor', 'Dr. Anderson'];
  const outcomes = ['Treated', 'Follow-up Needed', 'Referred', 'Recovered', 'Under Observation', 'Medication Prescribed', 'Surgery Scheduled', 'Tests Ordered', 'Monitoring', 'Hospitalized'];
  const notes = [
    'Patient is doing well. No concerns at this time.',
    'Prescribed medication for 7 days. Follow up if symptoms persist.',
    'Recommend follow-up visit in 2 weeks to check progress.',
    'Recovery progressing as expected. Continue current treatment plan.',
    'Referred to specialist for further evaluation.',
    'Blood work ordered. Results expected in 3-5 days.',
    'Patient responding well to treatment. Continue monitoring at home.',
    'Vaccination schedule updated. Next due in 1 year.',
    'Minor procedure performed successfully. No complications.',
    'Dental cleaning completed. No major issues found.'
  ];
  
  // Generate dates for visits within the last 2 years, sorted from newest to oldest
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  const visitDates = Array.from({ length: count }, () => 
    randomDate(twoYearsAgo, new Date())
  ).sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
  
  return visitDates.map((date, i) => ({
    id: `VIS${patientId}-${i + 1}`,
    date,
    reason: randomItem(visitReasons),
    doctor: randomItem(doctors),
    outcome: randomItem(outcomes),
    notes: randomItem(notes),
    followup: Math.random() > 0.6 ? randomDate(new Date(date), new Date(new Date(date).setMonth(new Date(date).getMonth() + 3))) : null
  }));
}; 