import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLang } from '../contexts/LanguageContext';
import { Sun, Moon, Globe, ChevronDown, Menu } from 'lucide-react';

const C = {
  navy:      '#0d2557',
  navyMid:   '#1a3a7a',
  gold:      '#c9a84c',
  cream:     '#f8f5ef',
  creamDark: '#ede8df',
  textMid:   '#3a4e6e',
  textMuted: '#7a8faa',
  white:     '#ffffff',
};

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ setSidebarOpen, sidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const languages = [
    { code: 'en' as const, label: '🇬🇧 English' },
    { code: 'fr' as const, label: '🇫🇷 Français' },
  ];

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 13px', borderRadius: 9, cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.8)',
    transition: 'all 0.15s',
  };

  return (
    <header style={{
      background: C.navy,
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
      padding: '0 20px',
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* Left: hamburger (mobile) + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          style={{ ...btnStyle, padding: '7px 10px', display: 'flex' }}
          className="md:hidden"
        >
          <Menu size={16} />
        </button>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, display: 'block', lineHeight: 1 }}>
            RootsBridge
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.white, lineHeight: 1.2 }}>
            {t('familyDashboard')}
          </span>
        </div>
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
          style={btnStyle}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; }}
        >
          {theme === 'light'
            ? <><Moon size={14} /><span style={{ display: 'none' }} className="sm:inline">{t('darkMode')}</span></>
            : <><Sun  size={14} /><span style={{ display: 'none' }} className="sm:inline">{t('lightMode')}</span></>
          }
        </button>

        {/* Language dropdown */}
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={btnStyle}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'; }}
          >
            <Globe size={14} />
            <span style={{ textTransform: 'uppercase' }}>{lang}</span>
            <ChevronDown size={12} style={{ transition: 'transform 0.15s', transform: langOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {langOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              width: 160, background: C.white,
              border: `1px solid ${C.creamDark}`, borderRadius: 10,
              boxShadow: '0 8px 24px rgba(13,37,87,0.15)',
              overflow: 'hidden', zIndex: 50,
            }}>
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 14px', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: lang === l.code ? 'rgba(13,37,87,0.06)' : C.white,
                    color: lang === l.code ? C.navy : C.textMid,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (lang !== l.code) (e.currentTarget as HTMLButtonElement).style.background = C.cream; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = lang === l.code ? 'rgba(13,37,87,0.06)' : C.white; }}
                >
                  {l.label}
                  {lang === l.code && (
                    <span style={{ marginLeft: 'auto', color: C.gold, fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;