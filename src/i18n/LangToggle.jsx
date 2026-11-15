import { useEffect, useState } from 'react';
import { getLang, onLangChange, toggleLang } from './index.js';

/** Re-renders (remounts) the app whenever the language changes, so digits, number words and dates are recomputed. */
export function LangRoot({ children }) {
  const [lang, setL] = useState(getLang());
  useEffect(() => onLangChange(setL), []);
  return (
    <>
      <div key={lang} style={{ display: 'contents' }}>
        {children}
      </div>
      <LangToggle lang={lang} />
    </>
  );
}

/** Floating Arabic ⇄ English switch, visible on every page. */
export function LangToggle({ lang }) {
  const en = lang === 'en';
  return (
    <button
      type="button"
      data-i18n-skip=""
      onClick={toggleLang}
      className="no-print fixed bottom-3 left-3 z-[60] flex min-h-12 items-center gap-2 rounded-full bg-oman-700 px-4 text-base font-extrabold text-white shadow-lg ring-4 ring-white/70 transition hover:brightness-110 focus:outline-none focus-visible:ring-amber-brand"
      aria-label={en ? 'التبديل إلى العربية' : 'Switch to English'}
      title={en ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      <span aria-hidden="true">🌐</span>
      <span lang={en ? 'ar' : 'en'}>{en ? 'العربية' : 'English'}</span>
    </button>
  );
}
