import React, { useState, useEffect } from 'react';
import AuthForm from '../auth/Form';

/* ─────────────────────────── tiny SVG pieces ──────────────────────────────── */
const Logo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="8"  r="4"   fill="#c9a84c" />
    <circle cx="8"  cy="22" r="3.5" fill="rgba(255,255,255,0.75)" />
    <circle cx="24" cy="22" r="3.5" fill="rgba(255,255,255,0.75)" />
    <line x1="16" y1="12" x2="12" y2="18.5" stroke="#c9a84c" strokeWidth="2" />
    <line x1="16" y1="12" x2="20" y2="18.5" stroke="#c9a84c" strokeWidth="2" />
  </svg>
);

const HeroTree: React.FC = () => (
  <svg width="320" height="380" viewBox="0 0 340 400" fill="none" aria-hidden>
    <circle cx="170" cy="60"  r="40" fill="white" opacity=".18" />
    <circle cx="80"  cy="180" r="36" fill="white" opacity=".18" />
    <circle cx="260" cy="180" r="36" fill="white" opacity=".18" />
    <circle cx="40"  cy="300" r="30" fill="white" opacity=".18" />
    <circle cx="120" cy="300" r="30" fill="white" opacity=".18" />
    <circle cx="220" cy="300" r="30" fill="white" opacity=".18" />
    <circle cx="300" cy="300" r="30" fill="white" opacity=".18" />
    <line x1="170" y1="100" x2="130" y2="145" stroke="white" strokeWidth="2.5" opacity=".25" />
    <line x1="170" y1="100" x2="210" y2="145" stroke="white" strokeWidth="2.5" opacity=".25" />
    <line x1="80"  y1="216" x2="60"  y2="270" stroke="white" strokeWidth="2.5" opacity=".25" />
    <line x1="80"  y1="216" x2="120" y2="270" stroke="white" strokeWidth="2.5" opacity=".25" />
    <line x1="260" y1="216" x2="220" y2="270" stroke="white" strokeWidth="2.5" opacity=".25" />
    <line x1="260" y1="216" x2="300" y2="270" stroke="white" strokeWidth="2.5" opacity=".25" />
  </svg>
);

/* ── icon helpers ────────────────────────────────────────────────────────────── */
const icon = (path: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
    {path}
  </svg>
);

const FEATURES = [
  { title: 'Family Membership',     desc: 'Create or join families, manage who\'s in your tree with role-based access.',                      icon: icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>) },
  { title: 'Interactive Tree',       desc: 'Visualize your entire family across generations in a beautiful, zoomable view.',                   icon: icon(<><path d="M12 22V12m0 0L5 8m7 4 7-4M5 8V3m14 5V3M5 8l7-4 7 4"/></>) },
  { title: 'Preserve Memories',      desc: 'Add photos, birth dates, life stories, and milestones for every family member.',                   icon: icon(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>) },
  { title: 'Never Lose Connection',  desc: 'Keep distant relatives connected and prevent family history from being lost forever.',             icon: icon(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { title: 'Privacy Controls',       desc: 'Admin-approved profiles ensure only verified relatives appear in your tree.',                       icon: icon(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>) },
  { title: 'Global Families',        desc: 'Families across continents can collaborate on a single shared living record.',                     icon: icon(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>) },
];

const STEPS = [
  { n: 1, title: 'Register',        desc: 'Create your account in minutes with your name, email, and a secure password.' },
  { n: 2, title: 'Join or Create',  desc: 'Browse existing families or found a brand-new one and become its admin.' },
  { n: 3, title: 'Build Your Tree', desc: 'Add parents, children, spouses and relatives — defining each relationship.' },
  { n: 4, title: 'View & Share',    desc: 'Explore the interactive tree, share with family, and watch it grow across time.' },
];

const STATS = [
  { value: '∞',    label: 'Generations Supported' },
  { value: '🌍',   label: 'Global Families' },
  { value: '100%', label: 'Free to Start' },
  { value: '🔒',   label: 'Privacy First' },
];

/* ─────────────────────────── responsive styles ────────────────────────────── */
const css = `
  :root {
    --navy:       #0d2557;
    --navy-mid:   #1a3a7a;
    --navy-light: #2a52a0;
    --gold:       #c9a84c;
    --gold-light: #e8c97a;
    --cream:      #f8f5ef;
    --cream-dark: #ede8df;
    --text-mid:   #3a4e6e;
    --text-muted: #7a8faa;
  }

  .rb-nav {
    background: var(--navy);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: 0 2px 16px rgba(13,37,87,.18);
  }
  .rb-nav-logo {
    display: flex; align-items: center; gap: 10px;
    color: #fff; font-weight: 700; font-size: 1.15rem;
    background: none; border: none; cursor: pointer; padding: 0;
  }
  .rb-nav-links { display: flex; gap: .5rem; }
  .rb-nav-links button {
    background: rgba(255,255,255,.10); border: none; color: rgba(255,255,255,.85);
    cursor: pointer; padding: 8px 16px; border-radius: 8px;
    font-size: .875rem; font-weight: 600; font-family: inherit;
  }
  .rb-nav-links .rb-cta {
    background: var(--gold); color: var(--navy); font-weight: 700;
  }
  .rb-hamburger {
    display: none; background: none; border: none;
    cursor: pointer; padding: 6px; color: #fff;
  }
  .rb-mobile-menu {
    display: none; flex-direction: column; gap: .5rem;
    background: var(--navy-mid); padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255,255,255,.08);
  }
  .rb-mobile-menu.open { display: flex; }
  .rb-mobile-menu button {
    background: rgba(255,255,255,.08); border: none; color: #fff;
    padding: 12px 16px; border-radius: 8px; font-size: .95rem;
    font-weight: 600; cursor: pointer; font-family: inherit; text-align: left;
  }
  .rb-mobile-menu .rb-cta { background: var(--gold); color: var(--navy); }

  /* hero */
  .rb-hero {
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, var(--navy-light) 100%);
    min-height: calc(100vh - 64px);
    display: flex; align-items: center;
    position: relative; overflow: hidden;
    padding: 4rem 1.5rem;
  }
  .rb-hero-inner { position: relative; z-index: 1; max-width: 600px; }
  .rb-hero-eyebrow {
    font-size: .75rem; letter-spacing: .12em; text-transform: uppercase;
    color: var(--gold); font-weight: 600; margin-bottom: 1.25rem;
  }
  .rb-hero h1 {
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 1.25rem;
  }
  .rb-hero h1 span { color: var(--gold-light); }
  .rb-hero p {
    font-size: clamp(.95rem, 2.5vw, 1.1rem);
    color: rgba(255,255,255,.72); line-height: 1.7; margin-bottom: 2.5rem; max-width: 480px;
  }
  .rb-hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
  .rb-hero-btns button {
    padding: 13px 26px; border-radius: 10px;
    font-size: .95rem; font-weight: 700; cursor: pointer; border: none; font-family: inherit;
  }
  .rb-btn-primary { background: var(--gold); color: var(--navy); }
  .rb-btn-outline  { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,.35) !important; }
  .rb-hero-visual {
    position: absolute; right: 3rem; top: 50%;
    transform: translateY(-50%); pointer-events: none; display: block;
  }

  /* sections */
  .rb-section { padding: 4rem 1.5rem; }
  .rb-section-title {
    text-align: center; font-size: clamp(1.4rem, 4vw, 1.8rem);
    color: var(--navy); font-weight: 800; margin-bottom: .5rem;
  }
  .rb-section-sub {
    text-align: center; color: var(--text-muted);
    margin-bottom: 2.5rem; font-size: .95rem;
  }

  /* features grid */
  .rb-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem; max-width: 960px; margin: 0 auto;
  }
  .rb-feature-card {
    background: var(--cream); border-radius: 14px;
    padding: 1.5rem; text-align: center;
  }
  .rb-feature-icon {
    width: 48px; height: 48px; background: var(--navy);
    border-radius: 12px; display: flex; align-items: center;
    justify-content: center; margin: 0 auto 1rem;
  }
  .rb-feature-card h3 { font-size: .95rem; color: var(--navy); font-weight: 700; margin-bottom: .4rem; }
  .rb-feature-card p  { font-size: .83rem; color: var(--text-muted); line-height: 1.55; }

  /* steps */
  .rb-steps-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 2rem; max-width: 860px; margin: 0 auto;
  }
  .rb-step { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .rb-step-num {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--gold); display: flex; align-items: center;
    justify-content: center; font-size: 1.1rem; font-weight: 900;
    color: var(--navy); margin-bottom: 1rem; flex-shrink: 0;
  }
  .rb-step h3 { font-size: .95rem; color: var(--navy); font-weight: 700; margin-bottom: .4rem; }
  .rb-step p  { font-size: .83rem; color: var(--text-muted); line-height: 1.55; }

  /* mission / vision */
  .rb-mv-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 2.5rem; max-width: 860px; margin: 0 auto;
  }
  .rb-mv-card { border-left: 4px solid var(--gold); padding-left: 1.5rem; }
  .rb-mv-card.vision { border-left-color: var(--navy-mid); }
  .rb-mv-label {
    font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
    font-weight: 700; color: var(--gold); margin-bottom: .75rem;
  }
  .rb-mv-card.vision .rb-mv-label { color: var(--navy-mid); }
  .rb-mv-card h3 { font-size: 1.25rem; font-weight: 800; color: var(--navy); margin-bottom: 1rem; }
  .rb-mv-card p  { color: var(--text-mid); line-height: 1.75; font-size: .93rem; margin-bottom: .75rem; }

  /* stats */
  .rb-stats {
    background: var(--navy); padding: 3rem 1.5rem;
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem; max-width: 800px; margin: 0 auto; text-align: center;
  }
  .rb-stats-value { font-size: 2rem; font-weight: 900; color: var(--gold); margin-bottom: .35rem; }
  .rb-stats-label {
    font-size: .75rem; color: rgba(255,255,255,.6);
    text-transform: uppercase; letter-spacing: .08em; font-weight: 600;
  }

  /* cta */
  .rb-cta-section { background: var(--cream); padding: 5rem 1.5rem; text-align: center; }
  .rb-cta-section h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 800;
    color: var(--navy); margin-bottom: 1rem;
  }
  .rb-cta-section p {
    color: var(--text-muted); font-size: .95rem;
    max-width: 480px; margin: 0 auto 2rem; line-height: 1.65;
  }
  .rb-cta-section button {
    background: var(--navy); color: #fff; padding: 16px 36px;
    border: none; border-radius: 12px; font-size: 1rem;
    font-weight: 700; cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 24px rgba(13,37,87,.18);
  }

  /* footer */
  .rb-footer { background: var(--navy); padding: 2rem 1.5rem; text-align: center; }
  .rb-footer-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: .75rem; }
  .rb-footer-logo span { color: #fff; font-weight: 700; font-size: 1rem; }
  .rb-footer p { color: rgba(255,255,255,.35); font-size: .78rem; }

  /* ── RESPONSIVE ─────────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .rb-features-grid { grid-template-columns: repeat(2, 1fr); }
    .rb-steps-grid    { grid-template-columns: repeat(2, 1fr); }
    .rb-stats         { grid-template-columns: repeat(2, 1fr); }
    .rb-hero-visual   { opacity: .1; right: 1rem; }
  }

  @media (max-width: 768px) {
    .rb-nav-links     { display: none; }
    .rb-hamburger     { display: flex; align-items: center; justify-content: center; }
    .rb-hero          { padding: 3rem 1.25rem; min-height: auto; }
    .rb-hero-visual   { display: none; }
    .rb-hero-btns button { width: 100%; justify-content: center; }
    .rb-hero-btns     { flex-direction: column; }
    .rb-features-grid { grid-template-columns: 1fr; }
    .rb-steps-grid    { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .rb-mv-grid       { grid-template-columns: 1fr; gap: 2rem; }
    .rb-stats         { grid-template-columns: repeat(2, 1fr); }
    .rb-section       { padding: 3rem 1.25rem; }
  }

  @media (max-width: 480px) {
    .rb-steps-grid { grid-template-columns: 1fr; }
    .rb-stats      { grid-template-columns: 1fr 1fr; }
    .rb-hero h1    { font-size: 1.9rem; }
  }
`;

/* ─────────────────────────── component ───────────────────────────────────── */
type View = 'landing' | 'auth';

const LandingPage: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [menuOpen, setMenuOpen] = useState(false);

  // close menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const go = () => { setMenuOpen(false); setView('auth'); };

  /* ── AUTH VIEW ─────────────────────────────────────────────────────────── */
  if (view === 'auth') {
    return (
      <div style={{ background: '#f8f5ef', minHeight: '100vh' }}>
        <style>{css}</style>
        <nav className="rb-nav">
          <button className="rb-nav-logo" onClick={() => setView('landing')}>
            <Logo /><span>RootsBridge</span>
          </button>
        </nav>
        <AuthForm />
      </div>
    );
  }

  /* ── LANDING VIEW ──────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: '#f8f5ef', color: '#0d1f3c', minHeight: '100vh' }}>
      <style>{css}</style>

      {/* NAV */}
      <nav className="rb-nav">
        <button className="rb-nav-logo" onClick={() => setMenuOpen(false)}>
          <Logo /><span>RootsBridge</span>
        </button>
        <div className="rb-nav-links">
          <button onClick={go}>Sign in</button>
          <button className="rb-cta" onClick={go}>Get Started</button>
        </div>
        {/* hamburger */}
        <button className="rb-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </nav>

      {/* mobile dropdown menu */}
      <div className={`rb-mobile-menu${menuOpen ? ' open' : ''}`}>
        <button onClick={go}>Sign in</button>
        <button className="rb-cta" onClick={go}>Start your family tree →</button>
      </div>

      {/* HERO */}
      <section className="rb-hero">
        <div className="rb-hero-inner">
          <p className="rb-hero-eyebrow">Family Genealogy Platform</p>
          <h1>Your family's story,<br /><span>never forgotten</span></h1>
          <p>Build, visualize, and share your family tree across generations. Connect with relatives, preserve your lineage, and keep your family together — no matter the distance.</p>
          <div className="rb-hero-btns">
            <button className="rb-btn-primary" onClick={go}>Start your family tree →</button>
            <button className="rb-btn-outline" onClick={go}>Sign in</button>
          </div>
        </div>
        <div className="rb-hero-visual">
          <HeroTree />
        </div>
      </section>

      {/* FEATURES */}
      <section className="rb-section" style={{ background: '#fff' }}>
        <h2 className="rb-section-title">Everything your family needs</h2>
        <p className="rb-section-sub">One platform to connect generations, preserve memories, and grow your family legacy.</p>
        <div className="rb-features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="rb-feature-card">
              <div className="rb-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rb-section" style={{ background: '#f8f5ef' }}>
        <h2 className="rb-section-title">How it works</h2>
        <p className="rb-section-sub">Four simple steps to preserve your family legacy forever.</p>
        <div className="rb-steps-grid">
          {STEPS.map(s => (
            <div key={s.n} className="rb-step">
              <div className="rb-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="rb-section" style={{ background: '#fff' }}>
        <h2 className="rb-section-title">Our Purpose</h2>
        <p className="rb-section-sub">Why we built RootsBridge — and the future we're working toward.</p>
        <div className="rb-mv-grid">
          <div className="rb-mv-card">
            <div className="rb-mv-label">Our Mission</div>
            <h3>Bridging roots across generations</h3>
            <p>RootsBridge was built on a single conviction: no family should lose its story. We believe every lineage — regardless of how scattered across the world it becomes — deserves a living, breathing record that future generations can explore and add to.</p>
            <p>Our mission is to give every family a shared digital home where history is preserved, relationships are documented, and the bonds between people are never broken by distance or time.</p>
          </div>
          <div className="rb-mv-card vision">
            <div className="rb-mv-label">Our Vision</div>
            <h3>A world where no generation is forgotten</h3>
            <p>We envision a world where every person knows where they come from. Where a grandchild in Paris can trace their roots to a great-grandparent in Lagos, Kigali, or Dakar — not just as a name on a page, but as a full human being with a story, a face, and a place in the tree.</p>
            <p>RootsBridge is building the infrastructure for families to thrive across time — collaborative, secure, and accessible to everyone.</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background: '#0d2557', padding: '3rem 1.5rem' }}>
        <div className="rb-stats">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="rb-stats-value">{s.value}</div>
              <div className="rb-stats-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="rb-cta-section">
        <h2>Ready to preserve your family's legacy?</h2>
        <p>Join families already building their trees on RootsBridge. It's free to start — always.</p>
        <button onClick={go}>Start your family tree — it's free</button>
      </section>

      {/* FOOTER */}
      <footer className="rb-footer">
        <div className="rb-footer-logo">
          <Logo size={24} />
          <span>RootsBridge</span>
        </div>
        <p>© {new Date().getFullYear()} RootsBridge — Preserving family legacies, one generation at a time.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
