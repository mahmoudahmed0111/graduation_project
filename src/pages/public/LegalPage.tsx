import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Printer, MessageCircle, type LucideIcon } from 'lucide-react';

export interface LegalSection {
  /** Icon shown beside the section heading. */
  icon: LucideIcon;
  /** i18n key (relative to the page namespace) for the section title. */
  titleKey: string;
  /** i18n keys (relative to the page namespace) for each body paragraph. */
  bodyKeys: string[];
}

interface LegalPageProps {
  /** Translation namespace under `public.*`, e.g. 'privacyPolicy' | 'termsOfUse'. */
  ns: 'privacyPolicy' | 'termsOfUse';
  sections: LegalSection[];
}

/**
 * Shared layout for long-form legal documents (Privacy Policy, Terms of Use).
 * Renders a hero, a sticky scroll-spy table of contents, anchored sections,
 * a reading-progress bar and a print action. All copy comes from
 * `public.<ns>.*` plus shared chrome strings under `public.legal.*`.
 */
export function LegalPage({ ns, sections }: LegalPageProps) {
  const { t } = useTranslation();
  const base = `public.${ns}`;

  // Stable anchor id per section, derived from its title key (e.g. "sec1").
  const items = useMemo(
    () =>
      sections.map((s) => ({
        ...s,
        id: s.titleKey.replace(/Title$/, ''),
      })),
    [sections]
  );

  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: highlight the TOC entry for the section nearest the top.
  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  // Reading-progress bar + back-to-top visibility.
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const start = el.offsetTop;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = window.scrollY - start;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* Reading progress bar (hidden when printing). */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent print:hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-500 to-accent-300 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden print:bg-white print:text-black print:py-8">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl print:hidden" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4 print:hidden">
            {t(`${base}.kicker`)}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t(`${base}.heroTitle`)}</h1>
          <p className="text-primary-100 max-w-2xl print:text-slate-600">{t(`${base}.heroSubtitle`)}</p>
          <p className="mt-4 text-xs text-primary-200 print:text-slate-500">{t(`${base}.lastUpdated`)}</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-950 print:py-4">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-12">
            {/* Sticky table of contents */}
            <aside className="hidden lg:block print:hidden">
              <nav
                aria-label={t('public.legal.onThisPage')}
                className="sticky top-24 space-y-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('public.legal.onThisPage')}
                </p>
                <ul className="space-y-1 border-s border-gray-100 dark:border-slate-800">
                  {items.map((it) => {
                    const active = activeId === it.id;
                    return (
                      <li key={it.id}>
                        <a
                          href={`#${it.id}`}
                          aria-current={active ? 'true' : undefined}
                          className={[
                            'block border-s-2 -ms-px ps-4 py-1.5 text-sm transition-colors',
                            active
                              ? 'border-accent-500 text-primary-700 dark:text-accent-300 font-semibold'
                              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                          ].join(' ')}
                        >
                          {t(`${base}.${it.titleKey}`)}
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-accent-300 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  {t('public.legal.print')}
                </button>
              </nav>
            </aside>

            {/* Document body */}
            <div ref={contentRef}>
              <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/20 border border-primary-100 dark:border-primary-800 p-6 mb-10">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {t(`${base}.intro`)}
                </p>
              </div>

              <div className="space-y-6">
                {items.map((s) => {
                  const Icon = s.icon;
                  return (
                    <section
                      key={s.id}
                      id={s.id}
                      className="group scroll-mt-24 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 transition-all hover:shadow-xl hover:-translate-y-0.5 print:border-slate-200 print:shadow-none print:translate-y-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shrink-0 transition-transform group-hover:scale-110 print:shadow-none">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                            {t(`${base}.${s.titleKey}`)}
                          </h2>
                          <div className="space-y-3">
                            {s.bodyKeys.map((bk, i) => (
                              <p
                                key={i}
                                className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                              >
                                {t(`${base}.${bk}`)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Closing call-to-action */}
              <div className="mt-10 rounded-2xl border border-dashed border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20 p-8 text-center print:hidden">
                <MessageCircle className="mx-auto h-8 w-8 text-primary-500 dark:text-accent-400" />
                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {t('public.legal.questionsTitle')}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {t('public.legal.questionsSubtitle')}
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-105"
                >
                  {t('public.legal.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
