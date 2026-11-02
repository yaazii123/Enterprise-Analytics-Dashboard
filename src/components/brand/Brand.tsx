import { Compass } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className="brand-lockup"><span className="logo"><Compass size={23} strokeWidth={1.8} /></span><span className={compact ? 'nav-text brand-name' : 'brand-name'}>Nexora<span className="brand-subtitle">Analytics</span></span></span>;
}
