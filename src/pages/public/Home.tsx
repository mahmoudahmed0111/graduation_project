import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Building2,
  Microscope,
  Globe2,
  PlayCircle,
  ChevronRight,
  Quote,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const HERO_STATS = [
  { value: '50K+', label: 'Students' },
  { value: '14', label: 'Colleges' },
  { value: '2K+', label: 'Faculty' },
  { value: '20', label: 'Years of Excellence' },
];

const FEATURES = [
  {
    icon: GraduationCap,
    title: 'World-Class Education',
    desc: 'Internationally recognized programs across 14 colleges with cutting-edge curricula.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    icon: Microscope,
    title: 'Advanced Research',
    desc: 'State-of-the-art research centers driving innovation in medicine, engineering, and science.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: Globe2,
    title: 'Global Partnerships',
    desc: 'Collaborations with leading universities across Europe, Asia, and the Americas.',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    desc: '50,000+ students from across Egypt and 30+ countries fostering diversity and growth.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Award,
    title: 'Top-Ranked Faculty',
    desc: 'Distinguished professors and researchers shaping the next generation of leaders.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Building2,
    title: 'Modern Campus',
    desc: 'Beautiful 250-acre campus with libraries, labs, sports facilities, and student housing.',
    color: 'from-cyan-500 to-cyan-700',
  },
];

const PROGRAMS = [
  { name: 'Medicine', icon: '🏥', count: 12, color: 'from-red-500 to-rose-600' },
  { name: 'Engineering', icon: '⚙️', count: 8, color: 'from-blue-500 to-indigo-600' },
  { name: 'Computer Science', icon: '💻', count: 6, color: 'from-purple-500 to-purple-700' },
  { name: 'Business', icon: '💼', count: 5, color: 'from-emerald-500 to-emerald-700' },
  { name: 'Arts', icon: '🎨', count: 9, color: 'from-pink-500 to-rose-500' },
  { name: 'Law', icon: '⚖️', count: 4, color: 'from-amber-500 to-orange-600' },
  { name: 'Pharmacy', icon: '💊', count: 5, color: 'from-cyan-500 to-teal-600' },
  { name: 'Education', icon: '📚', count: 7, color: 'from-violet-500 to-purple-600' },
];

const NEWS = [
  {
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    tag: 'Research',
    title: 'BSU Researchers Publish Breakthrough Study in Nature Journal',
    excerpt: 'A team from the College of Medicine has published groundbreaking findings on cancer therapy.',
    date: 'Apr 22, 2026',
  },
  {
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    tag: 'Events',
    title: 'Annual Innovation Summit Brings 200+ Startups to Campus',
    excerpt: 'Students and entrepreneurs gathered to showcase next-generation technologies and ideas.',
    date: 'Apr 18, 2026',
  },
  {
    img: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80',
    tag: 'Awards',
    title: 'BSU Ranked Among Top 10 Universities in Egypt for 2026',
    excerpt: 'Recognition reflects continued investment in academic quality and research output.',
    date: 'Apr 14, 2026',
  },
];

const EVENTS = [
  { day: '03', month: 'May', title: 'International Conference on AI in Healthcare', loc: 'Main Auditorium', time: '09:00 AM' },
  { day: '12', month: 'May', title: 'Spring Career Fair 2026', loc: 'Sports Complex', time: '10:00 AM' },
  { day: '18', month: 'May', title: 'Open Day for Prospective Students', loc: 'Campus-wide', time: 'All day' },
  { day: '25', month: 'May', title: 'Graduate Research Symposium', loc: 'College of Science', time: '02:00 PM' },
];

const TESTIMONIALS = [
  {
    quote: 'BSU shaped my career. The faculty\'s dedication and the research opportunities are unmatched in the region.',
    name: 'Dr. Yasmine Hassan',
    role: 'Class of 2018, Pharmacy',
    img: 'https://i.pravatar.cc/100?img=47',
  },
  {
    quote: 'The community here is incredible — I built lifelong friendships and gained skills that took me global.',
    name: 'Omar El-Sherif',
    role: 'Class of 2020, Engineering',
    img: 'https://i.pravatar.cc/100?img=12',
  },
  {
    quote: 'From day one, I felt supported. The labs, libraries, and mentors made all the difference.',
    name: 'Mariam Abdelaziz',
    role: 'Class of 2022, Computer Science',
    img: 'https://i.pravatar.cc/100?img=44',
  },
];

const PARTNERS = ['Cairo University', 'Sorbonne', 'TUM', 'NUS', 'Oxford', 'Stanford', 'KAUST', 'AUC'];

export function Home() {
  const [counts, setCounts] = useState(HERO_STATS.map(() => 0));

  useEffect(() => {
    const targets = [50000, 14, 2000, 20];
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const t = i / steps;
      setCounts(targets.map((tg) => Math.round(tg * Math.min(1, t))));
      if (i >= steps) clearInterval(id);
    }, stepTime);
    return () => clearInterval(id);
  }, []);

  const formatCount = (n: number, idx: number) => {
    if (idx === 0) return `${(n / 1000).toFixed(0)}K+`;
    if (idx === 2) return `${(n / 1000).toFixed(0)}K+`;
    if (idx === 3) return `${n}`;
    return `${n}`;
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-24 h-[500px] w-[500px] rounded-full bg-primary-500/30 blur-3xl animate-pulse-slow" />

        <div className="container mx-auto px-6 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold tracking-wider uppercase text-accent-300 mb-6">
                <Sparkles className="h-3 w-3" />
                Established 2005 — Excellence in Education
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Shaping <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Tomorrow's</span> Leaders Today
              </h1>
              <p className="text-lg text-primary-100 mb-8 leading-relaxed max-w-xl">
                Beni Suef University offers world-class education, pioneering research, and a vibrant campus experience. Join 50,000+ students pursuing their dreams.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/admissions"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all">
                  <PlayCircle className="h-5 w-5" />
                  Watch Tour
                </button>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-accent-400/30">
                <img
                  src="https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80"
                  alt="Campus"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-accent-500 flex items-center justify-center text-primary-950">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">Top 10 University in Egypt</p>
                      <p className="text-xs text-primary-200">QS Rankings 2026</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-2xl bg-accent-500 shadow-xl flex flex-col items-center justify-center text-primary-950 animate-fade-in-up">
                <p className="text-2xl font-bold">20+</p>
                <p className="text-[10px] uppercase tracking-wide font-semibold">Years</p>
              </div>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 text-center hover:bg-white/10 transition-all hover:-translate-y-1"
              >
                <p className="text-3xl lg:text-4xl font-bold text-accent-400 mb-1">
                  {formatCount(counts[i], i)}
                </p>
                <p className="text-xs uppercase tracking-wider text-primary-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US / FEATURES */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Why Choose Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              A University That Empowers Excellence
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Discover what makes Beni Suef University one of Egypt's leading institutions of higher education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
                Academic Programs
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Explore Your Path
              </h2>
            </div>
            <Link to="/colleges" className="text-primary-600 dark:text-accent-400 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all colleges <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROGRAMS.map((p) => (
              <Link
                key={p.name}
                to="/colleges"
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="text-4xl mb-3">{p.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">{p.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors">{p.count} programs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Latest News
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                What's Happening at BSU
              </h2>
            </div>
            <Link to="/news" className="text-primary-600 dark:text-accent-400 font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              All news <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={n.img} alt={n.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">
                      {n.tag}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{n.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-2">
                    {n.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{n.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-400">
                    Read more <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Upcoming Events
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Mark Your Calendar</h2>
            <p className="text-primary-200">From conferences to career fairs, there's always something happening on campus.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EVENTS.map((e) => (
              <div
                key={e.title}
                className="group flex items-center gap-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:bg-white/10 hover:-translate-y-1 transition-all"
              >
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-primary-950 shadow-lg shrink-0">
                  <span className="text-2xl font-bold">{e.day}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">{e.month}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1 group-hover:text-accent-400 transition-colors">{e.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-primary-200">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.loc}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Voices of BSU
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              What Our Alumni Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="relative rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary-200 dark:text-primary-700" />
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="h-12 w-12 rounded-full ring-2 ring-accent-400" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-12 bg-gray-50 dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400 mb-6">
            Trusted by leading institutions worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {PARTNERS.map((p) => (
              <span key={p} className="text-lg font-bold text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-accent-400 transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 p-10 lg:p-16 text-white shadow-2xl">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="relative max-w-3xl mx-auto text-center">
              <TrendingUp className="h-12 w-12 text-accent-400 mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
                Applications for the 2026-2027 academic year are now open. Take the first step toward an exceptional future.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/admissions"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  Start Application
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Talk to an Advisor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quick Links */}
      <section className="py-12 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Library', desc: 'Access millions of books and journals.', link: '/academics' },
            { icon: Microscope, title: 'Research', desc: 'Discover our 30+ research centers.', link: '/research' },
            { icon: Users, title: 'Campus Life', desc: 'Clubs, sports, housing and more.', link: '/campus-life' },
          ].map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.title}
                to={q.link}
                className="group rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-4"
              >
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">{q.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{q.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-600 transition-all" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
