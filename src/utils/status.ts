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
    case 'good_standing':
      return {
        label: 'Good Standing',
        className: statusColors.good_standing,
      };
    case 'active':
      return {
        label: 'Active',
        className: statusColors.good_standing,
      };
    case 'graduated':
      return {
        label: 'Graduated',
        className: 'bg-slate-100 text-slate-800',
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

