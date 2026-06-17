import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';
import { LegalPage, type LegalSection } from './LegalPage';

const SECTIONS: LegalSection[] = [
  { icon: Database, titleKey: 'sec1Title', bodyKeys: ['sec1B1', 'sec1B2'] },
  { icon: Eye, titleKey: 'sec2Title', bodyKeys: ['sec2B1', 'sec2B2', 'sec2B3'] },
  { icon: Lock, titleKey: 'sec3Title', bodyKeys: ['sec3B1', 'sec3B2'] },
  { icon: UserCheck, titleKey: 'sec4Title', bodyKeys: ['sec4B1', 'sec4B2'] },
  { icon: Shield, titleKey: 'sec5Title', bodyKeys: ['sec5B1', 'sec5B2'] },
  { icon: Mail, titleKey: 'sec6Title', bodyKeys: ['sec6B1'] },
];

export function PrivacyPolicy() {
  return <LegalPage ns="privacyPolicy" sections={SECTIONS} />;
}
