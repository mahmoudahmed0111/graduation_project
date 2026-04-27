import { Home, Utensils, Trophy, Heart, BookOpen, Bus, Wifi, Coffee, Camera } from 'lucide-react';

const FACILITIES = [
  { icon: Home, title: 'Student Housing', desc: 'Modern dormitories with 5,000+ beds across 12 buildings.', color: 'from-blue-500 to-indigo-600' },
  { icon: Utensils, title: 'Dining Halls', desc: 'Diverse cuisines, healthy options, and 24/7 cafés.', color: 'from-amber-500 to-orange-600' },
  { icon: Trophy, title: 'Sports Complex', desc: 'Olympic pool, gyms, and 8 international-standard fields.', color: 'from-emerald-500 to-emerald-700' },
  { icon: BookOpen, title: 'Libraries', desc: 'Multiple libraries with study rooms and digital resources.', color: 'from-purple-500 to-purple-700' },
  { icon: Heart, title: 'Health Center', desc: 'On-campus medical services, counseling, and wellness.', color: 'from-pink-500 to-rose-600' },
  { icon: Wifi, title: 'Smart Campus', desc: 'High-speed Wi-Fi, smart classrooms, and digital labs.', color: 'from-cyan-500 to-cyan-700' },
  { icon: Bus, title: 'Transportation', desc: 'Free shuttle service connecting all campus locations.', color: 'from-slate-500 to-slate-700' },
  { icon: Coffee, title: 'Social Spaces', desc: 'Lounges, gardens, and outdoor cafés to relax and connect.', color: 'from-yellow-500 to-amber-600' },
];

const CLUBS = [
  { name: 'Robotics Society', members: 240, icon: '🤖' },
  { name: 'Music & Arts Club', members: 180, icon: '🎵' },
  { name: 'Debate & Public Speaking', members: 95, icon: '🎤' },
  { name: 'Photography Club', members: 130, icon: '📸' },
  { name: 'Volunteer & Outreach', members: 320, icon: '❤️' },
  { name: 'Entrepreneurship Hub', members: 210, icon: '🚀' },
  { name: 'Film & Media Society', members: 110, icon: '🎬' },
  { name: 'Environmental Action', members: 145, icon: '🌱' },
];

const SPORTS = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Athletics', emoji: '🏃' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Karate', emoji: '🥋' },
  { name: 'Chess', emoji: '♟️' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
  'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80',
  'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
];

export function CampusLife() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Campus Life
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            Live, Learn, <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Thrive</span>
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            BSU offers more than just a degree — it's a complete experience. Discover the people, places, and passions that make our campus home.
          </p>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Facilities
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FACILITIES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`} />
                  <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="relative font-bold text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
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
              Student Clubs
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Find Your Tribe</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3">80+ clubs spanning every interest from robotics to poetry.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLUBS.map((c) => (
              <div
                key={c.name}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{c.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.members} members</p>
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
              Athletics
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Stay Active, Stay Strong</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SPORTS.map((s) => (
              <div
                key={s.name}
                className="group flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-accent-500 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{s.emoji}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
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
              Glimpses
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Life on Campus</h2>
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
              <Camera className="h-4 w-4" /> View full gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
