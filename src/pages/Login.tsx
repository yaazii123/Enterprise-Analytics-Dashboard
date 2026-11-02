import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, ShieldCheck, Users, ChartNoAxesCombined } from 'lucide-react';
import { Brand } from '@/components/brand/Brand';
import { LoginCarousel } from '@/components/brand/LoginCarousel';
import { actions, useAppDispatch, useAppSelector } from '@/store';
import { analyticsApi } from '@/services/analytics';
import type { Role } from '@/types';

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access', icon: ShieldCheck },
  { value: 'manager', label: 'Manager', description: 'Team insights', icon: Users },
  { value: 'analyst', label: 'Analyst', description: 'Core analytics', icon: ChartNoAxesCombined },
] as const;

export function Login() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/overview" replace />;

  return <div className="login-stage"><div className="login-shell">
    <section className="login-left" aria-label="Sign in">
      <div className="login-brand"><Brand /></div>
      <form className="login-form panel" onSubmit={async e => {
        e.preventDefault(); setBusy(true); setError('');
        try { dispatch(actions.login(await analyticsApi.login(email, password, role))); }
        catch (err) { setError((err as Error).message); }
        finally { setBusy(false); }
      }}>
        <div className="auth-form-heading"><span className="eyebrow">WELCOME TO NEXORA</span><h2>Welcome back.</h2><p>Sign in and see where your data takes you.</p></div>
        <label htmlFor="login-email">Work email<input id="login-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></label>
        <div className="password-field"><label htmlFor="login-password">Password</label><div className="password-input"><input id="login-password" type={visible ? 'text' : 'password'} autoComplete="current-password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        <fieldset className="role-picker"><legend>Choose your demo role</legend><div className="role-options">{roles.map(({ value, label, description, icon: Icon }) => <label key={value} className={`role-option ${role === value ? 'selected' : ''}`}><input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} /><Icon size={18} /><strong>{label}</strong><small>{description}</small><span className="role-check"><Check size={9} /></span></label>)}</div></fieldset>
        {error && <div role="alert" className="auth-error">{error}</div>}
        <button className="primary auth-submit" disabled={busy}>{busy ? <><LoaderCircle size={16} className="spin" /> Signing in…</> : <>Sign in to workspace <ArrowRight size={16} /></>}</button>
        <div className="demo-note"><span className="demo-pill">DEMO WORKSPACE</span><p>Use any valid email and a password of at least 6 characters. All data is simulated.</p></div>
      </form>
      <div className="auth-entry-footer">Thoughtfully built for a clearer view.</div>
    </section>
    <LoginCarousel />
  </div></div>;
}
