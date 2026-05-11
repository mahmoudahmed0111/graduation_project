import { useTranslation } from 'react-i18next';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export function PrivacyPolicy() {
  const { t } = useTranslation();

  const SECTIONS = [
    { icon: Database, titleKey: 'sec1Title', bodyKeys: ['sec1B1', 'sec1B2'] },
    { icon: Eye, titleKey: 'sec2Title', bodyKeys: ['sec2B1', 'sec2B2', 'sec2B3'] },
    { icon: Lock, titleKey: 'sec3Title', bodyKeys: ['sec3B1', 'sec3B2'] },
    { icon: UserCheck, titleKey: 'sec4Title', bodyKeys: ['sec4B1', 'sec4B2'] },
    { icon: Shield, titleKey: 'sec5Title', bodyKeys: ['sec5B1', 'sec5B2'] },
    { icon: Mail, titleKey: 'sec6Title', bodyKeys: ['sec6B1'] },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.privacyPolicy.kicker')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('public.privacyPolicy.heroTitle')}</h1>
          <p className="text-primary-100 max-w-2xl">
            {t('public.privacyPolicy.heroSubtitle')}
          </p>
          <p className="mt-4 text-xs text-primary-200">{t('public.privacyPolicy.lastUpdated')}</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/20 border border-primary-100 dark:border-primary-800 p-6 mb-10">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {t('public.privacyPolicy.intro')}
            </p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.titleKey}
                  className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{t(`public.privacyPolicy.${s.titleKey}`)}</h2>
                      <div className="space-y-3">
                        {s.bodyKeys.map((bk, i) => (
                          <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(`public.privacyPolicy.${bk}`)}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
