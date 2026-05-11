import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export interface OrganizationalEditBreadcrumbSegment {
  label: string;
  /** When set and this is not the last segment, renders as a link. */
  href?: string;
}

/**
 * Same trail pattern as college detail: University Structure / … / … / Edit
 */
export function OrganizationalEditBreadcrumb({ segments }: { segments: OrganizationalEditBreadcrumbSegment[] }) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t('chrome.breadcrumb.label')}
      className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm font-medium text-gray-600 dark:text-gray-400"
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <Fragment key={`${seg.label}-${i}`}>
            {i > 0 && (
              <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
                /
              </span>
            )}
            {isLast ? (
              <span
                className="min-w-0 truncate font-semibold text-gray-900 dark:text-gray-100"
                title={seg.label}
              >
                {seg.label}
              </span>
            ) : seg.href ? (
              <Link
                to={seg.href}
                className="shrink-0 hover:text-primary-600 dark:hover:text-accent-400"
              >
                {seg.label}
              </Link>
            ) : (
              <span className="shrink-0">{seg.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
