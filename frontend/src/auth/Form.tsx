import React, { useState } from 'react';
import { useBackendAuth } from '../hooks/UseBackendAuth';
import { AlertCircle, Eye, EyeOff, Mail, Lock, User, ChevronRight, ChevronLeft, TreePine } from 'lucide-react';

/* ── design tokens (matches RootsBridge landing palette) ── */
const C = {
  navy:       '#0d2557',
  navyMid:    '#1a3a7a',
  navyLight:  '#2a52a0',
  gold:       '#c9a84c',
  goldLight:  '#e8c97a',
  cream:      '#f8f5ef',
  creamDark:  '#ede8df',
  textDark:   '#0d1f3c',
  textMid:    '#3a4e6e',
  textMuted:  '#7a8faa',
  white:      '#ffffff',
  red:        '#dc2626',
  redLight:   '#fef2f2',
  redBorder:  '#fca5a5',
};

/* ── reusable styled pieces ── */
const inputBase: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${C.creamDark}`, borderRadius: 8,
  fontSize: '0.95rem', color: C.textDark,
  backgroundColor: C.cream, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.84rem', fontWeight: 600,
  color: C.textMid, marginBottom: 6,
};

const btnPrimary: React.CSSProperties = {
  width: '100%', padding: '13px 20px',
  backgroundColor: C.navy, color: C.white,
  border: 'none', borderRadius: 10,
  fontSize: '1rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'background 0.2s',
};

const btnSecondary: React.CSSProperties = {
  flex: 1, padding: '12px 20px',
  backgroundColor: C.creamDark, color: C.textMid,
  border: `1.5px solid ${C.creamDark}`, borderRadius: 10,
  fontSize: '0.95rem', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

const btnAccent: React.CSSProperties = {
  flex: 1, padding: '12px 20px',
  backgroundColor: C.navyMid, color: C.white,
  border: 'none', borderRadius: 10,
  fontSize: '0.95rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

/* ── Field wrapper ── */
const Field: React.FC<{
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}> = ({ label, required, hint, error, children }) => (
  <div style={{ marginBottom: 2 }}>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      {hint && <span style={{ color: C.textMuted, fontWeight: 400, marginLeft: 6, fontSize: '0.78rem' }}>{hint}</span>}
    </label>
    {children}
    {error && <p style={{ marginTop: 4, fontSize: '0.82rem', color: C.red }}>{error}</p>}
  </div>
);

/* ── Input with optional left icon & right toggle ── */
const TextInput: React.FC<{
  type?: string; id: string; name: string; value: string; placeholder?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyPress?: React.KeyboardEventHandler<HTMLInputElement>;
  hasError?: boolean; leftIcon?: React.ReactNode; rightNode?: React.ReactNode;
}> = ({ type = 'text', id, name, value, placeholder, onChange, onKeyPress, hasError, leftIcon, rightNode }) => (
  <div style={{ position: 'relative' }}>
    {leftIcon && (
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, display: 'flex' }}>
        {leftIcon}
      </span>
    )}
    <input
      type={type} id={id} name={name} value={value}
      placeholder={placeholder} onChange={onChange} onKeyPress={onKeyPress}
      style={{
        ...inputBase,
        borderColor: hasError ? C.red : C.creamDark,
        paddingLeft: leftIcon ? 42 : 14,
        paddingRight: rightNode ? 44 : 14,
      }}
      onFocus={e => { e.target.style.borderColor = hasError ? C.red : C.navyLight; e.target.style.backgroundColor = C.white; }}
      onBlur={e  => { e.target.style.borderColor = hasError ? C.red : C.creamDark; e.target.style.backgroundColor = C.cream; }}
    />
    {rightNode && (
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
        {rightNode}
      </span>
    )}
  </div>
);

/* ── Select ── */
const SelectInput: React.FC<{
  id: string; name: string; value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  children: React.ReactNode;
}> = ({ id, name, value, onChange, children }) => (
  <select id={id} name={name} value={value} onChange={onChange}
    style={{ ...inputBase, appearance: 'auto' }}
    onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.backgroundColor = C.white; }}
    onBlur={e  => { e.target.style.borderColor = C.creamDark;  e.target.style.backgroundColor = C.cream;  }}
  >
    {children}
  </select>
);

/* ════════════════════════════════════════════════════════════════════════════ */

type FormData = {
  email: string; password: string; confirmPassword: string; role: string;
  firstName: string; middleName: string; lastName: string; maidenName: string;
  nicknames: string; gender: string; dateOfBirth: string;
  personEmail: string; phone: string; address: string;
  city: string; state: string; country: string; bio: string; occupation: string;
};

const EMPTY: FormData = {
  email: '', password: '', confirmPassword: '', role: 'GUEST',
  firstName: '', middleName: '', lastName: '', maidenName: '',
  nicknames: '', gender: '', dateOfBirth: '', personEmail: '',
  phone: '', address: '', city: '', state: '', country: '', bio: '', occupation: '',
};

const AuthForm: React.FC = () => {
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [step, setStep]       = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { login, register } = useBackendAuth();

  /* ── validation ── */
  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!formData.email)       e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email';
      if (!formData.password)    e.password = 'Password is required';
      else if (formData.password.length < 8) e.password = 'At least 8 characters';
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
        e.password = 'Must contain uppercase, lowercase & number';
      if (mode === 'register') {
        if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      }
    }
    if (s === 2) {
      if (!formData.firstName) e.firstName = 'First name is required';
      if (!formData.lastName)  e.lastName  = 'Last name is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (mode === 'login') { doLogin(); return; }
    step < 3 ? next() : doRegister();
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => { setStep(s => s - 1); setErrors({}); };

  const doLogin = async () => {
    setApiError('');
    if (!formData.email || !formData.password) { setApiError('Email and password are required'); return; }
    setSubmitting(true);
    try { await login(formData.email, formData.password); }
    catch { setApiError('Invalid email or password. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const doRegister = async () => {
    setApiError('');
    if (!validate(step)) return;
    setSubmitting(true);
    try {
      await register(formData.email, formData.password, 'GUEST');
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: formData.firstName, middleName: formData.middleName || undefined,
          lastName: formData.lastName, maidenName: formData.maidenName || undefined,
          nicknames: formData.nicknames ? formData.nicknames.split(',').map(n => n.trim()) : [],
          gender: formData.gender || undefined, dateOfBirth: formData.dateOfBirth || undefined,
          email: formData.personEmail || formData.email,
          phone: formData.phone || undefined, address: formData.address || undefined,
          city: formData.city || undefined, state: formData.state || undefined,
          country: formData.country || undefined, bio: formData.bio || undefined,
          occupation: formData.occupation || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn('Profile creation failed (non-fatal):', body);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setApiError('This email is already registered. Please sign in instead.');
      } else {
        setApiError(msg || 'Registration failed. Please try again.');
      }
    } finally { setSubmitting(false); }
  };

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setStep(1); setFormData(EMPTY); setErrors({}); setApiError('');
  };

  /* ── step labels ── */
  const stepLabel = (s: number) => {
    if (mode === 'login') return 'Sign in to your account';
    if (s === 1) return 'Create your login credentials';
    if (s === 2) return 'Tell us about yourself';
    return 'Contact & location details';
  };

  /* ── RENDER ── */
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: C.white, borderRadius: 20, boxShadow: '0 8px 48px rgba(13,37,87,0.22)', width: '100%', maxWidth: 520, overflow: 'hidden' }}>

        {/* ── card header ── */}
        <div style={{ background: C.navy, padding: '2rem 2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: 'rgba(201,168,76,0.18)', borderRadius: '50%', marginBottom: '1rem' }}>
            {mode === 'login'
              ? <User size={26} color={C.gold} />
              : <TreePine size={26} color={C.gold} />
            }
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.white, margin: '0 0 .35rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join RootsBridge'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', margin: 0 }}>
            {stepLabel(step)}
          </p>

          {/* stepper (register only) */}
          {mode === 'register' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: '1.5rem' }}>
              {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: s <= step ? C.gold : 'rgba(255,255,255,0.15)',
                      color: s <= step ? C.navy : 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem',
                    }}>{s}</div>
                    <span style={{ fontSize: '0.65rem', color: s <= step ? C.goldLight : 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {s === 1 ? 'Account' : s === 2 ? 'Profile' : 'Details'}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ width: 60, height: 2, background: step > s ? C.gold : 'rgba(255,255,255,0.15)', margin: '0 4px', marginBottom: 18, flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* ── card body ── */}
        <div style={{ padding: '2rem' }}>

          {/* api error */}
          {apiError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 8, padding: '12px 14px', marginBottom: '1.25rem' }}>
              <AlertCircle size={17} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b' }}>{apiError}</p>
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <Field label="Email Address" error={errors.email}>
                <TextInput type="email" id="email" name="email" value={formData.email}
                  placeholder="you@example.com" onChange={handleChange} onKeyPress={handleKey}
                  hasError={!!errors.email} leftIcon={<Mail size={17} />} />
              </Field>
              <Field label="Password" error={errors.password}>
                <TextInput type={showPwd ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} placeholder="••••••••"
                  onChange={handleChange} onKeyPress={handleKey} hasError={!!errors.password}
                  leftIcon={<Lock size={17} />}
                  rightNode={
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </Field>
              <button onClick={doLogin} disabled={submitting}
                style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          )}

          {/* ── REGISTER STEP 1 ── */}
          {mode === 'register' && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <Field label="Email Address" required error={errors.email}>
                <TextInput type="email" id="email" name="email" value={formData.email}
                  placeholder="you@example.com" onChange={handleChange} onKeyPress={handleKey}
                  hasError={!!errors.email} leftIcon={<Mail size={17} />} />
              </Field>
              <Field label="Password" required error={errors.password}>
                <TextInput type={showPwd ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} placeholder="Min. 8 chars, upper + lower + number"
                  onChange={handleChange} onKeyPress={handleKey} hasError={!!errors.password}
                  leftIcon={<Lock size={17} />}
                  rightNode={
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </Field>
              <Field label="Confirm Password" required error={errors.confirmPassword}>
                <TextInput type={showCPwd ? 'text' : 'password'} id="confirmPassword" name="confirmPassword"
                  value={formData.confirmPassword} placeholder="Re-enter your password"
                  onChange={handleChange} onKeyPress={handleKey} hasError={!!errors.confirmPassword}
                  leftIcon={<Lock size={17} />}
                  rightNode={
                    <button type="button" onClick={() => setShowCPwd(v => !v)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.textMuted, display: 'flex' }}>
                      {showCPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </Field>
              <button onClick={next} style={btnPrimary}>
                Continue to Profile <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── REGISTER STEP 2 ── */}
          {mode === 'register' && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="First Name" required error={errors.firstName}>
                  <TextInput id="firstName" name="firstName" value={formData.firstName}
                    onChange={handleChange} hasError={!!errors.firstName} />
                </Field>
                <Field label="Middle Name">
                  <TextInput id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Last Name" required error={errors.lastName}>
                  <TextInput id="lastName" name="lastName" value={formData.lastName}
                    onChange={handleChange} hasError={!!errors.lastName} />
                </Field>
                <Field label="Maiden Name">
                  <TextInput id="maidenName" name="maidenName" value={formData.maidenName} onChange={handleChange} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Gender">
                  <SelectInput id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </SelectInput>
                </Field>
                <Field label="Date of Birth">
                  <TextInput type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                </Field>
              </div>
              <Field label="Nicknames" hint="(comma-separated)">
                <TextInput id="nicknames" name="nicknames" value={formData.nicknames}
                  placeholder="e.g. Mike, Mikey" onChange={handleChange} />
              </Field>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={back} style={btnSecondary}><ChevronLeft size={17} /> Back</button>
                <button onClick={next} style={btnAccent}>Continue <ChevronRight size={17} /></button>
              </div>
            </div>
          )}

          {/* ── REGISTER STEP 3 ── */}
          {mode === 'register' && step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <Field label="Phone Number">
                <TextInput type="tel" id="phone" name="phone" value={formData.phone}
                  placeholder="+1 555 000 0000" onChange={handleChange} />
              </Field>
              <Field label="Address">
                <TextInput id="address" name="address" value={formData.address} onChange={handleChange} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <Field label="City">
                  <TextInput id="city" name="city" value={formData.city} onChange={handleChange} />
                </Field>
                <Field label="State">
                  <TextInput id="state" name="state" value={formData.state} onChange={handleChange} />
                </Field>
                <Field label="Country">
                  <TextInput id="country" name="country" value={formData.country} onChange={handleChange} />
                </Field>
              </div>
              <Field label="Occupation">
                <TextInput id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
              </Field>
              <Field label="Bio">
                <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  placeholder="Tell us about yourself…"
                  style={{ ...inputBase, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.backgroundColor = C.white; }}
                  onBlur={e  => { e.target.style.borderColor = C.creamDark;  e.target.style.backgroundColor = C.cream; }}
                />
              </Field>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={back} style={btnSecondary}><ChevronLeft size={17} /> Back</button>
                <button onClick={doRegister} disabled={submitting}
                  style={{ ...btnAccent, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Creating Account…' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}

          {/* ── mode toggle ── */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: `1px solid ${C.creamDark}`, paddingTop: '1.25rem' }}>
            <button onClick={toggleMode}
              style={{ background: 'none', border: 'none', color: C.navyMid, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {mode === 'login' ? "Don't have an account? Sign up →" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthForm;
