import { useTranslation } from 'react-i18next';
import { Gauge, Infinity as InfinityIcon } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { IChatUsage } from '@/types/phase7-chat';

interface UsageMeterProps {
  usage: IChatUsage | undefined;
  isLoading?: boolean;
  compact?: boolean;
}

/** Monthly AI token budget meter. Turns amber/red as the user nears the cap. */
export function UsageMeter({ usage, isLoading, compact }: UsageMeterProps) {
  const { t } = useTranslation();

  if (isLoading || !usage) {
    return <div className="skeleton h-9 w-full rounded-xl" />;
  }

  if (usage.isUnlimited) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
        <span className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
          <Gauge className="h-4 w-4 text-primary-500" />
          {t('shared.chatbot.usageTitle')}
        </span>
        <Badge tone="brand" size="sm">
          <InfinityIcon className="h-3 w-3" />
          {t('shared.chatbot.usageUnlimited')}
        </Badge>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, Math.round(usage.percentageUsed)));
  const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'brand';
  const barColor =
    pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-primary-500';

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-300">
          <Gauge className="h-4 w-4 text-primary-500" />
          {t('shared.chatbot.usageTitle')}
        </span>
        <Badge tone={tone} size="sm">
          {pct}%
        </Badge>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-surface-2">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 text-[11px] text-gray-500 dark:text-slate-400">
          {t('shared.chatbot.usageRemaining', {
            used: usage.tokensUsed.toLocaleString(),
            limit: usage.tokenLimit.toLocaleString(),
            remaining: usage.remainingTokens.toLocaleString(),
          })}
        </p>
      )}
    </div>
  );
}
