import { useState } from 'react';
import { Search, Users, BookOpen, ArrowRight } from 'lucide-react';

const COLLEGES = [
  { name: 'College of Medicine', students: 1480, programs: 12, est: 2008, color: 'from-red-500 to-rose-600', icon: '🏥', tag: 'Health' },
  { name: 'College of Engineering', students: 3240, programs: 8, est: 2005, color: 'from-blue-500 to-indigo-600', icon: '⚙️', tag: 'Tech' },
  { name: 'College of Computers & AI', students: 2890, programs: 6, est: 2010, color: 'from-purple-500 to-purple-700', icon: '💻', tag: 'Tech' },
  { name: 'College of Pharmacy', students: 1820, programs: 5, est: 2009, color: 'from-cyan-500 to-teal-600', icon: '💊', tag: 'Health' },
  { name: 'College of Science', students: 2150, programs: 9, est: 2005, color: 'from-emerald-500 to-emerald-700', icon: '🔬', tag: 'Science' },
  { name: 'College of Commerce', students: 2980, programs: 5, est: 2005, color: 'from-amber-500 to-orange-600', icon: '💼', tag: 'Business' },
  { name: 'College of Arts', students: 1240, programs: 9, est: 2005, color: 'from-pink-500 to-rose-500', icon: '🎨', tag: 'Humanities' },
  { name: 'College of Law', students: 1620, programs: 4, est: 2007, color: 'from-slate-500 to-slate-700', icon: '⚖️', tag: 'Humanities' },
  { name: 'College of Education', students: 2410, programs: 7, est: 2005, color: 'from-violet-500 to-purple-600', icon: '📚', tag: 'Humanities' },
  { name: 'College of Physical Education', students: 980, programs: 3, est: 2009, color: 'from-orange-500 to-red-500', icon: '🏃', tag: 'Sports' },
  { name: 'College of Dentistry', students: 720, programs: 4, est: 2014, color: 'from-teal-500 to-cyan-600', icon: '🦷', tag: 'Health' },
  { name: 'College of Veterinary Medicine', students: 640, programs: 5, est: 2008, color: 'from-lime-500 to-green-600', icon: '🐾', tag: 'Science' },
  { name: 'College of Nursing', students: 880, programs: 3, est: 2011, color: 'from-fuchsia-500 to-pink-600', icon: '👩‍⚕️', tag: 'Health' },
  { name: 'College of Specific Education', students: 720, programs: 4, est: 2006, color: 'from-indigo-500 to-blue-600', icon: '🎓', tag: 'Humanities' },
];

const TAGS = ['All', 'Health', 'Tech', 'Science', 'Business', 'Humanities', 'Sports'];

export function Colleges() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = COLLEGES.filter(
    (c) =>
      (filter === 'All' || c.tag === filter) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            14 Colleges
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Find Your College</h1>
          <p className="text-primary-100 max-w-2xl">
            Explore our diverse range of colleges and discover the academic path that matches your passion.
          </p>
        </div>
      </section>

      {/* Filter / Search */}
      <section className="py-8 bg-white dark:bg-slate-950 sticky top-16 lg:top-20 z-30 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search colleges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-sm outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  filter === t
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <div
                key={c.name}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`h-32 bg-gradient-to-br ${c.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.2)_1px,transparent_0)] [background-size:20px_20px]" />
                  <div className="absolute top-4 left-4 text-5xl drop-shadow-lg">{c.icon}</div>
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    {c.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">
                    {c.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {c.students.toLocaleString()} students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> {c.programs} programs
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Est. {c.est}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-400 group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">No colleges found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
