import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'light' | 'dark';
}

/**
 * Compact EN ⇆ AR language switcher. Placeable anywhere outside the
 * authenticated dashboard (Login, public landing). Reads + writes the
 * same i18next instance the navbar dropdown uses, so the choice is
 * persisted in localStorage and `<html dir>` flips automatically.
 */
export function LanguageToggle({ className, variant = 'dark' }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const current = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
  const next = current === 'ar' ? 'en' : 'ar';
  const label = current === 'ar' ? 'EN' : 'AR';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={current === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
        variant === 'dark'
          ? 'bg-transparent text-white hover:bg-white/10'
          : 'bg-white text-primary-700 hover:bg-gray-50 border border-gray-200 shadow-sm',
        className
      )}
    >
      <Globe className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
