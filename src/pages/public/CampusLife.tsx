import { useTranslation } from 'react-i18next';
import { Home, Utensils, Trophy, Heart, BookOpen, Bus, Wifi, Coffee, Camera } from 'lucide-react';

export function CampusLife() {
  const { t } = useTranslation();

  const FACILITIES = [
    { icon: Home, titleKey: 'fac1Title', descKey: 'fac1Desc', color: 'from-blue-500 to-indigo-600' },
    { icon: Utensils, titleKey: 'fac2Title', descKey: 'fac2Desc', color: 'from-amber-500 to-orange-600' },
    { icon: Trophy, titleKey: 'fac3Title', descKey: 'fac3Desc', color: 'from-emerald-500 to-emerald-700' },
    { icon: BookOpen, titleKey: 'fac4Title', descKey: 'fac4Desc', color: 'from-purple-500 to-purple-700' },
    { icon: Heart, titleKey: 'fac5Title', descKey: 'fac5Desc', color: 'from-pink-500 to-rose-600' },
    { icon: Wifi, titleKey: 'fac6Title', descKey: 'fac6Desc', color: 'from-cyan-500 to-cyan-700' },
    { icon: Bus, titleKey: 'fac7Title', descKey: 'fac7Desc', color: 'from-slate-500 to-slate-700' },
    { icon: Coffee, titleKey: 'fac8Title', descKey: 'fac8Desc', color: 'from-yellow-500 to-amber-600' },
  ];

  const CLUBS = [
    { nameKey: 'club1', members: 240, icon: '🤖' },
    { nameKey: 'club2', members: 180, icon: '🎵' },
    { nameKey: 'club3', members: 95, icon: '🎤' },
    { nameKey: 'club4', members: 130, icon: '📸' },
    { nameKey: 'club5', members: 320, icon: '❤️' },
    { nameKey: 'club6', members: 210, icon: '🚀' },
    { nameKey: 'club7', members: 110, icon: '🎬' },
    { nameKey: 'club8', members: 145, icon: '🌱' },
  ];

  const SPORTS = [
    { nameKey: 'sport1', emoji: '⚽' },
    { nameKey: 'sport2', emoji: '🏀' },
    { nameKey: 'sport3', emoji: '🏊' },
    { nameKey: 'sport4', emoji: '🎾' },
    { nameKey: 'sport5', emoji: '🏃' },
    { nameKey: 'sport6', emoji: '🏐' },
    { nameKey: 'sport7', emoji: '🥋' },
    { nameKey: 'sport8', emoji: '♟️' },
  ];

  const GALLERY = [
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80',
    'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80',
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.campusLife.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.campusLife.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.campusLife.heroTitleHighlight')}</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            {t('public.campusLife.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.campusLife.facilities')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.campusLife.everythingNeed')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FACILITIES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative font-bold text-slate-900 dark:text-white mb-1.5">{t(`public.campusLife.${f.titleKey}`)}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{t(`public.campusLife.${f.descKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clubs */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.campusLife.studentClubs')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.campusLife.findTribe')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3">{t('public.campusLife.clubsSub')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLUBS.map((c) => (
              <div
                key={c.nameKey}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t(`public.campusLife.${c.nameKey}`)}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('public.campusLife.membersCount', { count: c.members })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.campusLife.athletics')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.campusLife.stayActive')}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SPORTS.map((s) => (
              <div
                key={s.nameKey}
                className="group flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-accent-500 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{s.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{t(`public.campusLife.${s.nameKey}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.campusLife.glimpses')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.campusLife.lifeOnCampus')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALLERY.map((src, i) => (
              <div
                key={i}
                className={`group overflow-hidden rounded-2xl shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1 ${
                  i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={src}
                  alt=""
                  className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                    i === 0 ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all">
              <Camera className="h-4 w-4" /> {t('public.campusLife.viewGallery')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
