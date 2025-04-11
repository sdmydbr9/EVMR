// Helper function to check if the current user is a demo user
export const isDemoUser = () => {
  const email = localStorage.getItem('email');
  return email?.includes('_demo@') || 
         email === 'demo@petsphere.com' || 
         email === 'demo@example.com';
};

// More auth utilities can be added here 