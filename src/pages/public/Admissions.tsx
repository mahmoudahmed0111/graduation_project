import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileText, GraduationCap, DollarSign, Calendar, ArrowRight, Award, Users, BookOpen, Globe2 } from 'lucide-react';

export function Admissions() {
  const { t } = useTranslation();

  const STEPS = [
    { n: '01', titleKey: 'step1Title', descKey: 'step1Desc', icon: FileText },
    { n: '02', titleKey: 'step2Title', descKey: 'step2Desc', icon: GraduationCap },
    { n: '03', titleKey: 'step3Title', descKey: 'step3Desc', icon: DollarSign },
    { n: '04', titleKey: 'step4Title', descKey: 'step4Desc', icon: Users },
    { n: '05', titleKey: 'step5Title', descKey: 'step5Desc', icon: Award },
    { n: '06', titleKey: 'step6Title', descKey: 'step6Desc', icon: CheckCircle2 },
  ];

  const REQUIREMENTS = ['req1', 'req2', 'req3', 'req4', 'req5', 'req6'];

  const FEES = [
    { programKey: 'fee1Program', amountKey: 'fee1Amount', subKey: 'fee1Sub' },
    { programKey: 'fee2Program', amountKey: 'fee2Amount', subKey: 'fee2Sub' },
    { programKey: 'fee3Program', amountKey: 'fee3Amount', subKey: 'fee3Sub' },
    { programKey: 'fee4Program', amountKey: 'fee4Amount', subKey: 'fee4Sub' },
  ];

  const DEADLINES = [
    { dateKey: 'dl1Date', eventKey: 'dl1Event' },
    { dateKey: 'dl2Date', eventKey: 'dl2Event' },
    { dateKey: 'dl3Date', eventKey: 'dl3Event' },
    { dateKey: 'dl4Date', eventKey: 'dl4Event' },
    { dateKey: 'dl5Date', eventKey: 'dl5Event' },
  ];

  const SCHOLARSHIPS = [
    { titleKey: 'sch1Title', descKey: 'sch1Desc', icon: Award, color: 'from-amber-400 to-amber-600' },
    { titleKey: 'sch2Title', descKey: 'sch2Desc', icon: Globe2, color: 'from-blue-500 to-indigo-600' },
    { titleKey: 'sch3Title', descKey: 'sch3Desc', icon: Users, color: 'from-emerald-500 to-emerald-700' },
    { titleKey: 'sch4Title', descKey: 'sch4Desc', icon: BookOpen, color: 'from-purple-500 to-purple-700' },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.admissions.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.admissions.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.admissions.heroTitleHighlight')}</span>{t('public.admissions.heroTitlePart2')}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mb-8">
            {t('public.admissions.heroSubtitle')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-primary-950 font-bold shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {t('public.admissions.applyNow')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.admissions.applicationProcess')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.admissions.sixSteps')}</h2>
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
                  <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">{t(`public.admissions.${s.titleKey}`)}</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400">{t(`public.admissions.${s.descKey}`)}</p>
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
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('public.admissions.requirements')}</h3>
            <ul className="space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t(`public.admissions.${r}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 hover:shadow-xl transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('public.admissions.deadlines')}</h3>
            <ul className="space-y-3">
              {DEADLINES.map((d) => (
                <li key={d.eventKey} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t(`public.admissions.${d.eventKey}`)}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                    {t(`public.admissions.${d.dateKey}`)}
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
              {t('public.admissions.tuitionFees')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.admissions.affordable')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEES.map((f) => (
              <div
                key={f.programKey}
                className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">{t(`public.admissions.${f.programKey}`)}</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-accent-400 mb-1">{t(`public.admissions.${f.amountKey}`)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t(`public.admissions.${f.subKey}`)}</p>
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
              {t('public.admissions.scholarships')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">{t('public.admissions.funding')}</h2>
            <p className="text-primary-200 mt-3">{t('public.admissions.fundingSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCHOLARSHIPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.titleKey}
                  className="group rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 hover:-translate-y-1 transition-all"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-md mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t(`public.admissions.${s.titleKey}`)}</h3>
                  <p className="text-sm text-primary-200">{t(`public.admissions.${s.descKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
