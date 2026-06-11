import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBackendAuth } from '../hooks/UseBackendAuth';
import { Camera, Save, Send, CheckCircle, XCircle, Clock, AlertCircle, Edit3, LogOut } from 'lucide-react';
// import { useLang } from '../contexts/LanguageContext';

const C = {
  navy: '#0d2557', navyMid: '#1a3a7a', navyLight: '#2a52a0',
  gold: '#c9a84c', goldLight: '#e8c97a',
  cream: '#f8f5ef', creamDark: '#ede8df',
  textDark: '#0d1f3c', textMid: '#3a4e6e', textMuted: '#7a8faa', white: '#ffffff',
  red: '#dc2626', redLight: '#fef2f2',
  green: '#166534', greenLight: '#dcfce7',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: `1.5px solid ${C.creamDark}`,
  borderRadius: 8, fontSize: '0.9rem', color: C.textDark,
  backgroundColor: C.cream, outline: 'none', fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 700,
  color: C.textMid, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const sectionCard: React.CSSProperties = {
  background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`,
  padding: '1.5rem', marginBottom: '1.25rem',
  boxShadow: '0 2px 10px rgba(13,37,87,0.06)',
};

const FInput: React.FC<{
  label: string; name: string; value: string; type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string; required?: boolean; textarea?: boolean; options?: string[];
}> = ({ label, name, value, type = 'text', onChange, placeholder, required, textarea, options }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={labelStyle}>{label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}</label>
    {textarea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
        onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.background = C.white; }}
        onBlur={e  => { e.target.style.borderColor = C.creamDark; e.target.style.background = C.cream; }}
      />
    ) : options ? (
      <select name={name} value={value} onChange={onChange}
        style={{ ...inputStyle, appearance: 'auto' }}
        onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.background = C.white; }}
        onBlur={e  => { e.target.style.borderColor = C.creamDark; e.target.style.background = C.cream; }}
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = C.navyLight; e.target.style.background = C.white; }}
        onBlur={e  => { e.target.style.borderColor = C.creamDark; e.target.style.background = C.cream; }}
      />
    )}
  </div>
);

interface ProfileForm {
  firstName: string; middleName: string; lastName: string; maidenName: string;
  gender: string; dateOfBirth: string; bio: string; occupation: string;
  email: string; phone: string; address: string; city: string; state: string; country: string;
  profilePhoto: string; profileStatus: string;
}

const EMPTY: ProfileForm = {
  firstName: '', middleName: '', lastName: '', maidenName: '',
  gender: '', dateOfBirth: '', bio: '', occupation: '',
  email: '', phone: '', address: '', city: '', state: '', country: '',
  profilePhoto: '', profileStatus: 'DRAFT',
};

const ProfilePage: React.FC = () => {
  const { user, token, logout } = useBackendAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form,      setForm]      = useState<ProfileForm>(EMPTY);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'account'>('info');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProfile = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/person/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setForm({
          firstName:     data.firstName     ?? '',
          middleName:    data.middleName    ?? '',
          lastName:      data.lastName      ?? '',
          maidenName:    data.maidenName    ?? '',
          gender:        data.gender        ?? '',
          dateOfBirth:   data.dateOfBirth   ? data.dateOfBirth.split('T')[0] : '',
          bio:           data.bio           ?? '',
          occupation:    data.occupation    ?? '',
          email:         data.email         ?? '',
          phone:         data.phone         ?? '',
          address:       data.address       ?? '',
          city:          data.city          ?? '',
          state:         data.state         ?? '',
          country:       data.country       ?? '',
          profilePhoto:  data.profilePhoto  ?? '',
          profileStatus: data.profileStatus ?? 'DRAFT',
        });
        setPhotoPreview(data.profilePhoto ?? '');
      }
    } catch { /* no profile yet */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  /* photo upload — convert to base64 data URL for demo; in prod use an upload endpoint */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('Photo must be under 3MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      setForm(p => ({ ...p, profilePhoto: url }));
    };
    reader.readAsDataURL(file);
  };

  /* also support photo URL input */
  const handlePhotoUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoPreview(e.target.value);
    setForm(p => ({ ...p, profilePhoto: e.target.value }));
  };

  const save = async (submit = false) => {
    if (!form.firstName || !form.lastName) { showToast('First and last name are required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        profileStatus: submit ? 'PENDING' : 'DRAFT',
        dateOfBirth: form.dateOfBirth || undefined,
        submittedAt: submit ? new Date().toISOString() : undefined,
      };
      const res = await fetch(`${API_URL}/api/person/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(submit ? 'Profile submitted for review! ✅' : 'Profile saved successfully ✅');
        await loadProfile();
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || 'Failed to save profile', 'error');
      }
    } catch { showToast('Connection error', 'error'); }
    finally { setSaving(false); }
  };

  const statusConfig: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
    DRAFT:    { icon: <Edit3 size={13} />,    label: 'Draft',          bg: C.creamDark,  color: C.textMuted },
    PENDING:  { icon: <Clock size={13} />,    label: 'Pending Review', bg: '#fef3c7',    color: '#92400e'   },
    APPROVED: { icon: <CheckCircle size={13}/>,label: 'Approved',      bg: C.greenLight, color: C.green     },
    REJECTED: { icon: <XCircle size={13} />,  label: 'Rejected',       bg: '#fee2e2',    color: C.red       },
  };

  const status = statusConfig[form.profileStatus] ?? statusConfig.DRAFT;
  const hasPhoto = !!photoPreview;
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ');
  const initials = [form.firstName[0], form.lastName[0]].filter(Boolean).join('').toUpperCase();

  const tabs: { key: 'info' | 'contact' | 'account'; label: string; icon: string }[] = [
    { key: 'info',    label: 'Personal Info',   icon: '👤' },
    { key: 'contact', label: 'Contact',         icon: '📍' },
    { key: 'account', label: 'Account',         icon: '⚙️'  },
  ];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${C.creamDark}`, borderTop: `3px solid ${C.navy}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999,
          background: toast.type === 'success' ? C.navy : C.red,
          color: C.white, padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: '0.875rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      {/* hero banner */}
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, padding: '2rem 2rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>

          {/* avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', border: `3px solid ${C.gold}`, overflow: 'hidden', background: C.navyLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 900, fontSize: '2rem' }}>{initials || '?'}</span>
              }
            </div>
            <button onClick={() => fileRef.current?.click()} style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: '50%',
              background: C.gold, border: `2px solid ${C.navy}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Camera size={13} color={C.navy} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 900, color: C.white, margin: '0 0 4px', lineHeight: 1.2 }}>
              {fullName || 'Your Profile'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '0 0 10px' }}>
              {user?.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: status.bg, color: status.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>
                {status.icon} {status.label}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.12)', color: C.white, padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>
                🛡️ {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '-1.5rem auto 0', padding: '0 1.5rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* no-photo advisory */}
        {!hasPhoto && (
          <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem' }}>📸</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: C.goldLight, fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>Add a profile photo!</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', margin: '2px 0 0' }}>
                Your family members won't be able to recognise you in the tree without a photo.
              </p>
            </div>
            <button onClick={() => fileRef.current?.click()} style={{
              background: C.gold, color: C.navy, border: 'none', borderRadius: 8,
              padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
            }}>Upload Photo</button>
          </div>
        )}

        {/* rejection notice */}
        {form.profileStatus === 'REJECTED' && (
          <div style={{ background: C.redLight, border: `1px solid #fca5a5`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 10 }}>
            <AlertCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: C.red, fontWeight: 700, fontSize: '0.875rem', margin: '0 0 3px' }}>Profile Rejected</p>
              <p style={{ color: '#991b1b', fontSize: '0.82rem', margin: 0 }}>Please update your information and resubmit for review.</p>
            </div>
          </div>
        )}

        {/* tabs */}
        <div style={{ ...sectionCard, padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.creamDark}` }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '13px 8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: activeTab === tab.key ? C.navy : C.white,
                color: activeTab === tab.key ? C.white : C.textMuted,
                borderBottom: activeTab === tab.key ? `3px solid ${C.gold}` : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div style={{ padding: '1.5rem' }}>

            {/* ── TAB: PERSONAL INFO ── */}
            {activeTab === 'info' && (
              <div>
                {/* photo URL input */}
                <div style={{ marginBottom: '1.25rem', padding: '1rem', background: C.cream, borderRadius: 10 }}>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>Profile Photo</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${C.creamDark}`, overflow: 'hidden', background: C.navyMid, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {photoPreview
                        ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.9rem' }}>{initials || '?'}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <input type="url" placeholder="Paste a photo URL, or…"
                        value={form.profilePhoto.startsWith('data:') ? '' : form.profilePhoto}
                        onChange={handlePhotoUrl}
                        style={{ ...inputStyle, marginBottom: 6 }}
                      />
                      <button onClick={() => fileRef.current?.click()} style={{
                        background: C.navy, color: C.white, border: 'none', borderRadius: 7,
                        padding: '7px 14px', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                        <Camera size={13} /> Upload from device
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <FInput label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
                  <FInput label="Last Name"  name="lastName"  value={form.lastName}  onChange={handleChange} required />
                  <FInput label="Middle Name"  name="middleName"  value={form.middleName}  onChange={handleChange} />
                  <FInput label="Maiden Name"  name="maidenName"  value={form.maidenName}  onChange={handleChange} />
                  <FInput label="Gender" name="gender" value={form.gender} onChange={handleChange} options={['MALE','FEMALE','OTHER']} />
                  <FInput label="Date of Birth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date" />
                </div>
                <FInput label="Occupation" name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Teacher, Engineer…" />
                <FInput label="Bio" name="bio" value={form.bio} onChange={handleChange} textarea placeholder="Tell your family about yourself…" />
              </div>
            )}

            {/* ── TAB: CONTACT ── */}
            {activeTab === 'contact' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <FInput label="Email"        name="email"   value={form.email}   onChange={handleChange} type="email" />
                  <FInput label="Phone"        name="phone"   value={form.phone}   onChange={handleChange} type="tel"   />
                </div>
                <FInput label="Address" name="address" value={form.address} onChange={handleChange} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
                  <FInput label="City"    name="city"    value={form.city}    onChange={handleChange} />
                  <FInput label="State"   name="state"   value={form.state}   onChange={handleChange} />
                  <FInput label="Country" name="country" value={form.country} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* ── TAB: ACCOUNT ── */}
            {activeTab === 'account' && (
              <div>
                <div style={{ background: C.cream, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                  <p style={labelStyle}>Account Email</p>
                  <p style={{ color: C.textDark, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{user?.email}</p>
                </div>
                <div style={{ background: C.cream, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                  <p style={labelStyle}>Role</p>
                  <p style={{ color: C.textDark, fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{user?.role}</p>
                </div>
                <div style={{ background: C.cream, borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
                  <p style={labelStyle}>Profile Status</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: status.bg, color: status.color, padding: '4px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700 }}>
                    {status.icon} {status.label}
                  </span>
                  {form.profileStatus === 'DRAFT' && (
                    <p style={{ fontSize: '0.78rem', color: C.textMuted, marginTop: 6 }}>
                      Complete your profile and submit it for admin review to appear in the family tree.
                    </p>
                  )}
                </div>
                <button onClick={logout} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                  background: '#fee2e2', color: C.red, border: 'none', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* action bar */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`, padding: '1.25rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', boxShadow: '0 2px 10px rgba(13,37,87,0.06)' }}>
          <button onClick={() => save(false)} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.creamDark, color: C.textMid, border: 'none', borderRadius: 9,
            padding: '10px 20px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.6 : 1,
          }}>
            <Save size={15} /> Save Draft
          </button>
          {form.profileStatus !== 'APPROVED' && (
            <button onClick={() => save(true)} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: C.navy, color: C.white, border: 'none', borderRadius: 9,
              padding: '10px 20px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit',
              opacity: saving ? 0.6 : 1,
            }}>
              <Send size={15} /> {saving ? 'Saving…' : 'Submit for Review'}
            </button>
          )}
          {form.profileStatus === 'APPROVED' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontWeight: 700, fontSize: '0.875rem' }}>
              <CheckCircle size={16} /> Profile Approved — visible in tree
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
