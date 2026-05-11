import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Info, Building2, BookOpen, GraduationCap, Microscope, Users, Newspaper, Mail, Shield, FileText, Map, ChevronRight, LogIn } from 'lucide-react';

export function Sitemap() {
  const { t } = useTranslation();

  const SECTIONS = [
    {
      titleKey: 'sec1Title',
      color: 'from-blue-500 to-indigo-600',
      icon: Home,
      links: [
        { to: '/', labelKey: 'sec1L1Label', descKey: 'sec1L1Desc', iconName: 'Home' },
        { to: '/about', labelKey: 'sec1L2Label', descKey: 'sec1L2Desc', iconName: 'About' },
        { to: '/contact', labelKey: 'sec1L3Label', descKey: 'sec1L3Desc', iconName: 'Contact' },
      ],
    },
    {
      titleKey: 'sec2Title',
      color: 'from-purple-500 to-purple-700',
      icon: BookOpen,
      links: [
        { to: '/colleges', labelKey: 'sec2L1Label', descKey: 'sec2L1Desc', iconName: 'Colleges' },
        { to: '/academics', labelKey: 'sec2L2Label', descKey: 'sec2L2Desc', iconName: 'Academics' },
        { to: '/admissions', labelKey: 'sec2L3Label', descKey: 'sec2L3Desc', iconName: 'Admissions' },
        { to: '/research', labelKey: 'sec2L4Label', descKey: 'sec2L4Desc', iconName: 'Research' },
      ],
    },
    {
      titleKey: 'sec3Title',
      color: 'from-emerald-500 to-emerald-700',
      icon: Users,
      links: [
        { to: '/campus-life', labelKey: 'sec3L1Label', descKey: 'sec3L1Desc', iconName: 'Campus Life' },
        { to: '/news', labelKey: 'sec3L2Label', descKey: 'sec3L2Desc', iconName: 'News' },
      ],
    },
    {
      titleKey: 'sec4Title',
      color: 'from-amber-500 to-orange-600',
      icon: LogIn,
      links: [
        { to: '/login', labelKey: 'sec4L1Label', descKey: 'sec4L1Desc', iconName: 'Login' },
        { to: '/forgot-password', labelKey: 'sec4L2Label', descKey: 'sec4L2Desc', iconName: 'Forgot Password' },
      ],
    },
    {
      titleKey: 'sec5Title',
      color: 'from-slate-500 to-slate-700',
      icon: Shield,
      links: [
        { to: '/privacy', labelKey: 'sec5L1Label', descKey: 'sec5L1Desc', iconName: 'Privacy Policy' },
        { to: '/terms', labelKey: 'sec5L2Label', descKey: 'sec5L2Desc', iconName: 'Terms of Use' },
        { to: '/sitemap', labelKey: 'sec5L3Label', descKey: 'sec5L3Desc', iconName: 'Sitemap' },
      ],
    },
  ];

  const QUICK_ICONS: Record<string, typeof Home> = {
    Home,
    About: Info,
    Contact: Mail,
    Colleges: Building2,
    Academics: BookOpen,
    Admissions: GraduationCap,
    Research: Microscope,
    'Campus Life': Users,
    News: Newspaper,
    Login: LogIn,
    'Forgot Password': LogIn,
    'Privacy Policy': Shield,
    'Terms of Use': FileText,
    Sitemap: Map,
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.sitemap.kicker')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('public.sitemap.heroTitle')}</h1>
          <p className="text-primary-100 max-w-2xl">
            {t('public.sitemap.heroSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map((s) => {
              const SectionIcon = s.icon;
              return (
                <div
                  key={s.titleKey}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-lg">{t(`public.sitemap.${s.titleKey}`)}</h2>
                  </div>
                  <ul className="space-y-2">
                    {s.links.map((l) => {
                      const LinkIcon = QUICK_ICONS[l.iconName] || ChevronRight;
                      return (
                        <li key={l.to}>
                          <Link
                            to={l.to}
                            className="group flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-900/20 transition-all"
                          >
                            <LinkIcon className="h-4 w-4 mt-0.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">
                                {t(`public.sitemap.${l.labelKey}`)}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{t(`public.sitemap.${l.descKey}`)}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-accent-400 group-hover:translate-x-1 transition-all" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="mt-12 max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-primary-700 to-indigo-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="relative">
              <Map className="h-10 w-10 text-accent-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">{t('public.sitemap.cantFind')}</h3>
              <p className="text-sm text-primary-100 mb-5">{t('public.sitemap.reachOut')}</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {t('public.sitemap.contactUs')} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
