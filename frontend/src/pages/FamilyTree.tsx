import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendAuth } from '../hooks/UseBackendAuth';
import { personsAPI, familiesAPI } from '../services/api';
import PersonCard from '../components/PersonCard';

const C = {
  navy: '#0d2557', navyMid: '#1a3a7a', navyLight: '#2a52a0', gold: '#c9a84c', goldLight: '#e8c97a',
  cream: '#f8f5ef', creamDark: '#ede8df',
  textDark: '#0d1f3c', textMid: '#3a4e6e', textMuted: '#7a8faa', white: '#ffffff',
};

const _avatarColors = [C.navy, C.navyMid, '#166534', '#7c3aed', '#b45309', '#0e7490'];
function avatarColorFn(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return _avatarColors[Math.abs(h) % _avatarColors.length];
}

interface Person {
  id: string; firstName: string; middleName?: string; lastName: string;
  dateOfBirth?: string; dateOfDeath?: string; isDeceased: boolean;
  profilePhoto?: string; city?: string; occupation?: string;
  biologicalFatherId?: string; biologicalMotherId?: string;
}

interface FamilyForTree { id: string; name: string; isMember: boolean; }

/* ── connector pieces ──────────────────────────────────────────────────────── */
const VLine: React.FC<{ height?: number }> = ({ height = 36 }) => (
  <div style={{ width: 2, height, background: C.creamDark, margin: '0 auto' }} />
);

const HBranch: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 1) return <VLine />;
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: 36 }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 2, height: 18, background: C.creamDark }} />
      <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', width: `${Math.min(count - 1, 4) * 162}px`, height: 2, background: C.creamDark }} />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0,
          left: `${(i / (count - 1)) * 100}%`,
          transform: 'translateX(-50%)',
          width: 2, height: 18, background: C.creamDark,
        }} />
      ))}
    </div>
  );
};

const SpouseConnector: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
    <div style={{ width: 24, height: 2, background: C.gold, opacity: 0.7 }} />
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '0.6rem', color: C.navy }}>♥</span>
    </div>
    <div style={{ width: 24, height: 2, background: C.gold, opacity: 0.7 }} />
  </div>
);

/* ── no-photo advisory banner ──────────────────────────────────────────────── */
const NoPhotoBanner: React.FC<{ onGoProfile: () => void }> = ({ onGoProfile }) => (
  <div style={{
    background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
    borderRadius: 14, padding: '1rem 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '1.5rem' }}>📸</span>
      <div>
        <p style={{ color: C.goldLight, fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
          Add a profile photo so your family can recognise you!
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', margin: '2px 0 0' }}>
          Members without photos appear as initials on the family tree.
        </p>
      </div>
    </div>
    <button onClick={onGoProfile} style={{
      background: C.gold, color: C.navy, border: 'none', borderRadius: 8,
      padding: '8px 18px', fontWeight: 700, fontSize: '0.82rem',
      cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
    }}>
      Upload Photo →
    </button>
  </div>
);

/* ── generation row ────────────────────────────────────────────────────────── */
const GenRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{
      fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: C.textMuted,
      marginBottom: 10, background: C.creamDark,
      padding: '2px 12px', borderRadius: 999,
    }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      {children}
    </div>
  </div>
);

/* ── couple unit (person + optional spouse) ────────────────────────────────── */
const Couple: React.FC<{
  main: Person; spouse?: Person; isMe?: boolean;
  onClickMain: () => void; onClickSpouse?: () => void;
}> = ({ main, spouse, isMe, onClickMain, onClickSpouse }) => {
  const mainBirthYear  = main.dateOfBirth  ? new Date(main.dateOfBirth).getFullYear()  : null;
  const spouseBirthYear = spouse?.dateOfBirth ? new Date(spouse.dateOfBirth).getFullYear() : null;
  const mainDeathYear  = main.dateOfDeath  ? new Date(main.dateOfDeath).getFullYear()  : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <PersonCard
        name={`${main.firstName} ${main.lastName}`}
        firstName={main.firstName}
        birthYear={mainBirthYear}
        deathYear={mainDeathYear}
        isDeceased={main.isDeceased}
        profilePhoto={main.profilePhoto}
        city={main.city}
        occupation={main.occupation}
        isMe={isMe}
        onClick={onClickMain}
      />
      {spouse && (
        <>
          <SpouseConnector />
          <PersonCard
            name={`${spouse.firstName} ${spouse.lastName}`}
            firstName={spouse.firstName}
            birthYear={spouseBirthYear}
            isDeceased={spouse.isDeceased}
            profilePhoto={spouse.profilePhoto}
            city={spouse.city}
            onClick={onClickSpouse}
          />
        </>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════ */

const FamilyTree: React.FC = () => {
  const { user } = useBackendAuth();
  const navigate = useNavigate();
  const [persons,   setPersons]   = useState<Person[]>([]);
  const [families,  setFamilies]  = useState<FamilyForTree[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [hasPhoto,  setHasPhoto]  = useState(true);
  const [selected,  setSelected]  = useState<Person | null>(null);

  const load = useCallback(async () => {
    try {
      const [pData, fData] = await Promise.all([
        personsAPI.getPersons().catch(() => ({ people: [] })),
        familiesAPI.list().catch(() => []),
      ]);
      const list: Person[] = pData.people ?? pData;
      setPersons(list);
      setFamilies(fData);

      // check if logged-in user has a photo
      if (user?.email) {
        const me = list.find(p =>
          p.firstName.toLowerCase() === (user.email?.split('@')[0] ?? '').toLowerCase()
        );
        if (me && !me.profilePhoto) setHasPhoto(false);
      }
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  /* build generation groups via BFS */
  const map = new Map(persons.map(p => [p.id, p]));
  const genMap = new Map<string, number>();
  const queue: { id: string; gen: number }[] = [];
  for (const p of persons) {
    const hasFather = p.biologicalFatherId && map.has(p.biologicalFatherId);
    const hasMother = p.biologicalMotherId && map.has(p.biologicalMotherId);
    if (!hasFather && !hasMother) queue.push({ id: p.id, gen: 1 });
  }
  const visited = new Set<string>();
  while (queue.length) {
    const { id, gen } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id); genMap.set(id, gen);
    for (const p of persons)
      if (!visited.has(p.id) && (p.biologicalFatherId === id || p.biologicalMotherId === id))
        queue.push({ id: p.id, gen: gen + 1 });
  }
  persons.forEach(p => { if (!genMap.has(p.id)) genMap.set(p.id, 1); });

  const maxGen = Math.max(0, ...Array.from(genMap.values()));
  const genGroups: Record<number, Person[]> = {};
  persons.forEach(p => {
    const g = genMap.get(p.id) ?? 1;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(p);
  });

  const genLabels: Record<number, string> = {
    1: 'Generation I — Grandparents',
    2: 'Generation II — Parents',
    3: 'Generation III — Children',
    4: 'Generation IV — Grandchildren',
  };

  /* ── detail side panel ── */
  const DetailPanel: React.FC = () => {
    if (!selected) return null;
    const birthYear = selected.dateOfBirth ? new Date(selected.dateOfBirth).getFullYear() : null;
    const deathYear = selected.dateOfDeath ? new Date(selected.dateOfDeath).getFullYear() : null;
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 300,
        background: C.white, boxShadow: '-4px 0 24px rgba(13,37,87,0.14)',
        zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, padding: '1.5rem', position: 'relative' }}>
          <button onClick={() => setSelected(null)} style={{
            position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)',
            border: 'none', color: C.white, width: 28, height: 28, borderRadius: '50%',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: `3px solid ${C.gold}`, overflow: 'hidden', margin: '0 auto 0.75rem', background: avatarColorFn(`${selected.firstName} ${selected.lastName}`) }}>
            {selected.profilePhoto
              ? <img src={selected.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 900, fontSize: '1.6rem' }}>
                    {(selected.firstName[0] ?? '') + (selected.lastName[0] ?? '')}
                  </span>
                </div>
            }
          </div>
          <p style={{ color: C.white, fontWeight: 800, fontSize: '1.05rem', textAlign: 'center', margin: 0 }}>{selected.firstName} {selected.lastName}</p>
          {selected.occupation && <p style={{ color: C.goldLight, fontSize: '0.78rem', textAlign: 'center', margin: '4px 0 0' }}>{selected.occupation}</p>}
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {[
            ['Date of Birth', birthYear ? `${birthYear}${selected.isDeceased && deathYear ? ` – ${deathYear}` : ''}` : null],
            ['Status', selected.isDeceased ? '† Deceased' : 'Living'],
            ['City', selected.city],
            ['Email', selected.firstName],
          ].map(([label, value]) => value ? (
            <div key={label as string} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.creamDark}` }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>{label}</p>
              <p style={{ fontSize: '0.875rem', color: C.textDark, fontWeight: 600, margin: 0 }}>{value}</p>
            </div>
          ) : null)}

          {!selected.profilePhoto && (
            <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius: 10, padding: '0.875rem', marginTop: '0.5rem' }}>
              <p style={{ color: C.goldLight, fontWeight: 700, fontSize: '0.78rem', margin: '0 0 4px' }}>📸 No profile photo</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', margin: '0 0 8px', lineHeight: 1.4 }}>
                Add a photo so your family recognises you in the tree.
              </p>
              <button onClick={() => navigate('/profile')} style={{
                background: C.gold, color: C.navy, border: 'none', borderRadius: 6,
                padding: '6px 14px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>Update Profile</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.creamDark}`, borderTop: `3px solid ${C.navy}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: C.textMuted, fontSize: '0.875rem' }}>Loading family tree…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* hero header */}
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid},${C.navyMid})`, padding: '2rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 6 }}>
            Family Genealogy Platform
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: C.white, margin: '0 0 0.4rem', lineHeight: 1.15 }}>
            🌳 Family Tree
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
            {persons.length} member{persons.length !== 1 ? 's' : ''} across {maxGen} generation{maxGen !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/members')} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              👥 All Members
            </button>
            <button onClick={() => navigate('/families')} style={{ background: 'rgba(255,255,255,0.12)', color: C.white, border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              👨👩👧 Families
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* no-photo advisory */}
        {!hasPhoto && <NoPhotoBanner onGoProfile={() => navigate('/profile')} />}

        {persons.length === 0 ? (
          /* empty state */
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: C.white, borderRadius: 20, border: `1px solid ${C.creamDark}` }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
            <h2 style={{ color: C.navy, fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Your family tree is empty</h2>
            <p style={{ color: C.textMuted, fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Join or create a family, complete your profile, and get admin approval to appear in the tree.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/families')} style={{ background: C.navy, color: C.white, border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Browse Families
              </button>
              <button onClick={() => navigate('/profile')} style={{ background: C.white, color: C.navy, border: `1.5px solid ${C.creamDark}`, borderRadius: 10, padding: '11px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Complete Profile
              </button>
            </div>
          </div>
        ) : (
          /* tree generations */
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.creamDark}`, padding: '2.5rem 1.5rem', overflowX: 'auto', boxShadow: '0 2px 16px rgba(13,37,87,0.07)' }}>
            <div style={{ minWidth: 600, display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
              {Array.from({ length: maxGen }, (_, i) => i + 1).map((gen, gi) => {
                const members = genGroups[gen] ?? [];
                return (
                  <div key={gen} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {gi > 0 && (
                      <div style={{ margin: '0.5rem 0' }}>
                        <HBranch count={Math.min(members.length, 5)} />
                      </div>
                    )}
                    <GenRow label={genLabels[gen] ?? `Generation ${gen}`}>
                      {members.map((p) => (
                        <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Couple
                            main={p}
                            isMe={false}
                            onClickMain={() => setSelected(p)}
                          />
                        </div>
                      ))}
                    </GenRow>
                    {gi < maxGen - 1 && <VLine height={32} />}
                  </div>
                );
              })}
            </div>

            {/* legend */}
            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.creamDark}`, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { color: C.gold, label: 'Gold border — You' },
                { color: C.creamDark, label: 'Grey border — Member' },
                { color: C.navy, label: '— — Deceased' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: C.textMuted }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: `2.5px solid ${l.color}`, background: 'transparent' }} />
                  {l.label}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: C.textMuted }}>
                <div style={{ width: 20, height: 2, background: C.gold }} />
                <span>♥ Married</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: C.textMuted, marginLeft: 'auto' }}>
                Click any card to view details
              </span>
            </div>
          </div>
        )}

        {/* families you can view full trees for */}
        {families.filter(f => f.isMember).length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h2 style={{ color: C.textDark, fontWeight: 800, fontSize: '1rem', marginBottom: '0.75rem' }}>
              🏡 View Full Family Trees
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {families.filter(f => f.isMember).map(f => (
                <div key={f.id} onClick={() => navigate(`/families/${f.id}/tree`)}
                  style={{ background: C.white, border: `1px solid ${C.creamDark}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.navyMid; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(13,37,87,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.creamDark; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>{f.name[0]}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: C.textDark, fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                    <p style={{ color: C.gold, fontSize: '0.72rem', fontWeight: 600, margin: 0 }}>View interactive tree →</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* detail side panel */}
      {selected && <DetailPanel />}
      {selected && <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,37,87,0.3)', zIndex: 99 }} />}
    </div>
  );
};

export default FamilyTree;
