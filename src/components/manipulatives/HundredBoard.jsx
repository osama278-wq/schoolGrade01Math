import { useState } from 'react';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords } from '../../utils/arabic.js';

const ROW_COLORS = ['#be123c', '#15803d', '#1d4ed8', '#7e22ce', '#c2410c', '#be123c', '#0e7490', '#1d4ed8', '#7e22ce', '#9f1239'];

/** عرض ثابت للوحة الأعداد (١–٣٠ أو ١–١٠٠) – الأعداد من اليمين إلى اليسار كما في الكتاب */
export function HundredView({ from = 1, to = 100, highlight = [], hide = [], cell = 30 }) {
  const nums = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  return (
    <div className="inline-grid grid-cols-10 gap-0.5 rounded-xl border-2 border-oman-300 bg-oman-300 p-0.5" dir="rtl">
      {nums.map((n) => {
        const hidden = hide.includes(n);
        const hi = highlight.includes(n);
        return (
          <div
            key={n}
            className="flex items-center justify-center rounded-sm font-extrabold"
            style={{
              width: cell,
              height: cell,
              fontSize: cell * 0.45,
              background: hidden ? '#fde68a' : hi ? '#fdba74' : '#fffbeb',
              color: ROW_COLORS[Math.floor((n - 1) / 10) % 10]
            }}
          >
            {hidden ? '؟' : toAr(n)}
          </div>
        );
      })}
    </div>
  );
}

const PAINTS = [
  { hex: '#fdba74', name: 'برتقالي' },
  { hex: '#86efac', name: 'أخضر' },
  { hex: '#93c5fd', name: 'أزرق' },
  { hex: '#f9a8d4', name: 'وردي' }
];

/** لوحة المائة التفاعلية للتظليل واكتشاف الأنماط */
export default function HundredBoard() {
  const [paint, setPaint] = useState(PAINTS[0].hex);
  const [marks, setMarks] = useState({});
  const [covered, setCovered] = useState({});
  const [mode, setMode] = useState('paint'); // paint | cover | say

  const tap = (n) => {
    if (mode === 'say') {
      sfx('tap');
      speak(numberToWords(n));
      return;
    }
    if (mode === 'cover') {
      sfx('pop');
      setCovered((c) => ({ ...c, [n]: !c[n] }));
      return;
    }
    sfx('pop');
    setMarks((m) => {
      const next = { ...m };
      if (next[n] === paint) delete next[n];
      else next[n] = paint;
      return next;
    });
  };

  const pattern = (k, start = k) => {
    const next = { ...marks };
    for (let n = start; n <= 100; n += k) next[n] = paint;
    setMarks(next);
    sfx('success');
    speak(k === 10 ? 'العدّ بالعشرات: عشرة، عشرون، ثلاثون...' : k === 2 ? 'الأعداد الزوجية: اثنان، أربعة، ستة...' : `العدّ بالقفز ${numberToWords(k)}`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PAINTS.map((p) => (
          <button
            key={p.hex}
            onClick={() => { setPaint(p.hex); setMode('paint'); }}
            className={`h-12 w-12 rounded-full ring-4 ${paint === p.hex && mode === 'paint' ? 'ring-oman-700' : 'ring-white'}`}
            style={{ background: p.hex }}
            aria-label={`لون ${p.name}`}
          />
        ))}
        <button className={mode === 'cover' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('cover')}>🙈 إخفاء أعداد</button>
        <button className={mode === 'say' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('say')}>🔊 انطق العدد</button>
      </div>
      <div className="grid grid-cols-10 gap-1 rounded-2xl bg-oman-300 p-1.5 shadow-md" dir="rtl">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => tap(n)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-black transition sm:h-12 sm:w-12 sm:text-lg"
            style={{ background: covered[n] ? '#0f4c5c' : marks[n] || '#fffbeb', color: covered[n] ? '#fde68a' : ROW_COLORS[Math.floor((n - 1) / 10)] }}
            aria-label={`العدد ${n}`}
          >
            {covered[n] ? '؟' : toAr(n)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button className="btn-ghost" onClick={() => pattern(10)}>العشرات (١٠، ٢٠...)</button>
        <button className="btn-ghost" onClick={() => pattern(2)}>الزوجية (٢، ٤...)</button>
        <button className="btn-ghost" onClick={() => pattern(5)}>القفز ٥</button>
        <button className="btn-ghost" onClick={() => pattern(10, 7)}>عمود ٧، ١٧، ٢٧...</button>
        <button className="btn-ghost" onClick={() => { setMarks({}); setCovered({}); sfx('whoosh'); }}>↺ مسح</button>
      </div>
    </div>
  );
}
