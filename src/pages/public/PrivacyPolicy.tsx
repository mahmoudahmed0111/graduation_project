import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

const SECTIONS = [
  {
    icon: Database,
    title: '1. Information We Collect',
    body: [
      'We collect information you provide directly to us, such as when you create an account, apply for admission, register for events, or contact us. This may include your name, email, phone number, national ID, academic records, and payment information.',
      'We also automatically collect certain technical information when you use our services, including IP address, browser type, device identifiers, and usage data through cookies and similar technologies.',
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    body: [
      'To process applications, manage enrollment, deliver academic services, and communicate with students, faculty, and visitors.',
      'To improve our website and services, conduct research, ensure security, and comply with legal obligations.',
      'To send important notifications about courses, events, deadlines, and university policies.',
    ],
  },
  {
    icon: Lock,
    title: '3. How We Protect Your Information',
    body: [
      'We implement industry-standard security measures including encryption, access controls, secure servers, and regular security audits to protect your personal data from unauthorized access, disclosure, alteration, or destruction.',
      'However, no method of transmission over the internet is 100% secure. We strive to protect your information but cannot guarantee absolute security.',
    ],
  },
  {
    icon: UserCheck,
    title: '4. Your Rights',
    body: [
      'You have the right to access, correct, update, or request deletion of your personal information. You may also object to certain processing or request data portability.',
      'To exercise any of these rights, please contact our Data Protection Officer at privacy@bsu.edu.eg.',
    ],
  },
  {
    icon: Shield,
    title: '5. Data Sharing',
    body: [
      'We do not sell your personal information. We may share data with trusted third-party service providers (such as payment processors and IT vendors) under strict confidentiality obligations, or when required by Egyptian law.',
      'Aggregated and anonymized data may be shared for research, statistics, and reporting purposes.',
    ],
  },
  {
    icon: Mail,
    title: '6. Contact Us',
    body: [
      'If you have any questions about this Privacy Policy or our data practices, please reach out to us at privacy@bsu.edu.eg or write to: Data Protection Office, Beni Suef University, Salah Salem St., Beni Suef 62511, Egypt.',
    ],
  },
];

export function PrivacyPolicy() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-primary-100 max-w-2xl">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="mt-4 text-xs text-primary-200">Last updated: January 1, 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/20 border border-primary-100 dark:border-primary-800 p-6 mb-10">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Beni Suef University ("BSU", "we", "our", "us") respects your privacy and is committed to protecting your personal data. This policy explains how we handle information collected through our website, portals, and on-campus services in accordance with Egyptian data protection laws.
            </p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 border border-gray-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
                      <div className="space-y-3">
                        {s.body.map((p, i) => (
                          <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
