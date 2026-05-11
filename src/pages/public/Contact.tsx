import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, HelpCircle, Users } from 'lucide-react';

export function Contact() {
  const { t } = useTranslation();

  const CONTACT_INFO = [
    { icon: MapPin, labelKey: 'info1Label', valueKey: 'info1Value', color: 'from-blue-500 to-indigo-600' },
    { icon: Phone, labelKey: 'info2Label', value: '+20 82 231 7950', color: 'from-emerald-500 to-emerald-700' },
    { icon: Mail, labelKey: 'info3Label', value: 'info@bsu.edu.eg', color: 'from-amber-500 to-orange-600' },
    { icon: Clock, labelKey: 'info4Label', valueKey: 'info4Value', color: 'from-purple-500 to-purple-700' },
  ];

  const DEPARTMENTS = [
    { icon: Users, nameKey: 'dept1Name', email: 'admissions@bsu.edu.eg', phone: '+20 82 231 7951' },
    { icon: HelpCircle, nameKey: 'dept2Name', email: 'students@bsu.edu.eg', phone: '+20 82 231 7952' },
    { icon: MessageSquare, nameKey: 'dept3Name', email: 'international@bsu.edu.eg', phone: '+20 82 231 7953' },
  ];

  const FAQ = [
    { qKey: 'faq1Q', aKey: 'faq1A' },
    { qKey: 'faq2Q', aKey: 'faq2A' },
    { qKey: 'faq3Q', aKey: 'faq3A' },
    { qKey: 'faq4Q', aKey: 'faq4A' },
  ];

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            {t('public.contact.kicker')}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-3xl">
            {t('public.contact.heroTitlePart1')}<span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">{t('public.contact.heroTitleHighlight')}</span>{t('public.contact.heroTitlePart2')}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl">
            {t('public.contact.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-12 -mt-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map((c) => {
              const Icon = c.icon;
              const value = c.valueKey ? t(`public.contact.${c.valueKey}`) : c.value;
              return (
                <div
                  key={c.labelKey}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.color} text-white mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{t(`public.contact.${c.labelKey}`)}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('public.contact.sendMessage')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{t('public.contact.respondNote')}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('public.contact.labelName')}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all text-sm"
                    placeholder={t('public.contact.placeholderName')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('public.contact.labelEmail')}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all text-sm"
                    placeholder={t('public.contact.placeholderEmail')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('public.contact.labelSubject')}</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all text-sm"
                  placeholder={t('public.contact.placeholderSubject')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('public.contact.labelMessage')}</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all text-sm resize-none"
                  placeholder={t('public.contact.placeholderMessage')}
                />
              </div>
              <button
                type="submit"
                disabled={sent}
                className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold shadow-md transition-all ${
                  sent
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:-translate-y-0.5'
                }`}
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> {t('public.contact.messageSent')}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> {t('public.contact.sendButton')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl flex-1 min-h-[400px] group">
              <iframe
                title={t('public.contact.mapTitle')}
                src="https://www.openstreetmap.org/export/embed.html?bbox=31.0700%2C29.0580%2C31.0950%2C29.0750&amp;layer=mapnik&amp;marker=29.0656%2C31.0828"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://www.openstreetmap.org/?mlat=29.0656&mlon=31.0828#map=16/29.0656/31.0828"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg text-xs font-semibold text-primary-700 dark:text-accent-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                <MapPin className="h-3.5 w-3.5" />
                {t('public.contact.openInMaps')}
              </a>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/20 p-4 shadow-lg pointer-events-none">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-primary-950 shadow-md shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{t('public.contact.universityName')}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{t('public.contact.mapAddress')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { lKey: 'labelLatitude', vKey: 'valueLatitude' },
                { lKey: 'labelLongitude', vKey: 'valueLongitude' },
                { lKey: 'labelFromCairo', vKey: 'valueFromCairo' },
                { lKey: 'labelBusRoutes', vKey: 'valueBusRoutes' },
              ].map((d) => (
                <div key={d.lKey} className="rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-3 text-center hover:shadow-md transition-all">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{t(`public.contact.${d.lKey}`)}</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{t(`public.contact.${d.vKey}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.contact.directContacts')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.contact.reachTeam')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEPARTMENTS.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.nameKey}
                  className="group rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t(`public.contact.${d.nameKey}`)}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> {d.email}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {d.phone}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <p className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {t('public.contact.faqKicker')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t('public.contact.quickAnswers')}</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <button
                key={i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="block w-full text-left rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">{t(`public.contact.${f.qKey}`)}</h4>
                  <span className={`text-2xl text-primary-600 dark:text-accent-400 transition-transform duration-300 ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
                </div>
                <div className={`grid transition-all duration-300 ${openIdx === i ? 'grid-rows-[1fr] mt-3' : 'grid-rows-[0fr]'}`}>
                  <p className="overflow-hidden text-sm text-slate-600 dark:text-slate-400">{t(`public.contact.${f.aKey}`)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
