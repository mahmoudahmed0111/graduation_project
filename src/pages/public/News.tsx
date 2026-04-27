import { useState } from 'react';
import { Calendar, ArrowRight, Search, Tag } from 'lucide-react';

const POSTS = [
  { img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', tag: 'Research', title: 'BSU Researchers Publish Breakthrough Study in Nature Journal', excerpt: 'A team from the College of Medicine has published groundbreaking findings on a new approach to cancer immunotherapy.', date: 'Apr 22, 2026', author: 'Dr. Y. Hassan' },
  { img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80', tag: 'Events', title: 'Annual Innovation Summit Brings 200+ Startups to Campus', excerpt: 'Students and entrepreneurs gathered to showcase next-generation technologies and ideas.', date: 'Apr 18, 2026', author: 'BSU News' },
  { img: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=800&q=80', tag: 'Awards', title: 'BSU Ranked Among Top 10 Universities in Egypt for 2026', excerpt: 'Recognition reflects continued investment in academic quality and research output.', date: 'Apr 14, 2026', author: 'BSU News' },
  { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', tag: 'Community', title: 'Volunteer Drive Brings Healthcare to 5,000 Rural Residents', excerpt: 'Medical students and faculty offered free check-ups and education across rural Beni Suef.', date: 'Apr 10, 2026', author: 'Outreach' },
  { img: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80', tag: 'Sports', title: 'BSU Wins Egyptian University Football Championship', excerpt: 'Three-year winning streak continues with a thrilling 3-2 final victory.', date: 'Apr 5, 2026', author: 'Athletics' },
  { img: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80', tag: 'Tech', title: 'New AI Lab Opens with $2M Industry Partnership', excerpt: 'Collaboration with leading tech firms brings new opportunities for students and researchers.', date: 'Apr 2, 2026', author: 'Tech Office' },
  { img: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&q=80', tag: 'Academics', title: 'Two New Master\'s Programs Launching in Fall 2026', excerpt: 'Data Science and Sustainable Architecture join the growing graduate program lineup.', date: 'Mar 28, 2026', author: 'Academic Affairs' },
  { img: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&q=80', tag: 'International', title: 'Exchange Program Expands to 5 New Countries', excerpt: 'New partnerships with universities in Japan, Germany, and Brazil announced.', date: 'Mar 25, 2026', author: 'Global Affairs' },
  { img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80', tag: 'Events', title: 'Science Week 2026 Wraps Up with Record Attendance', excerpt: '12,000 visitors explored exhibits and demos across the College of Science campus.', date: 'Mar 20, 2026', author: 'BSU News' },
];

const TAGS = ['All', 'Research', 'Events', 'Awards', 'Community', 'Sports', 'Tech', 'Academics', 'International'];

export function News() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = POSTS.filter(
    (p) =>
      (filter === 'All' || p.tag === filter) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            News & Stories
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">What's Happening at BSU</h1>
          <p className="text-primary-100 max-w-2xl">Stay updated with the latest research, events, and stories from across our campus and community.</p>
        </div>
      </section>

      <section className="py-8 bg-white dark:bg-slate-950 sticky top-16 lg:top-20 z-30 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
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

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          {featured && (
            <article className="group grid md:grid-cols-2 gap-6 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 mb-10 hover:shadow-2xl transition-all">
              <div className="aspect-video md:aspect-auto overflow-hidden">
                <img src={featured.img} alt={featured.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-400">
                    Featured
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">
                    {featured.tag}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-5">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
                    <span>•</span>
                    <span>{featured.author}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-400 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </article>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((p) => (
              <article
                key={p.title}
                className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={p.img} alt={p.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">
                      <Tag className="h-2.5 w-2.5 inline mr-0.5" /> {p.tag}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{p.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-400 transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{p.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-400">
                    Read article <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">No articles found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
