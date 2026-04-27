import { Calendar, BookOpen, GraduationCap, Library, Award, Globe2, Clock, Users } from 'lucide-react';

const PROGRAM_LEVELS = [
  { level: 'Bachelor', count: 68, duration: '4 — 6 years', icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
  { level: 'Master', count: 42, duration: '2 years', icon: BookOpen, color: 'from-purple-500 to-purple-700' },
  { level: 'PhD', count: 28, duration: '3 — 5 years', icon: Award, color: 'from-amber-500 to-orange-600' },
  { level: 'Diploma', count: 18, duration: '1 — 2 years', icon: Library, color: 'from-emerald-500 to-emerald-700' },
];

const CALENDAR = [
  { date: 'Sep 15', event: 'Fall semester begins', tag: 'Fall' },
  { date: 'Oct 22', event: 'Mid-term exams week', tag: 'Fall' },
  { date: 'Dec 10', event: 'Last day of classes', tag: 'Fall' },
  { date: 'Dec 18 — Jan 12', event: 'Winter break', tag: 'Break' },
  { date: 'Feb 5', event: 'Spring semester begins', tag: 'Spring' },
  { date: 'Mar 25', event: 'Spring break', tag: 'Spring' },
  { date: 'May 28', event: 'Final exams week', tag: 'Spring' },
  { date: 'Jun 18', event: 'Graduation ceremony', tag: 'Spring' },
];

const FEATURES = [
  { icon: Library, title: 'Modern Library', desc: '500K+ books, 50K e-journals, 24/7 study spaces.' },
  { icon: Globe2, title: 'Study Abroad', desc: 'Exchange programs in 30+ countries worldwide.' },
  { icon: Users, title: 'Small Classes', desc: 'Average 20:1 student-to-faculty ratio.' },
  { icon: Award, title: 'Honors Programs', desc: 'Special tracks for high-achieving students.' },
];

const TAG_COLORS: Record<string, string> = {
  Fall: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Spring: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Break: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
};

export function Academics() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Academics
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            Education That <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Inspires</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Across 14 colleges and 156 programs, we offer learning experiences that prepare you to lead in a changing world.
          </p>
        </div>
      </section>

      {/* Levels */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Program Levels
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Find the Right Fit</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAM_LEVELS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.level}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="relative text-3xl font-bold text-slate-900 dark:text-white mb-1">{p.count}</p>
                  <p className="relative text-sm font-semibold text-slate-700 dark:text-slate-200">{p.level} Programs</p>
                  <p className="relative text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.duration}
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
              Academic Calendar
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">2026 — 2027 Key Dates</h2>
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
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.event}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.date}</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${TAG_COLORS[c.tag]}`}>{c.tag}</span>
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
              Beyond the Classroom
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Resources for Every Learner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
