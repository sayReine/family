import React, { useState } from 'react';
import { Sun, Moon, Globe, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLang } from '../contexts/LanguageContext';
import type { Lang } from '../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const languages: { code: Lang; flag: string; label: string }[] = [
    { code: 'en', flag: '🇬🇧', label: t('english') },
    { code: 'fr', flag: '🇫🇷', label: t('french')  },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settingsTitle')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('settingsSubtitle')}</p>
      </div>

      {/* ── APPEARANCE ──────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('appearance')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('themeLabel')}</p>

        <div className="grid grid-cols-2 gap-3">
          {/* light */}
          <button
            onClick={() => { if (theme === 'dark') toggleTheme(); }}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
              ${theme === 'light'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
          >
            {theme === 'light' && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            {/* light preview */}
            <div className="w-full h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              <div className="h-4 bg-gray-100 border-b border-gray-200 flex items-center px-2 gap-1">
                <div className="w-2 h-1.5 bg-gray-300 rounded" />
                <div className="w-4 h-1.5 bg-gray-300 rounded" />
              </div>
              <div className="flex-1 p-1.5 flex gap-1">
                <div className="w-6 bg-gray-100 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-1.5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lightMode')}</span>
          </button>

          {/* dark */}
          <button
            onClick={() => { if (theme === 'light') toggleTheme(); }}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
              ${theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            {/* dark preview */}
            <div className="w-full h-16 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
              <div className="h-4 bg-gray-800 border-b border-gray-700 flex items-center px-2 gap-1">
                <div className="w-2 h-1.5 bg-gray-600 rounded" />
                <div className="w-4 h-1.5 bg-gray-600 rounded" />
              </div>
              <div className="flex-1 p-1.5 flex gap-1">
                <div className="w-6 bg-gray-800 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-gray-700 rounded w-3/4" />
                  <div className="h-1.5 bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('darkMode')}</span>
          </button>
        </div>

        {/* quick toggle pill */}
        <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'light' ? t('lightMode') : t('darkMode')}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* ── LANGUAGE ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('language')}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('languageLabel')}</p>

        <div className="grid grid-cols-2 gap-3">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                ${lang === l.code
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
            >
              {lang === l.code && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
              <span className="text-2xl">{l.flag}</span>
              <span className={`text-sm font-semibold ${lang === l.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* save button */}
      <div className="flex justify-end">
        <button
          onClick={save}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${saved
              ? 'bg-green-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
        >
          {saved ? <><Check className="w-4 h-4" />{t('savedMsg')}</> : t('settingsTitle')}
        </button>
      </div>

    </div>
  );
};

export default Settings;
