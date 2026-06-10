import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLang } from '../contexts/LanguageContext';
import { Sun, Moon, Globe, ChevronDown } from 'lucide-react';

const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const languages = [
    { code: 'en' as const, label: '🇬🇧 English' },
    { code: 'fr' as const, label: '🇫🇷 Français' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {t('familyDashboard')}
          </h1>

          {/* controls */}
          <div className="flex items-center gap-2">

            {/* theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         border border-gray-200 dark:border-gray-600
                         transition-colors"
            >
              {theme === 'light'
                ? <><Moon className="w-4 h-4" /><span className="hidden sm:inline">{t('darkMode')}</span></>
                : <><Sun  className="w-4 h-4" /><span className="hidden sm:inline">{t('lightMode')}</span></>
              }
            </button>

            {/* language dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                           text-gray-600 dark:text-gray-300
                           hover:bg-gray-100 dark:hover:bg-gray-700
                           border border-gray-200 dark:border-gray-600
                           transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline uppercase">{lang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800
                                border border-gray-200 dark:border-gray-600 rounded-lg
                                shadow-lg overflow-hidden z-50">
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2
                        transition-colors
                        ${lang === l.code
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {l.label}
                      {lang === l.code && <span className="ml-auto text-indigo-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
