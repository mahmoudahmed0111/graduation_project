import { Microscope, Atom, Cpu, Heart, Leaf, Award, FileText, TrendingUp, Users, Globe2 } from 'lucide-react';

const STATS = [
  { value: '320+', label: 'Active Projects', icon: Microscope },
  { value: '1,400+', label: 'Publications / Year', icon: FileText },
  { value: '$45M', label: 'Annual Funding', icon: TrendingUp },
  { value: '30+', label: 'Research Centers', icon: Globe2 },
];

const CENTERS = [
  { name: 'Center for Biomedical Innovation', icon: Heart, color: 'from-red-500 to-rose-600', desc: 'Pioneering research in cancer therapy, regenerative medicine, and clinical trials.', tag: 'Medicine' },
  { name: 'Nanotechnology Research Lab', icon: Atom, color: 'from-purple-500 to-purple-700', desc: 'Cutting-edge work on nanomaterials, drug delivery, and energy applications.', tag: 'Science' },
  { name: 'AI & Smart Systems Center', icon: Cpu, color: 'from-blue-500 to-indigo-600', desc: 'Advancing artificial intelligence, robotics, and IoT for real-world impact.', tag: 'Tech' },
  { name: 'Sustainability & Climate Center', icon: Leaf, color: 'from-emerald-500 to-emerald-700', desc: 'Research on renewable energy, water management, and climate adaptation.', tag: 'Environment' },
  { name: 'Digital Health Institute', icon: Heart, color: 'from-pink-500 to-rose-500', desc: 'Telemedicine, health analytics, and digital therapeutics.', tag: 'Medicine' },
  { name: 'Materials Science Lab', icon: Atom, color: 'from-cyan-500 to-teal-600', desc: 'Developing next-gen materials for industry and infrastructure.', tag: 'Science' },
];

const HIGHLIGHTS = [
  {
    img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    title: 'Breakthrough in Cancer Immunotherapy',
    excerpt: 'BSU researchers identify a novel pathway that enhances T-cell response in solid tumors.',
    journal: 'Published in Nature, 2026',
  },
  {
    img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80',
    title: 'Solar Panel Efficiency Record',
    excerpt: 'Engineering team achieves 32% efficiency in perovskite solar cells, a regional first.',
    journal: 'Published in Science, 2026',
  },
  {
    img: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80',
    title: 'AI Model for Early Diabetes Detection',
    excerpt: 'Computer Science faculty develop ML model with 94% accuracy from retinal images.',
    journal: 'Published in The Lancet, 2026',
  },
];

export function Research() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Research & Innovation
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            Discoveries That <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Shape</span> the World
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            From AI to medicine, BSU researchers are tackling the most urgent challenges of our time.
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
                  key={s.label}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 text-center shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
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
              Research Centers
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Where Innovation Happens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CENTERS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.name}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{c.name}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{c.desc}</p>
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
              Recent Highlights
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Our Researchers in the News</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h) => (
              <article
                key={h.title}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={h.img} alt={h.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">{h.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{h.excerpt}</p>
                  <p className="text-xs font-semibold text-accent-700 dark:text-accent-400 flex items-center gap-1">
                    <Award className="h-3 w-3" /> {h.journal}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Join Our Research Community</h2>
              <p className="text-primary-100 mb-6">Apply for graduate research, fellowships, and lab assistant roles across all 14 colleges.</p>
              <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:-translate-y-0.5 transition-all">
                Explore Opportunities
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
