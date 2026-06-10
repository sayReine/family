import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { personsAPI } from '../services/api';

const C = {
  navy: '#0d2557', navyMid: '#1a3a7a', navyLight: '#2a52a0',
  gold: '#c9a84c', goldLight: '#e8c97a',
  cream: '#f8f5ef', creamDark: '#ede8df',
  textDark: '#0d1f3c', textMid: '#3a4e6e', textMuted: '#7a8faa', white: '#ffffff',
};

const avatarColors = [C.navy, C.navyMid, '#166534', '#7c3aed', '#b45309', '#0e7490', '#9f1239'];
const avatarColor  = (name: string) => {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
};

interface Person {
  id: string; firstName: string; middleName?: string; lastName: string;
  dateOfBirth?: string; isDeceased: boolean; profilePhoto?: string;
  city?: string; state?: string; occupation?: string; gender?: string;
}

const Members: React.FC = () => {
  const navigate  = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    personsAPI.getPersons()
      .then(data => setPersons(data.people ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = persons.filter(p =>
    `${p.firstName} ${p.middleName ?? ''} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const noPhoto = filtered.filter(p => !p.profilePhoto).length;

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* hero */}
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, padding: '2rem 2rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, fontWeight: 700, marginBottom: 6 }}>
            Family Members
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 900, color: C.white, margin: '0 0 0.75rem' }}>
            👥 All Members
          </h1>
          {/* search */}
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name…"
              style={{
                width: '100%', padding: '10px 14px 10px 38px',
                border: 'none', borderRadius: 10, fontSize: '0.9rem',
                background: 'rgba(255,255,255,0.12)', color: C.white,
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Members', value: persons.length, accent: C.navy },
            { label: 'With Photos',   value: persons.filter(p => p.profilePhoto).length, accent: C.gold },
            { label: 'Missing Photos', value: noPhoto, accent: noPhoto > 0 ? '#b45309' : C.navyMid },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 12, padding: '1rem 1.25rem', border: `1px solid ${C.creamDark}`, borderTop: `3px solid ${s.accent}`, minWidth: 140, flex: 1, boxShadow: '0 2px 8px rgba(13,37,87,0.06)' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 900, color: s.accent, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* no-photo advisory */}
        {noPhoto > 0 && (
          <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.4rem' }}>📸</span>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0, flex: 1 }}>
              <span style={{ color: C.goldLight, fontWeight: 700 }}>{noPhoto} member{noPhoto > 1 ? 's' : ''}</span> haven't uploaded a profile photo yet — they appear as initials in the tree.
            </p>
            <button onClick={() => navigate('/profile')} style={{ background: C.gold, color: C.navy, border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              Add my photo →
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 14, height: 240, border: `1px solid ${C.creamDark}`, animation: 'pulse 1.5s ease infinite', opacity: 0.5 }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.8}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: C.white, borderRadius: 16, border: `1px solid ${C.creamDark}` }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: C.textMuted, fontSize: '0.95rem' }}>
              {search ? `No members match "${search}"` : 'No members in the tree yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filtered.map(person => {
              const name       = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' ');
              const firstName  = person.firstName;
              const lastName   = person.lastName;
              const initials   = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
              const birthYear  = person.dateOfBirth ? new Date(person.dateOfBirth).getFullYear() : null;
              const location   = [person.city, person.state].filter(Boolean).join(', ');
              const bg         = avatarColor(name);

              return (
                <div key={person.id} style={{
                  background: C.white, borderRadius: 14,
                  border: `1px solid ${C.creamDark}`,
                  overflow: 'hidden', boxShadow: '0 2px 10px rgba(13,37,87,0.06)',
                  transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'default',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(13,37,87,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(13,37,87,0.06)'; }}
                >
                  {/* photo area */}
                  <div style={{ height: 130, background: bg, position: 'relative', overflow: 'hidden' }}>
                    {person.profilePhoto ? (
                      <img src={person.profilePhoto} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>{initials}</span>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>NO PHOTO</span>
                      </div>
                    )}
                    {person.isDeceased && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: C.white, fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                        † DECEASED
                      </div>
                    )}
                    {!person.profilePhoto && (
                      <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(201,168,76,0.9)', color: C.navy, fontSize: '0.55rem', fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>
                        📸 Add photo
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div style={{ padding: '12px 14px', borderTop: `2px solid ${C.creamDark}` }}>
                    <p style={{ fontWeight: 800, color: C.textDark, fontSize: '0.88rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    {person.occupation && (
                      <p style={{ fontSize: '0.72rem', color: C.gold, fontWeight: 700, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.occupation}</p>
                    )}
                    {(birthYear || location) && (
                      <p style={{ fontSize: '0.72rem', color: C.textMuted, margin: '3px 0 0' }}>
                        {birthYear ? `b. ${birthYear}` : ''}{location ? ` · ${location}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
