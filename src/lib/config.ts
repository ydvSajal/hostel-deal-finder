// Environment configuration for BU_Basket

export const config = {
  // Site configuration
  siteUrl: import.meta.env.PROD 
    ? 'https://yourusername.github.io/hostel-deal-finder' 
    : 'http://localhost:8080',
  
  // College email domain
  collegeEmailDomain: 'bennett.edu.in',
  
  // Email validation
  isCollegeEmail: (email: string): boolean => {
    return new RegExp(`@${config.collegeEmailDomain}$`, 'i').test(email.trim());
  },
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Email redirect URLs
  emailRedirectUrl: import.meta.env.PROD
    ? 'https://yourusername.github.io/hostel-deal-finder/email-confirmed'
    : 'http://localhost:8080/email-confirmed',
    
  // App metadata
  app: {
    name: 'BU_Basket',
    description: 'Campus Marketplace for Bennett University',
    version: '1.0.0',
  }
};

// Validation helper
export const validateConfig = (): boolean => {
  const required = [
    config.supabase.url,
    config.supabase.anonKey,
  ];
  
  return required.every(value => value && value.length > 0);
};

// Development helper
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};