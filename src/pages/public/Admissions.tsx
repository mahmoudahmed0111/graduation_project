import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, GraduationCap, DollarSign, Calendar, ArrowRight, Award, Users, BookOpen, Globe2 } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'Submit Application', desc: 'Complete the online form with personal and academic information.', icon: FileText },
  { n: '02', title: 'Upload Documents', desc: 'Provide transcripts, identification, and supporting materials.', icon: GraduationCap },
  { n: '03', title: 'Pay Application Fee', desc: 'Complete the EGP 200 application fee via secure online payment.', icon: DollarSign },
  { n: '04', title: 'Interview & Review', desc: 'Selected candidates will be invited for interviews and review.', icon: Users },
  { n: '05', title: 'Receive Decision', desc: 'Decisions are typically released within 4 weeks.', icon: Award },
  { n: '06', title: 'Enroll', desc: 'Accept your offer, pay fees, and join the BSU family.', icon: CheckCircle2 },
];

const REQUIREMENTS = [
  'Egyptian Thanaweya Amma certificate (or equivalent)',
  'Minimum GPA / score per program (varies by college)',
  'Valid national ID or passport copy',
  'Recent passport-sized photographs',
  'Proof of English proficiency (international applicants)',
  'Letters of recommendation (graduate programs only)',
];

const FEES = [
  { program: 'Bachelor — Local Students', amount: '5,000 EGP', sub: 'per academic year' },
  { program: 'Bachelor — International', amount: '$3,500', sub: 'per academic year' },
  { program: 'Master\'s Programs', amount: '12,000 EGP', sub: 'per academic year' },
  { program: 'PhD Programs', amount: '15,000 EGP', sub: 'per academic year' },
];

const DEADLINES = [
  { date: 'Aug 15, 2026', event: 'Application opens for Fall 2026' },
  { date: 'Sep 30, 2026', event: 'Early decision deadline' },
  { date: 'Oct 30, 2026', event: 'Regular decision deadline' },
  { date: 'Nov 15, 2026', event: 'Decisions released' },
  { date: 'Dec 1, 2026', event: 'Tuition deposit due' },
];

const SCHOLARSHIPS = [
  { title: 'Excellence Scholarship', desc: 'Full tuition for top 1% of admitted students.', icon: Award, color: 'from-amber-400 to-amber-600' },
  { title: 'International Scholarship', desc: '50% off tuition for students from partner countries.', icon: Globe2, color: 'from-blue-500 to-indigo-600' },
  { title: 'Need-Based Aid', desc: 'Financial support based on demonstrated need.', icon: Users, color: 'from-emerald-500 to-emerald-700' },
  { title: 'Research Fellowships', desc: 'Stipend + tuition for graduate researchers.', icon: BookOpen, color: 'from-purple-500 to-purple-700' },
];

export function Admissions() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Admissions 2026 — 2027
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            Begin Your <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">Future</span> Today
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mb-8">
            Applications for the 2026-2027 academic year are now open. We welcome ambitious students ready to make a difference.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Apply Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Application Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Six Steps to Get Started</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                  <span className="absolute top-3 right-3 text-5xl font-black text-primary-100 dark:text-primary-900/40 group-hover:text-accent-200 dark:group-hover:text-accent-500/30 transition-colors">
                    {s.n}
                  </span>
                  <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements + Deadlines */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Admission Requirements</h3>
            <ul className="space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Important Deadlines</h3>
            <ul className="space-y-3">
              {DEADLINES.map((d) => (
                <li key={d.event} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{d.event}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                    {d.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-500/10 text-accent-700 dark:text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Tuition & Fees
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Affordable Excellence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEES.map((f) => (
              <div
                key={f.program}
                className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">{f.program}</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-accent-400 mb-1">{f.amount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Scholarships & Aid
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Funding Your Education</h2>
            <p className="text-primary-200 mt-3">We are committed to making excellence accessible to every qualified student.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCHOLARSHIPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 hover:-translate-y-1 transition-all"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-sm text-primary-200">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
