import { useTranslation } from 'react-i18next';
import { Target, Eye, Heart, Award, Users, BookOpen, Globe2, Sparkles } from 'lucide-react';

export function About() {
  const { t } = useTranslation();

  const VALUES = [
    { icon: Award, titleKey: 'val1Title', descKey: 'val1Desc' },
    { icon: Heart, titleKey: 'val2Title', descKey: 'val2Desc' },
    { icon: Globe2, titleKey: 'val3Title', descKey: 'val3Desc' },
    { icon: BookOpen, titleKey: 'val4Title', descKey: 'val4Desc' },
    { icon: Users, titleKey: 'val5Title', descKey: 'val5Desc' },
    { icon: Sparkles, titleKey: 'val6Title', descKey: 'val6Desc' },
  ];

  const TIMELINE = [
    { year: '2005', titleKey: 'tl1Title', descKey: 'tl1Desc' },
    { year: '2008', titleKey: 'tl2Title', descKey: 'tl2Desc' },
    { year: '2012', titleKey: 'tl3Title', descKey: 'tl3Desc' },
    { year: '2016', titleKey: 'tl4Title', descKey: 'tl4Desc' },
    { year: '2020', titleKey: 'tl5Title', descKey: 'tl5Desc' },
    { year: '2024', titleKey: 'tl6Title', descKey: 'tl6Desc' },
  ];

  const LEADERSHIP = [
    { nameKey: 'lead1Name', roleKey: 'lead1Role', img: 'https://i.pravatar.cc/200?img=15' },
    { nameKey: 'lead2Name', roleKey: 'lead2Role', img: 'https://i.pravatar.cc/200?img=44' },
    { nameKey: 'lead3Name', roleKey: 'lead3Role', img: 'https://i.pravatar.cc/200?img=33' },
    { nameKey: 'lead4Name', roleKey: 'lead4Role', img: 'https://i.pravatar.cc/200?img=47' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.about.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.about.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.about.heroTitleHighlight')}</span>{t('public.about.heroTitlePart2')}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            {t('public.about.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Eye, titleKey: 'visionTitle', textKey: 'visionText', color: 'from-blue-500 to-indigo-600' },
            { icon: Target, titleKey: 'missionTitle', textKey: 'missionText', color: 'from-amber-500 to-orange-600' },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.titleKey}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${b.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-lg mb-5`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="relative text-2xl font-bold text-slate-900 dark:text-white mb-3">{t(`public.about.${b.titleKey}`)}</h2>
                <p className="relative text-slate-600 dark:text-slate-300 leading-relaxed">{t(`public.about.${b.textKey}`)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Story / image split */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80"
              alt={t('public.about.campusAlt')}
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-accent-400 to-accent-600 text-primary-950 rounded-2xl px-5 py-4 shadow-xl">
              <p className="text-3xl font-bold">20+</p>
              <p className="text-xs uppercase tracking-wider font-semibold">{t('public.about.yearsLabel')}</p>
            </div>
          </div>
          <div>
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.about.ourStory')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-5">
              {t('public.about.storyTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {t('public.about.storyP1')}
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {t('public.about.storyP2')}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: '50K+', lKey: 'statStudents' },
                { v: '14', lKey: 'statColleges' },
                { v: '2K+', lKey: 'statFaculty' },
              ].map((s) => (
                <div key={s.lKey} className="rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-accent-400">{s.v}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t(`public.about.${s.lKey}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.about.ourJourney')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              {t('public.about.milestones')}
            </h2>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-accent-500 md:-translate-x-1/2" />
            <div className="space-y-10">
              {TIMELINE.map((item, idx) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row gap-6 items-start md:items-center ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 ring-4 ring-white dark:ring-slate-950 shadow-lg z-10" />
                  <div className="md:w-1/2 ml-12 md:ml-0 md:px-10">
                    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                      <p className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest mb-1">{item.year}</p>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{t(`public.about.${item.titleKey}`)}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t(`public.about.${item.descKey}`)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.about.ourValues')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('public.about.principles')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titleKey}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t(`public.about.${v.titleKey}`)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t(`public.about.${v.descKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.about.leadership')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {t('public.about.meetTeam')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {LEADERSHIP.map((p) => (
              <div
                key={p.nameKey}
                className="group text-center rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                  <img
                    src={p.img}
                    alt={t(`public.about.${p.nameKey}`)}
                    className="relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover mx-auto"
                  />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t(`public.about.${p.nameKey}`)}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t(`public.about.${p.roleKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
