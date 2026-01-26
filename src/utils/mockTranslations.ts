import i18n from '@/lib/i18n';

/**
 * Helper function to get translated mock data based on current language
 */
export function getMockTranslation(key: string, fallback?: string): string {
  const translation = i18n.t(`mock.${key}`, { defaultValue: fallback || key });
  return translation;
}

/**
 * Get translated course title
 */
export function getCourseTitle(courseKey: string): string {
  return getMockTranslation(`courses.${courseKey}`, courseKey);
}

/**
 * Get translated department name
 */
export function getDepartmentName(deptKey: string): string {
  return getMockTranslation(`departments.${deptKey}`, deptKey);
}

/**
 * Get translated college name
 */
export function getCollegeName(collegeKey: string): string {
  return getMockTranslation(`colleges.${collegeKey}`, collegeKey);
}

/**
 * Get translated status
 */
export function getStatus(status: string): string {
  return getMockTranslation(`status.${status.toLowerCase()}`, status);
}

/**
 * Get translated day name
 */
export function getDayName(day: string): string {
  const dayKey = day.toLowerCase();
  return getMockTranslation(`days.${dayKey}`, day);
}

/**
 * Get translated session type
 */
export function getSessionType(type: string): string {
  const typeKey = type.toLowerCase();
  return getMockTranslation(`sessionTypes.${typeKey}`, type);
}

/**
 * Get translated semester
 */
export function getSemester(semester: string): string {
  // Convert "Fall 2025" to "fall2025" key
  const key = semester.toLowerCase().replace(/\s+/g, '');
  return getMockTranslation(`semesters.${key}`, semester);
}

/**
 * Get translated location
 */
export function getLocation(location: string): string {
  // Convert "Hall 501" to "hall501" key
  const key = location.toLowerCase().replace(/\s+/g, '');
  return getMockTranslation(`locations.${key}`, location);
}










