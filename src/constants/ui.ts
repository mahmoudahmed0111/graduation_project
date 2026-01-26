import { 
  FileText, 
  BookOpen,
  Link as LinkIcon,
  File,
  Video,
  Image as ImageIcon,
  Globe,
  Building2,
  Users,
} from 'lucide-react';

/**
 * UI Constants - Icons, Colors, and Mappings
 */

// Category Icons Mapping
export const categoryIcons = {
  Lectures: FileText,
  Sheets: FileText,
  Readings: BookOpen,
  Links: LinkIcon,
} as const;

// Category Colors Mapping
export const categoryColors = {
  Lectures: 'bg-blue-100 text-blue-700',
  Sheets: 'bg-green-100 text-green-700',
  Readings: 'bg-purple-100 text-purple-700',
  Links: 'bg-orange-100 text-orange-700',
} as const;

// File Type Icons Mapping
export const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: File,
  pptx: File,
  xls: File,
  xlsx: File,
  mp4: Video,
  avi: Video,
  mov: Video,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
};

// Scope Icons Mapping
export const scopeIcons = {
  Global: Globe,
  College: Building2,
  Department: Users,
  Course: BookOpen,
} as const;

// Scope Colors Mapping
export const scopeColors = {
  Global: 'bg-purple-100 text-purple-700',
  College: 'bg-blue-100 text-blue-700',
  Department: 'bg-green-100 text-green-700',
  Course: 'bg-orange-100 text-orange-700',
} as const;

// Status Badge Colors
export const statusColors = {
  enrolled: 'bg-green-100 text-green-700',
  passed: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-700',
  good_standing: 'bg-blue-100 text-blue-700',
  honors: 'bg-green-100 text-green-700',
  probation: 'bg-red-100 text-red-700',
} as const;

// GPA Color Mapping
export const getGPAColor = (gpa: number): string => {
  if (gpa >= 3.5) return 'text-green-600';
  if (gpa >= 3.0) return 'text-blue-600';
  if (gpa >= 2.5) return 'text-yellow-600';
  return 'text-red-600';
};

// Grade Color Mapping
export const getGradeColor = (grade: number): string => {
  if (grade >= 90) return 'text-green-600';
  if (grade >= 80) return 'text-blue-600';
  if (grade >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

