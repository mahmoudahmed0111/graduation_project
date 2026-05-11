import { useTranslation } from 'react-i18next';
import { Microscope, Atom, Cpu, Heart, Leaf, Award, FileText, TrendingUp, Users, Globe2 } from 'lucide-react';

export function Research() {
  const { t } = useTranslation();

  const STATS = [
    { value: '320+', labelKey: 'stat1Label', icon: Microscope },
    { value: '1,400+', labelKey: 'stat2Label', icon: FileText },
    { value: '$45M', labelKey: 'stat3Label', icon: TrendingUp },
    { value: '30+', labelKey: 'stat4Label', icon: Globe2 },
  ];

  const CENTERS = [
    { nameKey: 'ctr1Name', icon: Heart, color: 'from-red-500 to-rose-600', descKey: 'ctr1Desc', tagKey: 'ctr1Tag' },
    { nameKey: 'ctr2Name', icon: Atom, color: 'from-purple-500 to-purple-700', descKey: 'ctr2Desc', tagKey: 'ctr2Tag' },
    { nameKey: 'ctr3Name', icon: Cpu, color: 'from-blue-500 to-indigo-600', descKey: 'ctr3Desc', tagKey: 'ctr3Tag' },
    { nameKey: 'ctr4Name', icon: Leaf, color: 'from-emerald-500 to-emerald-700', descKey: 'ctr4Desc', tagKey: 'ctr4Tag' },
    { nameKey: 'ctr5Name', icon: Heart, color: 'from-pink-500 to-rose-500', descKey: 'ctr5Desc', tagKey: 'ctr5Tag' },
    { nameKey: 'ctr6Name', icon: Atom, color: 'from-cyan-500 to-teal-600', descKey: 'ctr6Desc', tagKey: 'ctr6Tag' },
  ];

  const HIGHLIGHTS = [
    { img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80', titleKey: 'hl1Title', excerptKey: 'hl1Excerpt', journalKey: 'hl1Journal' },
    { img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80', titleKey: 'hl2Title', excerptKey: 'hl2Excerpt', journalKey: 'hl2Journal' },
    { img: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80', titleKey: 'hl3Title', excerptKey: 'hl3Excerpt', journalKey: 'hl3Journal' },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.research.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.research.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.research.heroTitleHighlight')}</span>{t('public.research.heroTitlePart2')}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            {t('public.research.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-12 -mt-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.labelKey}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 text-center shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{t(`public.research.${s.labelKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.research.researchCenters')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.research.whereInnovation')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CENTERS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.nameKey}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {t(`public.research.${c.tagKey}`)}
                    </span>
                  </div>
                  <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{t(`public.research.${c.nameKey}`)}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{t(`public.research.${c.descKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.research.recentHighlights')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.research.researchersInNews')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h) => (
              <article
                key={h.titleKey}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={h.img} alt={t(`public.research.${h.titleKey}`)} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">{t(`public.research.${h.titleKey}`)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t(`public.research.${h.excerptKey}`)}</p>
                  <p className="text-xs font-semibold text-accent-700 dark:text-accent-400 flex items-center gap-1">
                    <Award className="h-3 w-3" /> {t(`public.research.${h.journalKey}`)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 p-10 lg:p-14 text-white text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="relative max-w-2xl mx-auto">
              <Users className="h-12 w-12 text-accent-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t('public.research.joinCommunity')}</h2>
              <p className="text-primary-100 mb-6">{t('public.research.joinSubtitle')}</p>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:-translate-y-0.5 transition-all">
                {t('public.research.exploreOpps')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
