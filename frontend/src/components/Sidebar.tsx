import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Sun, Moon, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useBackendAuth } from '../hooks/UseBackendAuth';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../hooks/useTheme';

const C = {
  navy:      '#0d2557',
  navyMid:   '#1a3a7a',
  gold:      '#c9a84c',
  cream:     '#f8f5ef',
  creamDark: '#ede8df',
  textMid:   '#3a4e6e',
  white:     '#ffffff',
};

const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="8"  r="4"   fill={C.gold} />
    <circle cx="8"  cy="22" r="3.5" fill="rgba(255,255,255,0.5)" />
    <circle cx="24" cy="22" r="3.5" fill="rgba(255,255,255,0.5)" />
    <line x1="16" y1="12" x2="12" y2="18.5" stroke={C.gold} strokeWidth="2" />
    <line x1="16" y1="12" x2="20" y2="18.5" stroke={C.gold} strokeWidth="2" />
  </svg>
);

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navItems = (t: (k: string) => string, isAdmin: boolean) => [
  { to: '/',            icon: 'ti-home',     label: t('home'),        num: 1 },
  { to: '/families',    icon: 'ti-users',    label: t('families'),    num: 2 },
  { to: '/tree',        icon: 'ti-network',  label: t('treePreview'), num: 3 },
  { to: '/members',     icon: 'ti-list',     label: t('allMembers'),  num: 4 },
  { to: '/generations', icon: 'ti-stack-2',  label: t('generations'), num: 5 },
  { to: '/settings',    icon: 'ti-settings', label: t('settings'),    num: 6 },
  ...(isAdmin ? [{ to: '/admin', icon: 'ti-shield', label: t('admin'), num: 7 }] : []),
];

const linkBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '7px 10px', borderRadius: 9, cursor: 'pointer',
  color: 'rgba(255,255,255,0.65)', transition: 'background 0.12s',
  marginBottom: 2, textDecoration: 'none',
  fontSize: '0.84rem', fontFamily: 'inherit',
};

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { logout, user } = useBackendAuth();
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const close = () => setSidebarOpen(false);

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

  const controlBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.13)',
    color: 'rgba(255,255,255,0.7)',
    transition: 'all 0.15s', width: '100%',
  };

  return (
    <>
      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(13,37,87,0.55)', zIndex: 40 }}
          className="md:hidden"
          onClick={close}
        />
      )}

      {/* mobile hamburger — shown only when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 60,
            background: C.navy, border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 9, padding: '7px 9px', cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)',
          }}
          className="md:hidden"
        >
          <Menu size={18} />
        </button>
      )}

      <aside
        style={{ background: C.navy, fontFamily: "'Segoe UI', system-ui, sans-serif", zIndex: 50 }}
        className={`
          fixed md:relative top-0 left-0
          w-[230px] h-screen flex flex-col flex-shrink-0
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* ── Logo ── */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo />
            <div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 21, color: C.white, letterSpacing: -0.3, lineHeight: 1 }}>
                {t('appName')}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginTop: 2 }}>
                RootsBridge
              </div>
            </div>
          </div>
          {/* close button on mobile */}
          <button
            onClick={close}
            aria-label="Close sidebar"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
            className="md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
          {navItems(t, user?.role === 'ADMIN').map(({ to, icon, label, num }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              style={({ isActive }) => ({
                ...linkBase,
                background: isActive ? 'rgba(201,168,76,0.18)' : 'transparent',
                color: isActive ? C.white : 'rgba(255,255,255,0.65)',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <i className={`ti ${icon}`} aria-hidden="true"
                      style={{ fontSize: 15, color: isActive ? C.gold : 'rgba(255,255,255,0.4)' }} />
                    {label}
                  </span>
                  <span style={{ fontSize: 10, color: isActive ? C.gold : 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    {num}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 8px 4px' }}>
            Account
          </p>

          <NavLink
            to="/profile"
            onClick={close}
            style={({ isActive }) => ({
              ...linkBase,
              background: isActive ? 'rgba(201,168,76,0.18)' : 'transparent',
              color: isActive ? C.white : 'rgba(255,255,255,0.65)',
            })}
          >
            {({ isActive }) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <User size={15} style={{ color: isActive ? C.gold : 'rgba(255,255,255,0.4)' }} />
                {t('profile')}
              </span>
            )}
          </NavLink>
        </nav>

        {/* ── Footer controls ── */}
        <div style={{ padding: '10px 10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Theme + Language row */}
          <div style={{ display: 'flex', gap: 6 }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
              style={{ ...controlBtn, flex: 1, justifyContent: 'center' }}
            >
              {theme === 'light'
                ? <><Moon size={13} /><span>{t('darkMode')}</span></>
                : <><Sun  size={13} /><span>{t('lightMode')}</span></>
              }
            </button>

            {/* Language dropdown */}
            <div style={{ position: 'relative', flex: 1 }} ref={dropRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                style={{ ...controlBtn, justifyContent: 'center' }}
              >
                <Globe size={13} />
                <span style={{ textTransform: 'uppercase' }}>{lang}</span>
                <ChevronDown size={11} style={{ transition: 'transform 0.15s', transform: langOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
                  width: 150, background: C.white,
                  border: `1px solid ${C.creamDark}`, borderRadius: 10,
                  boxShadow: '0 -8px 24px rgba(13,37,87,0.18)',
                  overflow: 'hidden', zIndex: 60,
                }}>
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 14px', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: lang === l.code ? 'rgba(13,37,87,0.06)' : C.white,
                        color: lang === l.code ? C.navy : C.textMid,
                        transition: 'background 0.12s',
                      }}
                    >
                      {l.label}
                      {lang === l.code && <span style={{ marginLeft: 'auto', color: C.gold, fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              ...controlBtn,
              justifyContent: 'flex-start', gap: 8,
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <LogOut size={14} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}