import { useTranslation } from 'react-i18next';
import { Calendar, BookOpen, GraduationCap, Library, Award, Globe2, Clock, Users } from 'lucide-react';

export function Academics() {
  const { t } = useTranslation();

  const PROGRAM_LEVELS = [
    { levelKey: 'lvl1Level', count: 68, durationKey: 'lvl1Duration', icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { levelKey: 'lvl2Level', count: 42, durationKey: 'lvl2Duration', icon: BookOpen, color: 'from-purple-500 to-purple-700' },
    { levelKey: 'lvl3Level', count: 28, durationKey: 'lvl3Duration', icon: Award, color: 'from-amber-500 to-orange-600' },
    { levelKey: 'lvl4Level', count: 18, durationKey: 'lvl4Duration', icon: Library, color: 'from-emerald-500 to-emerald-700' },
  ];

  const CALENDAR = [
    { dateKey: 'cal1Date', eventKey: 'cal1Event', tagKey: 'cal1Tag', tagColorKey: 'Fall' },
    { dateKey: 'cal2Date', eventKey: 'cal2Event', tagKey: 'cal2Tag', tagColorKey: 'Fall' },
    { dateKey: 'cal3Date', eventKey: 'cal3Event', tagKey: 'cal3Tag', tagColorKey: 'Fall' },
    { dateKey: 'cal4Date', eventKey: 'cal4Event', tagKey: 'cal4Tag', tagColorKey: 'Break' },
    { dateKey: 'cal5Date', eventKey: 'cal5Event', tagKey: 'cal5Tag', tagColorKey: 'Spring' },
    { dateKey: 'cal6Date', eventKey: 'cal6Event', tagKey: 'cal6Tag', tagColorKey: 'Spring' },
    { dateKey: 'cal7Date', eventKey: 'cal7Event', tagKey: 'cal7Tag', tagColorKey: 'Spring' },
    { dateKey: 'cal8Date', eventKey: 'cal8Event', tagKey: 'cal8Tag', tagColorKey: 'Spring' },
  ];

  const FEATURES = [
    { icon: Library, titleKey: 'feat1Title', descKey: 'feat1Desc' },
    { icon: Globe2, titleKey: 'feat2Title', descKey: 'feat2Desc' },
    { icon: Users, titleKey: 'feat3Title', descKey: 'feat3Desc' },
    { icon: Award, titleKey: 'feat4Title', descKey: 'feat4Desc' },
  ];

  const TAG_COLORS: Record<string, string> = {
    Fall: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    Spring: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    Break: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.academics.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.academics.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.academics.heroTitleHighlight')}</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            {t('public.academics.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.academics.programLevels')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.academics.findFit')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAM_LEVELS.map((p) => {
              const Icon = p.icon;
              const level = t(`public.academics.${p.levelKey}`);
              return (
                <div
                  key={p.levelKey}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="relative text-3xl font-bold text-slate-900 dark:text-white mb-1">{p.count}</p>
                  <p className="relative text-sm font-semibold text-slate-700 dark:text-slate-200">{t('public.academics.programsLabel', { level })}</p>
                  <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t(`public.academics.${p.durationKey}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Academic Calendar */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.academics.academicCalendar')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.academics.keyDates')}</h2>
          </div>
          <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {CALENDAR.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 p-5 border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t(`public.academics.${c.eventKey}`)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t(`public.academics.${c.dateKey}`)}</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${TAG_COLORS[c.tagColorKey]}`}>{t(`public.academics.${c.tagKey}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.academics.beyondClassroom')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.academics.resources')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t(`public.academics.${f.titleKey}`)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t(`public.academics.${f.descKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
