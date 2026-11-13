// مولّد أعداد شبه عشوائية قابل للتكرار (لبيانات تجريبية ثابتة) + أدوات عامة

export function seeded(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** خيارات رقمية فريدة حول الإجابة الصحيحة */
export function numberOptions(answer, count = 3, { min = 0, max = 100, spread = 3 } = {}) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < count && guard++ < 100) {
    const d = rand(-spread, spread);
    const v = answer + d;
    if (v >= min && v <= max) set.add(v);
  }
  return shuffle([...set]);
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
