import { FileText, Users, AlertTriangle, Ban, Scale, RefreshCw, Mail } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using the Beni Suef University website, student portal, or related services, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.',
      'These terms apply to all visitors, students, faculty, staff, and any other users of BSU online services.',
    ],
  },
  {
    icon: Users,
    title: '2. User Accounts',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.',
      'Account holders must provide accurate and current information. Sharing credentials, impersonating others, or creating fraudulent accounts is strictly prohibited and may result in disciplinary action.',
    ],
  },
  {
    icon: Ban,
    title: '3. Acceptable Use',
    body: [
      'You agree not to use our services to: violate laws or regulations; infringe intellectual property rights; transmit harmful code or malware; harass or harm others; attempt unauthorized access; or disrupt operations.',
      'Misuse of academic systems — including cheating, plagiarism, falsifying records, or sharing exam content — may result in academic penalties up to and including expulsion.',
    ],
  },
  {
    icon: Scale,
    title: '4. Intellectual Property',
    body: [
      'All content on this website — including text, graphics, logos, images, and software — is the property of Beni Suef University or its licensors and is protected by copyright and trademark laws.',
      'You may use this content for personal, non-commercial educational purposes only. Reproduction, distribution, or modification without written permission is prohibited.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '5. Disclaimers & Limitation of Liability',
    body: [
      'Our services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee uninterrupted access, error-free operation, or accuracy of all content.',
      'To the fullest extent permitted by law, BSU shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.',
    ],
  },
  {
    icon: RefreshCw,
    title: '6. Modifications',
    body: [
      'We reserve the right to modify these Terms at any time. Changes become effective when posted on this page. Continued use of our services after changes constitutes acceptance of the modified Terms.',
      'Material changes will be communicated via email or prominent notice on the website where reasonably possible.',
    ],
  },
  {
    icon: Mail,
    title: '7. Contact',
    body: [
      'For questions about these Terms of Use, please contact: legal@bsu.edu.eg or write to the Office of Legal Affairs, Beni Suef University, Salah Salem St., Beni Suef 62511, Egypt.',
    ],
  },
];

export function TermsOfUse() {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container mx-auto px-6 relative animate-fade-in-up">
          <p className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-accent-300 text-xs font-semibold uppercase tracking-wider mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Terms of Use</h1>
          <p className="text-primary-100 max-w-2xl">
            Please read these terms carefully before using our website and services.
          </p>
          <p className="mt-4 text-xs text-primary-200">Last updated: January 1, 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/30 dark:to-amber-900/20 border border-primary-100 dark:border-primary-800 p-6 mb-10">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              These Terms of Use govern your access to and use of websites, applications, and digital services provided by Beni Suef University. By using our services, you accept and agree to be bound by these terms.
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
