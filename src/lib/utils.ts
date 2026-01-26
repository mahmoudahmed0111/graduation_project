import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Re-export validators for backward compatibility
export { validateNationalId, validateUniversityEmail } from '@/utils/validators';

// Re-export formatters for backward compatibility
export { formatDate } from '@/utils/formatters';

// Get user display name
export function getUserDisplayName(user: { name: string; email: string }): string {
  return user.name || user.email.split('@')[0];
}

