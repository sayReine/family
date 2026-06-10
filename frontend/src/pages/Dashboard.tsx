import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendAuth } from '../hooks/UseBackendAuth';
import { useLang } from '../contexts/LanguageContext';
import { personsAPI, familiesAPI } from '../services/api';

/* ── design tokens ─────────────────────────────────────────────────────────── */
const C = {
  navy:      '#0d2557',
  navyMid:   '#1a3a7a',
  navyLight: '#2a52a0',
  gold:      '#c9a84c',
  goldLight: '#e8c97a',
  cream:     '#f8f5ef',
  creamDark: '#ede8df',
  textDark:  '#0d1f3c',
  textMid:   '#3a4e6e',
  textMuted: '#7a8faa',
  white:     '#ffffff',
  green:     '#166534',
  greenBg:   '#dcfce7',
};

/* ── tiny SVG logo ─────────────────────────────────────────────────────────── */
const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="8"  r="4"   fill={C.gold} />
    <circle cx="8"  cy="22" r="3.5" fill="rgba(255,255,255,0.7)" />
    <circle cx="24" cy="22" r="3.5" fill="rgba(255,255,255,0.7)" />
    <line x1="16" y1="12" x2="12" y2="18.5" stroke={C.gold} strokeWidth="2" />
    <line x1="16" y1="12" x2="20" y2="18.5" stroke={C.gold} strokeWidth="2" />
  </svg>
);

/* ── stat card ─────────────────────────────────────────────────────────────── */
const StatCard: React.FC<{
  label: string; value: string | number; sub: string; accent?: string;
}> = ({ label, value, sub, accent = C.navy }) => (
  <div style={{
    background: C.white, borderRadius: 14, padding: '1.4rem 1.6rem',
    border: `1px solid ${C.creamDark}`, boxShadow: '0 2px 10px rgba(13,37,87,0.07)',
    borderTop: `3px solid ${accent}`,
  }}>
    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
      {label}
    </p>
    <p style={{ fontSize: '2.1rem', fontWeight: 900, color: accent, margin: '0 0 2px' }}>
      {value}
    </p>
    <p style={{ fontSize: '0.78rem', color: C.textMuted }}>{sub}</p>
  </div>
);

/* ── quick action button ───────────────────────────────────────────────────── */
const QBtn: React.FC<{ label: string; icon: string; onClick: () => void; primary?: boolean }> = ({ label, icon, onClick, primary }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem',
    border: primary ? 'none' : `1.5px solid ${C.creamDark}`,
    background: primary ? C.navy : C.white,
    color: primary ? C.white : C.textMid,
    transition: 'all 0.15s',
  }}>
    <span style={{ fontSize: '1rem' }}>{icon}</span>
    {label}
  </button>
);

/* ── member avatar chip ────────────────────────────────────────────────────── */
const avatarColors = [C.navy, C.navyMid, '#166534', '#7c3aed', '#b45309', '#0e7490'];
const avatarColor  = (name: string) => {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
};

/* ════════════════════════════════════════════════════════════════════════════ */

interface PersonSummary {
  id: string; firstName: string; lastName: string;
  profilePhoto?: string; city?: string; dateOfBirth?: string; isDeceased: boolean;
}

interface FamilySummary {
  id: string; name: string; description: string | null;
  memberCount: number; isMember: boolean; myRole: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useBackendAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [persons,  setPersons]  = useState<PersonSummary[]>([]);
  const [families, setFamilies] = useState<FamilySummary[]>([]);
  const [loading,  setLoading]  = useState(true);

  const firstName = user?.email?.split('@')[0] ?? 'there';

  const load = useCallback(async () => {
    try {
      const [pData, fData] = await Promise.all([
        personsAPI.getPersons().catch(() => ({ people: [] })),
        familiesAPI.list().catch(() => []),
      ]);
      setPersons((pData.people ?? pData).slice(0, 6));
      setFamilies(fData.slice(0, 4));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const myFamilies = families.filter(f => f.isMember);
  const totalGens  = persons.length > 0
    ? Math.max(1, Math.ceil(persons.length / 3))
    : 0;

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`,
        padding: '2.5rem 2rem 3.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />

        {/* tree decoration */}
        <svg style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.07, pointerEvents: 'none' }} width="220" height="200" viewBox="0 0 340 400" fill="none" aria-hidden>
          <circle cx="170" cy="60"  r="40" fill="white"/><circle cx="80"  cy="180" r="36" fill="white"/>
          <circle cx="260" cy="180" r="36" fill="white"/><circle cx="40"  cy="300" r="30" fill="white"/>
          <circle cx="120" cy="300" r="30" fill="white"/><circle cx="220" cy="300" r="30" fill="white"/>
          <circle cx="300" cy="300" r="30" fill="white"/>
          <line x1="170" y1="100" x2="130" y2="145" stroke="white" strokeWidth="3"/>
          <line x1="170" y1="100" x2="210" y2="145" stroke="white" strokeWidth="3"/>
          <line x1="80"  y1="216" x2="60"  y2="270" stroke="white" strokeWidth="3"/>
          <line x1="80"  y1="216" x2="120" y2="270" stroke="white" strokeWidth="3"/>
          <line x1="260" y1="216" x2="220" y2="270" stroke="white" strokeWidth="3"/>
          <line x1="260" y1="216" x2="300" y2="270" stroke="white" strokeWidth="3"/>
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <Logo />
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>
              RootsBridge
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: C.white, margin: '0 0 0.5rem', lineHeight: 1.15 }}>
            Welcome back, <span style={{ color: C.goldLight }}>{firstName}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', margin: '0 0 1.75rem', maxWidth: 480, lineHeight: 1.6 }}>
            Your family's story is growing. Here's everything happening in your tree today.
          </p>
          {/* quick actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/families')} style={{
              background: C.gold, color: C.navy, border: 'none', borderRadius: 10,
              padding: '11px 22px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
            }}>
              👨‍👩‍👧 {t('families')}
            </button>
            <button onClick={() => navigate('/members')} style={{
              background: 'rgba(255,255,255,0.12)', color: C.white,
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10,
              padding: '11px 22px', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
            }}>
              👥 {t('allMembers')}
            </button>
            <button onClick={() => navigate('/generations')} style={{
              background: 'rgba(255,255,255,0.12)', color: C.white,
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 10,
              padding: '11px 22px', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
            }}>
              📊 {t('generations')}
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* stat cards — overlap the banner slightly */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem', marginTop: '-1.5rem', marginBottom: '2rem',
        }}>
          <StatCard label="Family Members"  value={loading ? '…' : persons.length}   sub="In the tree"           accent={C.navy}      />
          <StatCard label="Generations"     value={loading ? '…' : totalGens}         sub="Documented levels"    accent={C.navyMid}   />
          <StatCard label="Families"        value={loading ? '…' : families.length}   sub="Available to browse"  accent={C.gold}      />
          <StatCard label="My Families"     value={loading ? '…' : myFamilies.length} sub="You are a member"     accent={C.navyLight} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Quick Actions */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(13,37,87,0.07)' }}>
              <div style={{ background: C.navy, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem' }}>⚡</span>
                <h2 style={{ color: C.white, fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Quick Actions</h2>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                <QBtn label="View Tree"          icon="🌳" onClick={() => navigate('/tree')}        primary />
                <QBtn label="Browse Families"    icon="🏡" onClick={() => navigate('/families')}              />
                <QBtn label="All Members"        icon="👥" onClick={() => navigate('/members')}               />
                <QBtn label="Generations"        icon="📊" onClick={() => navigate('/generations')}           />
                <QBtn label="My Profile"         icon="👤" onClick={() => navigate('/profile')}               />
                {user?.role === 'ADMIN' && <QBtn label="Admin Panel" icon="🛡️" onClick={() => navigate('/admin')} />}
              </div>
            </div>

            {/* My Families */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(13,37,87,0.07)' }}>
              <div style={{ background: C.navyMid, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👨‍👩‍👧</span>
                  <h2 style={{ color: C.white, fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>My Families</h2>
                </div>
                <button onClick={() => navigate('/families')} style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: C.white,
                  fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                }}>View all →</button>
              </div>
              <div style={{ padding: '1rem' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: C.textMuted, fontSize: '0.875rem' }}>Loading…</div>
                ) : myFamilies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏡</p>
                    <p style={{ color: C.textMuted, fontSize: '0.875rem', marginBottom: '0.75rem' }}>You haven't joined any family yet.</p>
                    <button onClick={() => navigate('/families')} style={{
                      background: C.navy, color: C.white, border: 'none', borderRadius: 8,
                      padding: '9px 18px', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Browse Families</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {myFamilies.map(f => (
                      <div key={f.id} onClick={() => navigate(`/families/${f.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: C.cream, cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = C.creamDark)}
                        onMouseLeave={e => (e.currentTarget.style.background = C.cream)}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 900, fontSize: '1.1rem' }}>{f.name[0]}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                          <p style={{ color: C.textMuted, fontSize: '0.75rem', margin: 0 }}>{f.memberCount} member{f.memberCount !== 1 ? 's' : ''}</p>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: f.myRole === 'ADMIN' ? '#ede9fe' : '#e0f2fe', color: f.myRole === 'ADMIN' ? '#5b21b6' : '#0369a1' }}>
                          {f.myRole}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Recent Members */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(13,37,87,0.07)' }}>
              <div style={{ background: `linear-gradient(135deg,${C.navyMid},${C.navyLight})`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👥</span>
                  <h2 style={{ color: C.white, fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Recent Members</h2>
                </div>
                <button onClick={() => navigate('/members')} style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: C.white,
                  fontSize: '0.75rem', fontWeight: 600, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                }}>See all →</button>
              </div>
              <div style={{ padding: '1rem' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: C.textMuted, fontSize: '0.875rem' }}>Loading…</div>
                ) : persons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</p>
                    <p style={{ color: C.textMuted, fontSize: '0.875rem' }}>No members in the tree yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {persons.map(p => {
                      const name = `${p.firstName} ${p.lastName}`;
                      const initials = `${p.firstName[0] ?? ''}${p.lastName[0] ?? ''}`.toUpperCase();
                      const birthYear = p.dateOfBirth ? new Date(p.dateOfBirth).getFullYear() : null;
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 10, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.cream)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(name), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {p.profilePhoto
                              ? <img src={p.profilePhoto} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ color: C.white, fontWeight: 700, fontSize: '0.82rem' }}>{initials}</span>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: C.textDark, fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                            <p style={{ color: C.textMuted, fontSize: '0.75rem', margin: 0 }}>
                              {birthYear ? `b. ${birthYear}` : ''}{p.city ? ` · ${p.city}` : ''}
                              {p.isDeceased ? ' · †' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Mission mini-card */}
            <div style={{ background: C.navy, borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 10px rgba(13,37,87,0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06 }}>
                <svg width="110" height="110" viewBox="0 0 32 32" fill="none" aria-hidden>
                  <circle cx="16" cy="8"  r="4"   fill="white" />
                  <circle cx="8"  cy="22" r="3.5" fill="white" />
                  <circle cx="24" cy="22" r="3.5" fill="white" />
                  <line x1="16" y1="12" x2="12" y2="18.5" stroke="white" strokeWidth="2" />
                  <line x1="16" y1="12" x2="20" y2="18.5" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 8 }}>Our Mission</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 1rem' }}>
                Every family deserves a living record — a place where lineage is preserved, relationships documented, and no generation is ever forgotten.
              </p>
              <button onClick={() => navigate('/families')} style={{
                background: C.gold, color: C.navy, border: 'none', borderRadius: 8,
                padding: '9px 18px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Start building your tree →
              </button>
            </div>

          </div>
        </div>

        {/* ── ALL FAMILIES STRIP ──────────────────────────────────────── */}
        {families.length > 0 && (
          <div style={{ marginTop: '1.5rem', background: C.white, borderRadius: 14, border: `1px solid ${C.creamDark}`, overflow: 'hidden', boxShadow: '0 2px 10px rgba(13,37,87,0.07)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${C.creamDark}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 700, color: C.textDark, fontSize: '0.95rem', margin: 0 }}>🌍 Available Families</h2>
              <button onClick={() => navigate('/families')} style={{
                background: 'none', border: 'none', color: C.navyMid, fontWeight: 600,
                fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>Browse all →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: C.creamDark }}>
              {families.map(f => (
                <div key={f.id} onClick={() => navigate(`/families/${f.id}`)}
                  style={{ background: C.white, padding: '1.1rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.cream)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.white)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>{f.name[0]}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                      <p style={{ color: C.textMuted, fontSize: '0.73rem', margin: 0 }}>{f.memberCount} member{f.memberCount !== 1 ? 's' : ''}</p>
                    </div>
                    {f.isMember && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: C.greenBg, color: C.green, flexShrink: 0 }}>✓ Joined</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
