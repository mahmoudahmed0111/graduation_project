import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import {
  Sun,
  Moon,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  GraduationCap,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/colleges', label: 'Colleges' },
  { to: '/academics', label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/research', label: 'Research' },
  { to: '/campus-life', label: 'Campus Life' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
];

export function PublicLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top utility strip */}
      <div className="hidden md:block bg-primary-900 dark:bg-slate-900 text-primary-100 text-xs">
        <div className="container mx-auto px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-accent-400" /> +20 82 231 7950</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-accent-400" /> info@bsu.edu.eg</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-accent-400" /> Beni Suef, Egypt</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-accent-400 transition"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:text-accent-400 transition"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:text-accent-400 transition"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:text-accent-400 transition"><Linkedin className="h-3.5 w-3.5" /></a>
            <a href="#" className="hover:text-accent-400 transition"><Youtube className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg shadow-md border-b border-gray-100 dark:border-slate-800'
            : 'bg-white dark:bg-slate-950 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg ring-2 ring-accent-400/40">
                <GraduationCap className="h-6 w-6 text-accent-400" />
              </div>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-widest text-accent-600 dark:text-accent-400 font-semibold">Beni Suef</p>
              <p className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">University</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-700 dark:text-accent-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-accent-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all hover:scale-110"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-accent-400" /> : <Moon className="h-4 w-4 text-primary-700" />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Portal Login
            </Link>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[500px] border-t border-gray-100 dark:border-slate-800' : 'max-h-0'
          }`}
        >
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-accent-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="mt-2 inline-flex items-center justify-center h-11 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold"
            >
              Portal Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-primary-900 via-primary-950 to-slate-950 text-primary-100 mt-20">
        <div className="container mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center ring-2 ring-accent-400/50">
                  <GraduationCap className="h-6 w-6 text-accent-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-accent-400 font-semibold">Beni Suef</p>
                  <p className="text-lg font-bold text-white">University</p>
                </div>
              </div>
              <p className="text-sm text-primary-200 leading-relaxed mb-4">
                A leading Egyptian public university committed to academic excellence, scientific research, and community service since 2005.
              </p>
              <div className="flex items-center gap-2">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="h-9 w-9 rounded-full bg-white/5 hover:bg-accent-500 hover:text-primary-900 flex items-center justify-center transition-all hover:-translate-y-0.5"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 relative inline-block">
                Quick Links
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-accent-500" />
              </h4>
              <ul className="space-y-2 text-sm">
                {NAV_ITEMS.slice(0, 5).map((i) => (
                  <li key={i.to}>
                    <Link to={i.to} className="text-primary-200 hover:text-accent-400 transition-colors">
                      → {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 relative inline-block">
                Resources
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-accent-500" />
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-primary-200 hover:text-accent-400 transition">→ Library</a></li>
                <li><a href="#" className="text-primary-200 hover:text-accent-400 transition">→ E-Learning</a></li>
                <li><a href="#" className="text-primary-200 hover:text-accent-400 transition">→ Alumni</a></li>
                <li><a href="#" className="text-primary-200 hover:text-accent-400 transition">→ Careers</a></li>
                <li><a href="#" className="text-primary-200 hover:text-accent-400 transition">→ Calendar</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 relative inline-block">
                Get in Touch
                <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-accent-500" />
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" />
                  <span>Salah Salem St., Beni Suef 62511, Egypt</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent-400 shrink-0" />
                  <span>+20 82 231 7950</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent-400 shrink-0" />
                  <span>info@bsu.edu.eg</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-300">
            <p>© {new Date().getFullYear()} Beni Suef University. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-accent-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-accent-400 transition">Terms of Use</Link>
              <Link to="/sitemap" className="hover:text-accent-400 transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
