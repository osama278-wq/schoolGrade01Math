// =====================================================================
// i18n – Arabic ⇄ English runtime layer
// ---------------------------------------------------------------------
// The app's source text is Arabic (the original). When English is active,
// this module:
//   1. translates text nodes + a few attributes in the DOM via a dictionary
//      (src/i18n/en.json) and template patterns, through a MutationObserver
//      so React updates are translated as they render;
//   2. switches <html dir/lang>, document.title, and digits (٠-٩ → 0-9);
//   3. exposes t() for strings that never reach the DOM (speech, links).
// To add / fix a translation: edit src/i18n/en.json → "plain" (exact
// Arabic → English) or "tpl" ([Arabic with {0} placeholders, English]).
// Elements with the attribute data-i18n-skip (and their subtree) are left alone.
// =====================================================================
import dict from './en.json';

const STORAGE_KEY = 'g1math.lang';
const AR_LETTERS = /[؀-ۿ]/;
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'CODE']);
const TITLES = {
  ar: 'رياضياتي – الصف الأول | المنهج العماني',
  en: 'My Maths – Grade 1 | Omani Curriculum'
};

let lang = 'ar';
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'ar') lang = saved;
} catch {
  /* storage unavailable */
}

const listeners = new Set();

export function getLang() {
  return lang;
}
export function isEn() {
  return lang === 'en';
}

/** Locale string for Intl / toLocale* APIs */
export function locale() {
  return lang === 'en' ? 'en-GB' : 'ar-OM';
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLang(next) {
  if (next !== 'ar' && next !== 'en') return;
  if (next === lang) return;
  lang = next;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  applyDocument();
  if (lang === 'en') startObserver();
  else stopObserver();
  listeners.forEach((fn) => {
    try {
      fn(lang);
    } catch {
      /* ignore */
    }
  });
}

export function toggleLang() {
  setLang(lang === 'ar' ? 'en' : 'ar');
}

// ------------------------- translation engine -------------------------

const toWestern = (s) => s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
const norm = (s) => toWestern(s).replace(/\s+/g, ' ').trim();

const PLAIN = new Map(Object.entries(dict.plain || {}));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Templates → anchored regexes, most specific (most literal text) first
const PATTERNS = (dict.tpl || [])
  .map(([ar, en]) => {
    const key = norm(ar);
    const literal = key.replace(/\{\d+\}/g, '');
    const order = [];
    const src = key
      .split(/(\{\d+\})/)
      .map((part) => {
        const m = /^\{(\d+)\}$/.exec(part);
        if (m) {
          order.push(Number(m[1]));
          return '(.+?)';
        }
        return escapeRe(part);
      })
      .join('');
    return { re: new RegExp(`^${src}$`, 's'), en, order, weight: literal.length };
  })
  .filter((p) => p.weight > 2) // skip over-generic templates like "{0} و{1}"
  .sort((a, b) => b.weight - a.weight);

// Substring fallback for text built by concatenation: longest phrases first,
// matched only on Arabic word boundaries.
const PHRASES = [...PLAIN.keys()].filter((k) => k.length >= 4 && AR_LETTERS.test(k)).sort((a, b) => b.length - a.length);
// Word boundary = Arabic letters/diacritics only (not Arabic punctuation like ، ؟)
const AR_WORD = '[\\u0621-\\u065F\\u0670-\\u06D3]';
const PHRASE_RE = PHRASES.length
  ? new RegExp(`(^|[^\\u0621-\\u065F\\u0670-\\u06D3])(${PHRASES.map(escapeRe).join('|')})(?!${AR_WORD})`, 'g') // no lookbehind: works on older iPad Safari
  : null;
const arabicCount = (s) => (s.match(/[\u0621-\u064A]/g) || []).length;
const SEPARATORS = [' · ', '، ', ' - ', ' – '];

function punctuation(s) {
  return s
    .replace(/(^|[\s(])ص\s*(?=\d)/g, '$1p. ')
    .replace(/≈(أ|ب|ج|د|هـ)/g, (_, l) => '≈' + ({ 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E' })[l])
    .replace(/؟/g, '?')
    .replace(/،/g, ',')
    .replace(/؛/g, ';')
    .replace(/[«»]/g, '"')
    .replace(/(^|\s)و\s*(?=[\d(])/g, '$1and ')
    .replace(/\sو\s/g, ' and ');
}

const cache = new Map();
const misses = new Set();

function translateCore(core, depth) {
  if (PLAIN.has(core)) return PLAIN.get(core);
  // Collect candidates and keep the one that leaves the least Arabic behind.
  let best = null;
  let bestScore = Infinity;
  const consider = (out) => {
    const score = arabicCount(out);
    if (score < bestScore) {
      best = out;
      bestScore = score;
    }
    return score === 0;
  };
  if (depth < 4) {
    for (const p of PATTERNS) {
      const m = p.re.exec(core);
      if (!m) continue;
      const out = p.en.replace(/\{(\d+)\}/g, (_, n) => {
        const idx = p.order.indexOf(Number(n));
        const val = idx >= 0 ? m[idx + 1] : '';
        return AR_LETTERS.test(val) ? translateCore(norm(val), depth + 1) : val;
      });
      if (consider(punctuation(out))) return best;
    }
    // Lists joined with separators: translate each part
    for (const sep of SEPARATORS) {
      if (!core.includes(sep)) continue;
      const out = core
        .split(sep)
        .map((part) => (AR_LETTERS.test(part) ? translateCore(norm(part), depth + 1) : part))
        .join(sep === '، ' ? ', ' : sep);
      if (consider(out)) return best;
    }
  }
  let out = core;
  if (PHRASE_RE && AR_LETTERS.test(out)) out = out.replace(PHRASE_RE, (_, pre, k) => pre + (PLAIN.get(k) ?? k));
  consider(punctuation(out));
  if (/[\u0621-\u064A]/.test(best)) misses.add(core);
  return best;
}

/** Translate an Arabic UI string into the active language (identity in Arabic mode). */
export function t(text) {
  if (lang !== 'en' || text === null || text === undefined) return text;
  const s = String(text);
  if (!AR_LETTERS.test(s)) return s;
  if (cache.has(s)) return cache.get(s);
  const lead = s.match(/^\s*/)[0];
  const trail = s.match(/\s*$/)[0];
  const core = norm(s);
  const out = core ? lead + translateCore(core, 0) + (trail && trail !== s ? trail : '') : s;
  cache.set(s, out);
  return out;
}

/** Untranslated strings seen so far (for maintainers: run i18nMisses() in the console). */
export function getMisses() {
  return [...misses];
}
if (typeof window !== 'undefined') window.i18nMisses = getMisses;

// ------------------------------ DOM layer -----------------------------

const original = new WeakMap(); // Text node → Arabic source
const written = new WeakMap(); // Text node → value we wrote
const attrOriginal = new WeakMap(); // Element → { attr: Arabic }
let observer = null;

function skipped(el) {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if (SKIP_TAGS.has(n.tagName) || n.hasAttribute('data-i18n-skip')) return true;
  }
  return false;
}

function translateTextNode(node) {
  const v = node.nodeValue;
  if (!v || v === written.get(node) || !AR_LETTERS.test(v)) return;
  if (!node.parentElement || skipped(node.parentElement)) return;
  original.set(node, v);
  const out = t(v);
  if (out !== v) {
    written.set(node, out);
    node.nodeValue = out;
  }
}

function translateAttrs(el) {
  // attributes (placeholder, aria-label…) of inputs are UI text, so only the skip marker applies here
  if (el.closest('[data-i18n-skip]') || (el.parentElement && skipped(el.parentElement))) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v || !AR_LETTERS.test(v)) continue;
    const store = attrOriginal.get(el) || {};
    store[a] = v;
    attrOriginal.set(el, store);
    const out = t(v);
    if (out !== v) el.setAttribute(a, out);
  }
}

function translateTree(root) {
  if (!root) return;
  if (root.nodeType === 3) return translateTextNode(root);
  if (root.nodeType !== 1) return;
  translateAttrs(root);
  if (skipped(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n = walker.nextNode();
  while (n) {
    if (n.nodeType === 3) translateTextNode(n);
    else translateAttrs(n);
    n = walker.nextNode();
  }
}

function startObserver() {
  if (typeof document === 'undefined' || observer) return;
  translateTree(document.body);
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') translateTextNode(r.target);
      else if (r.type === 'attributes') translateAttrs(r.target);
      else r.addedNodes.forEach(translateTree);
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRS
  });
}

function stopObserver() {
  if (observer) observer.disconnect();
  observer = null;
}

function applyDocument() {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'en' ? 'ltr' : 'rtl';
  document.title = TITLES[lang];
}

/** Call once at startup, before React renders. */
export function initI18n() {
  applyDocument();
  if (lang === 'en') {
    if (document.body) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }
}
