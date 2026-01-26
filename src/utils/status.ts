import { statusColors } from '@/constants/ui';

/**
 * Get status badge component props
 */
export const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'honors':
      return {
        label: 'Honors',
        className: statusColors.honors,
      };
    case 'probation':
      return {
        label: 'Probation',
        className: statusColors.probation,
      };
    default:
      return {
        label: 'Good Standing',
        className: statusColors.good_standing,
      };
  }
};

/**
 * Get enrollment status badge
 */
export const getEnrollmentStatusBadge = (status: string) => {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.withdrawn;
  return {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: colorClass,
  };
};

