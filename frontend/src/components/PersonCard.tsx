import React from 'react';

const C = {
  navy: '#0d2557', navyMid: '#1a3a7a', gold: '#c9a84c',
  cream: '#f8f5ef', creamDark: '#ede8df',
  textDark: '#0d1f3c', textMuted: '#7a8faa', white: '#ffffff',
};

const avatarColors = [C.navy, C.navyMid, '#166534', '#7c3aed', '#b45309', '#0e7490', '#9f1239'];
const avatarColor  = (name: string) => {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
};

interface PersonCardProps {
  name: string;
  firstName?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  isDeceased?: boolean;
  profilePhoto?: string | null;
  relationship?: string;
  occupation?: string;
  city?: string;
  isMe?: boolean;
  onClick?: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({
  name, firstName, birthYear, deathYear, isDeceased,
  profilePhoto, relationship, occupation, city, isMe, onClick,
}) => {
  const initials = name.split(' ').map(p => p[0] ?? '').join('').slice(0, 2).toUpperCase();
  const bg = avatarColor(name);
  const displayName = firstName ?? name.split(' ')[0];

  return (
    <div
      onClick={onClick}
      style={{
        width: 140, background: C.white, borderRadius: 16,
        border: `2px solid ${isMe ? C.gold : C.creamDark}`,
        boxShadow: isMe
          ? `0 4px 20px rgba(201,168,76,0.25)`
          : '0 2px 12px rgba(13,37,87,0.08)',
        overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(13,37,87,0.15)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = isMe
          ? '0 4px 20px rgba(201,168,76,0.25)'
          : '0 2px 12px rgba(13,37,87,0.08)';
      }}
    >
      {/* photo / avatar */}
      <div style={{ width: '100%', height: 110, background: bg, position: 'relative', overflow: 'hidden' }}>
        {profilePhoto ? (
          <img src={profilePhoto} alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>{initials}</span>
            <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 6px', lineHeight: 1.2 }}>No photo</span>
          </div>
        )}
        {isMe && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: C.gold, color: C.navy, fontSize: '0.55rem', fontWeight: 800, padding: '2px 7px', borderRadius: 999, letterSpacing: '0.05em' }}>
            YOU
          </div>
        )}
        {isDeceased && (
          <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
            †
          </div>
        )}
      </div>

      {/* info */}
      <div style={{ padding: '10px 10px 12px', borderTop: `2px solid ${isMe ? C.gold : C.creamDark}` }}>
        <p style={{ fontWeight: 800, fontSize: '0.82rem', color: C.textDark, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
          {displayName}
        </p>
        <p style={{ fontWeight: 500, fontSize: '0.7rem', color: C.textMuted, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name.split(' ').slice(1).join(' ') || ''}
        </p>
        {relationship && (
          <p style={{ fontSize: '0.65rem', color: C.gold, fontWeight: 700, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {relationship}
          </p>
        )}
        {(birthYear || city || occupation) && (
          <p style={{ fontSize: '0.65rem', color: C.textMuted, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {birthYear ? `b. ${birthYear}${isDeceased && deathYear ? ` – ${deathYear}` : ''}` : ''}
            {city ? (birthYear ? ` · ${city}` : city) : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
