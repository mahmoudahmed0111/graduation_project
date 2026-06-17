import { FileText, Users, AlertTriangle, Ban, Scale, RefreshCw, Mail } from 'lucide-react';
import { LegalPage, type LegalSection } from './LegalPage';

const SECTIONS: LegalSection[] = [
  { icon: FileText, titleKey: 'sec1Title', bodyKeys: ['sec1B1', 'sec1B2'] },
  { icon: Users, titleKey: 'sec2Title', bodyKeys: ['sec2B1', 'sec2B2'] },
  { icon: Ban, titleKey: 'sec3Title', bodyKeys: ['sec3B1', 'sec3B2'] },
  { icon: Scale, titleKey: 'sec4Title', bodyKeys: ['sec4B1', 'sec4B2'] },
  { icon: AlertTriangle, titleKey: 'sec5Title', bodyKeys: ['sec5B1', 'sec5B2'] },
  { icon: RefreshCw, titleKey: 'sec6Title', bodyKeys: ['sec6B1', 'sec6B2'] },
  { icon: Mail, titleKey: 'sec7Title', bodyKeys: ['sec7B1'] },
];

export function TermsOfUse() {
  return <LegalPage ns="termsOfUse" sections={SECTIONS} />;
}
