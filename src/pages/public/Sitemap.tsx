import { Link } from 'react-router-dom';
import { Home, Info, Building2, BookOpen, GraduationCap, Microscope, Users, Newspaper, Mail, Shield, FileText, Map, ChevronRight, LogIn } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Main Pages',
    color: 'from-blue-500 to-indigo-600',
    icon: Home,
    links: [
      { to: '/', label: 'Home', desc: 'Welcome to BSU' },
      { to: '/about', label: 'About', desc: 'Our story, vision, and leadership' },
      { to: '/contact', label: 'Contact', desc: 'Get in touch with us' },
    ],
  },
  {
    title: 'Academic',
    color: 'from-purple-500 to-purple-700',
    icon: BookOpen,
    links: [
      { to: '/colleges', label: 'Colleges', desc: 'All 14 colleges' },
      { to: '/academics', label: 'Academics', desc: 'Programs and academic calendar' },
      { to: '/admissions', label: 'Admissions', desc: 'How to apply, requirements, fees' },
      { to: '/research', label: 'Research', desc: 'Centers, publications, opportunities' },
    ],
  },
  {
    title: 'Student Life',
    color: 'from-emerald-500 to-emerald-700',
    icon: Users,
    links: [
      { to: '/campus-life', label: 'Campus Life', desc: 'Housing, clubs, sports, facilities' },
      { to: '/news', label: 'News', desc: 'Latest stories and announcements' },
    ],
  },
  {
    title: 'Portal',
    color: 'from-amber-500 to-orange-600',
    icon: LogIn,
    links: [
      { to: '/login', label: 'Login', desc: 'Access your portal account' },
      { to: '/forgot-password', label: 'Forgot Password', desc: 'Reset your password' },
    ],
  },
  {
    title: 'Legal',
    color: 'from-slate-500 to-slate-700',
    icon: Shield,
    links: [
      { to: '/privacy', label: 'Privacy Policy', desc: 'How we handle your data' },
      { to: '/terms', label: 'Terms of Use', desc: 'Rules for using our services' },
      { to: '/sitemap', label: 'Sitemap', desc: 'All pages on this site' },
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

export function Sitemap() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Navigate the site
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Sitemap</h1>
          <p className="text-primary-100 max-w-2xl">
            A complete index of pages on the Beni Suef University website. Find what you need quickly.
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
                  key={s.title}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                      <SectionIcon className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-lg">{s.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {s.links.map((l) => {
                      const LinkIcon = QUICK_ICONS[l.label] || ChevronRight;
                      return (
                        <li key={l.to}>
                          <Link
                            to={l.to}
                            className="group flex items-start gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent dark:hover:from-primary-900/20 transition-all"
                          >
                            <LinkIcon className="h-4 w-4 mt-0.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">
                                {l.label}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{l.desc}</p>
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
              <h3 className="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
              <p className="text-sm text-primary-100 mb-5">Reach out to our team and we'll point you in the right direction.</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Contact Us <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
