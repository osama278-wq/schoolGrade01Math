// =====================================================================
// خدمة صوتية موحّدة (Audio-First UX)
// - النطق: Web Speech API بأولوية ar-OM ثم ar-SA ثم أي صوت عربي
// - المؤثرات: Web Audio API (نغمات مولّدة برمجياً – لا ملفات خارجية)
// =====================================================================

import { isEn, t } from '../i18n/index.js';

const PREFS_KEY = 'g1math.audio';

const state = {
  voice: null,
  enVoice: null,
  voicesReady: false,
  muted: false,
  rate: 0.85,
  ctx: null
};

try {
  const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  if (typeof saved.muted === 'boolean') state.muted = saved.muted;
  if (typeof saved.rate === 'number') state.rate = saved.rate;
} catch {
  /* تجاهل */
}

function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ muted: state.muted, rate: state.rate }));
  } catch {
    /* تجاهل */
  }
}

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (!voices.length) return;
  const order = ['ar-OM', 'ar-SA', 'ar-AE', 'ar-QA', 'ar-KW', 'ar-EG', 'ar'];
  for (const lang of order) {
    const v = voices.find((x) => x.lang?.toLowerCase().startsWith(lang.toLowerCase()));
    if (v) {
      state.voice = v;
      break;
    }
  }
  const enOrder = ['en-GB', 'en-US', 'en-AU', 'en'];
  for (const lang of enOrder) {
    const v = voices.find((x) => x.lang?.toLowerCase().replace('_', '-').startsWith(lang.toLowerCase()));
    if (v) {
      state.enVoice = v;
      break;
    }
  }
  state.voicesReady = true;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

/** هل يتوفر صوت عربي على هذا الجهاز؟ */
export function hasArabicVoice() {
  if (isEn()) return true; // English voices are available on virtually every device
  return Boolean(state.voice);
}

export function isMuted() {
  return state.muted;
}

export function setMuted(m) {
  state.muted = Boolean(m);
  if (state.muted) stopSpeaking();
  savePrefs();
}

export function setRate(r) {
  state.rate = Math.min(1.2, Math.max(0.6, r));
  savePrefs();
}

export function getRate() {
  return state.rate;
}

export function stopSpeaking() {
  try {
    synth?.cancel();
  } catch {
    /* تجاهل */
  }
}

/**
 * نطق نص عربي. يُلغي أي نطق سابق حتى لا تتراكم التعليمات.
 * @returns {Promise<void>} تنتهي عند انتهاء النطق (أو فوراً عند عدم الدعم)
 */
export function speak(text, { rate, interrupt = true } = {}) {
  return new Promise((resolve) => {
    if (!synth || state.muted || !text) return resolve();
    try {
      if (interrupt) synth.cancel();
      if (!state.voicesReady) pickVoice();
      const en = isEn();
      const u = new SpeechSynthesisUtterance(String(en ? t(text) : text));
      const voice = en ? state.enVoice : state.voice;
      u.lang = voice?.lang || (en ? 'en-GB' : 'ar-SA');
      if (voice) u.voice = voice;
      u.rate = rate ?? state.rate;
      u.pitch = 1.05;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      synth.speak(u);
      // حماية: بعض المتصفحات لا تطلق onend
      setTimeout(resolve, Math.min(15000, 600 + String(text).length * 120));
    } catch {
      resolve();
    }
  });
}

// ------------------------- المؤثرات الصوتية -------------------------

function ctx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!state.ctx) state.ctx = new AC();
  if (state.ctx.state === 'suspended') state.ctx.resume().catch(() => {});
  return state.ctx;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.18 } = {}) {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

const SFX = {
  tap: () => tone(660, 0, 0.08, { type: 'triangle', gain: 0.08 }),
  pop: () => {
    tone(900, 0, 0.06, { type: 'square', gain: 0.06 });
    tone(1400, 0.04, 0.08, { type: 'sine', gain: 0.08 });
  },
  success: () => {
    tone(523.25, 0, 0.15);
    tone(659.25, 0.12, 0.15);
    tone(783.99, 0.24, 0.3);
  },
  error: () => {
    tone(330, 0, 0.18, { type: 'triangle', gain: 0.12 });
    tone(262, 0.16, 0.25, { type: 'triangle', gain: 0.1 });
  },
  star: () => {
    [880, 1108, 1318, 1760].forEach((f, i) => tone(f, i * 0.07, 0.18, { gain: 0.1 }));
  },
  celebrate: () => {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.2, { type: 'triangle', gain: 0.14 }));
  },
  alarm: () => {
    [0, 0.35, 0.7].forEach((t) => {
      tone(880, t, 0.18, { gain: 0.12 });
      tone(1175, t + 0.12, 0.18, { gain: 0.1 });
    });
  },
  tick: () => tone(1200, 0, 0.03, { type: 'square', gain: 0.03 }),
  whoosh: () => {
    for (let i = 0; i < 6; i++) tone(300 + i * 90, i * 0.03, 0.08, { type: 'sawtooth', gain: 0.03 });
  }
};

/** تشغيل مؤثر صوتي باسمه */
export function sfx(name) {
  if (state.muted) return;
  try {
    SFX[name]?.();
  } catch {
    /* تجاهل */
  }
}

// عبارات تشجيع متنوعة للتغذية الراجعة الفورية (وثيقة التقويم: شفهية + مرئية)
export const PRAISE = ['أحسنت يا بطل!', 'رائع جداً!', 'ممتاز! إجابة صحيحة', 'عمل جميل!', 'أنت مبدع!', 'برافو! استمر'];
export const RETRY = ['حاول مرة أخرى، أنت قادر!', 'قريب! فكّر من جديد', 'لا بأس، لنحاول معاً', 'انظر إلى التلميح وحاول'];

export function praise() {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
}
export function retry() {
  return RETRY[Math.floor(Math.random() * RETRY.length)];
}
