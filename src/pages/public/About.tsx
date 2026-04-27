import { Target, Eye, Heart, Award, Users, BookOpen, Globe2, Sparkles } from 'lucide-react';

const VALUES = [
  { icon: Award, title: 'Excellence', desc: 'Pursuing the highest standards in education and research.' },
  { icon: Heart, title: 'Integrity', desc: 'Acting with honesty, fairness, and accountability in all we do.' },
  { icon: Globe2, title: 'Diversity', desc: 'Embracing differences and fostering an inclusive community.' },
  { icon: BookOpen, title: 'Innovation', desc: 'Encouraging creativity and pioneering new ideas.' },
  { icon: Users, title: 'Community', desc: 'Serving Egypt and the world through partnerships and outreach.' },
  { icon: Sparkles, title: 'Impact', desc: 'Driving positive change through knowledge and action.' },
];

const TIMELINE = [
  { year: '2005', title: 'University Founded', desc: 'Established as an independent public university by presidential decree.' },
  { year: '2008', title: 'Medical School Opens', desc: 'Launch of the College of Medicine, expanding healthcare education in Upper Egypt.' },
  { year: '2012', title: 'Research Centers Established', desc: 'Inauguration of advanced research centers in nanotechnology and biotech.' },
  { year: '2016', title: 'International Partnerships', desc: 'Strategic alliances signed with 20+ universities across Europe and Asia.' },
  { year: '2020', title: 'Digital Transformation', desc: 'Major investment in e-learning platforms and smart classrooms.' },
  { year: '2024', title: 'Top 10 in Egypt', desc: 'Ranked among the top 10 universities in Egypt by QS World Rankings.' },
];

const LEADERSHIP = [
  { name: 'Prof. Mansour Hassan', role: 'University President', img: 'https://i.pravatar.cc/200?img=15' },
  { name: 'Prof. Nadia El-Saeed', role: 'Vice President for Academic Affairs', img: 'https://i.pravatar.cc/200?img=44' },
  { name: 'Prof. Karim Ibrahim', role: 'Vice President for Research', img: 'https://i.pravatar.cc/200?img=33' },
  { name: 'Prof. Hala Mostafa', role: 'Vice President for Community Service', img: 'https://i.pravatar.cc/200?img=47' },
];

export function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            About BSU
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            A Legacy of <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Knowledge</span>, A Future of Possibility
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            Founded in 2005, Beni Suef University has grown into one of Egypt's most respected institutions of higher education and research.
          </p>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Eye, title: 'Our Vision', text: 'To be a global hub of knowledge and innovation, empowering generations to lead with wisdom and integrity.', color: 'from-blue-500 to-indigo-600' },
            { icon: Target, title: 'Our Mission', text: 'To provide world-class education, conduct impactful research, and serve our community through partnerships and inclusion.', color: 'from-amber-500 to-orange-600' },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${b.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-lg mb-5`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="relative text-2xl font-bold text-slate-900 dark:text-white mb-3">{b.title}</h2>
                <p className="relative text-slate-600 dark:text-slate-300 leading-relaxed">{b.text}</p>
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
              alt="Campus"
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-accent-400 to-accent-600 text-primary-950 rounded-2xl px-5 py-4 shadow-xl">
              <p className="text-3xl font-bold">20+</p>
              <p className="text-xs uppercase tracking-wider font-semibold">Years of Excellence</p>
            </div>
          </div>
          <div>
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-5">
              Two Decades of Building Egypt's Future
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Beni Suef University began its journey in 2005 with a bold vision: to provide accessible, high-quality higher education to students across Upper Egypt and beyond. From a handful of faculties, we have grown into a comprehensive institution of 14 colleges, 68 departments, and over 50,000 students.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Our graduates lead in medicine, engineering, business, and the arts — not just in Egypt, but worldwide. We are proud of our journey, and even more excited about what lies ahead.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { v: '50K+', l: 'Students' },
                { v: '14', l: 'Colleges' },
                { v: '2K+', l: 'Faculty' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-accent-400">{s.v}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.l}</p>
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
              Our Journey
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Milestones Through the Years
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
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
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
              Our Values
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              The Principles That Guide Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{v.desc}</p>
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
              Leadership
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Meet Our Leadership Team
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {LEADERSHIP.map((p) => (
              <div
                key={p.name}
                className="group text-center rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                  <img
                    src={p.img}
                    alt={p.name}
                    className="relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover mx-auto"
                  />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{p.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
