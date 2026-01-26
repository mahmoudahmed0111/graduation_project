/**
 * Validation utility functions
 */

export const validateNationalId = (nationalId: string): boolean => {
  return /^\d{14}$/.test(nationalId);
};

export const validateUniversityEmail = (email: string, allowedDomains: string[]): boolean => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1];
  return allowedDomains.some(allowedDomain => 
    domain === allowedDomain || domain.endsWith('.' + allowedDomain)
  );
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Egyptian phone number format
  const phoneRegex = /^(?:\+20|0)?1[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

