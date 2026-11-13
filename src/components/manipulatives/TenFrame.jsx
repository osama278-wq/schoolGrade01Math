import { useState } from 'react';
import { startDrag } from '../../utils/dragdrop.js';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords } from '../../utils/arabic.js';

export const DISK_COLORS = {
  red: { hex: '#dc2626', name: 'أحمر' },
  yellow: { hex: '#facc15', name: 'أصفر' },
  blue: { hex: '#2563eb', name: 'أزرق' },
  green: { hex: '#16a34a', name: 'أخضر' }
};

const disk = (hex, size = 40) => `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${hex};border:3px solid rgba(0,0,0,.18)"></div>`;

/** عرض ثابت لإطار العشرة (للأسئلة وأوراق العمل) */
export function TenFrameView({ red = 0, yellow = 0, blue = 0, green = 0, removed = 0, rows = false, size = 44 }) {
  const cells = [];
  if (rows) {
    // الضعف: صف علوي أحمر وصف سفلي أصفر متقابلان
    for (let i = 0; i < 5; i++) cells.push(i < red ? 'red' : null);
    for (let i = 0; i < 5; i++) cells.push(i < yellow ? 'yellow' : null);
  } else {
    const seq = [...Array(red).fill('red'), ...Array(yellow).fill('yellow'), ...Array(blue).fill('blue'), ...Array(green).fill('green')];
    for (let i = 0; i < 10; i++) cells.push(seq[i] || null);
  }
  return (
    <div className="inline-flex items-center gap-3">
      <div className="grid grid-cols-5 gap-1 rounded-xl border-4 border-slate-600 bg-white p-1" style={{ direction: 'rtl' }}>
        {cells.map((c, i) => (
          <div key={i} className="flex items-center justify-center rounded-md border-2 border-slate-300" style={{ width: size, height: size }}>
            {c && <div className="rounded-full border-2 border-black/20" style={{ width: size - 12, height: size - 12, background: DISK_COLORS[c].hex }} />}
          </div>
        ))}
      </div>
      {removed > 0 && (
        <div className="flex flex-wrap items-center gap-1" style={{ maxWidth: size * 2 }} aria-label="أقراص مأخوذة">
          <span className="text-2xl">➜</span>
          {Array.from({ length: removed }, (_, i) => (
            <div key={i} className="rounded-full border-2 border-black/20 opacity-70" style={{ width: size - 16, height: size - 16, background: DISK_COLORS.red.hex }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** إطار العشرة التفاعلي (مفرد أو مزدوج) مع أقراص ملونة بالسحب أو اللمس */
export default function TenFrame({ frames = 2, colors = ['red', 'yellow', 'blue'], showModes = true }) {
  const [cells, setCells] = useState(() => Array(frames * 10).fill(null));
  const [color, setColor] = useState(colors[0]);
  const [mode, setMode] = useState('fill'); // fill | remove
  const [removed, setRemoved] = useState(0);

  const count = cells.filter(Boolean).length;
  const byColor = Object.fromEntries(colors.map((c) => [c, cells.filter((x) => x === c).length]));

  const place = (idx, c) => {
    setCells((prev) => {
      const next = [...prev];
      next[idx] = c;
      const n = next.filter(Boolean).length;
      speak(numberToWords(n));
      return next;
    });
  };

  const onCellTap = (idx) => {
    if (mode === 'remove') {
      if (cells[idx]) {
        sfx('pop');
        setRemoved((r) => r + 1);
        setCells((prev) => {
          const next = [...prev];
          next[idx] = null;
          const left = next.filter(Boolean).length;
          speak(`بقي ${numberToWords(left)}`);
          return next;
        });
      }
      return;
    }
    if (cells[idx]) {
      sfx('tap');
      setCells((prev) => prev.map((x, i) => (i === idx ? null : x)));
    } else {
      sfx('pop');
      place(idx, color);
    }
  };

  const fillNext = (c = color) => {
    const idx = cells.findIndex((x) => !x);
    if (idx >= 0) {
      sfx('pop');
      place(idx, c);
    }
  };

  const doubleIt = () => {
    // الضعف: انسخ أقراص الصف العلوي إلى الصف السفلي في الإطار الأول
    setCells((prev) => {
      const next = [...prev];
      const top = next.slice(0, 5);
      const n = top.filter(Boolean).length;
      for (let i = 0; i < 5; i++) next[5 + i] = i < n ? 'yellow' : null;
      speak(`ضعف ${numberToWords(n)} هو ${numberToWords(n * 2)}`);
      return next;
    });
    sfx('success');
  };

  const reset = () => {
    setCells(Array(frames * 10).fill(null));
    setRemoved(0);
    sfx('whoosh');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              setMode('fill');
              fillNext(c);
            }}
            onPointerDown={(e) => startDrag(e, { payload: c, ghost: disk(DISK_COLORS[c].hex), onDrop: (zone, pc) => zone.startsWith('tf-') && place(Number(zone.slice(3)), pc), onTap: () => { setColor(c); setMode('fill'); fillNext(c); } })}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow ring-4 ${color === c && mode === 'fill' ? 'ring-amber-brand' : 'ring-oman-100'}`}
            aria-label={`قرص ${DISK_COLORS[c].name} – اسحبه أو المسه`}
          >
            <span className="block h-10 w-10 rounded-full border-4 border-black/15" style={{ background: DISK_COLORS[c].hex }} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {Array.from({ length: frames }, (_, f) => (
          <div key={f} className="grid grid-cols-5 gap-1.5 rounded-2xl border-[6px] border-slate-700 bg-white p-1.5 shadow-md">
            {cells.slice(f * 10, f * 10 + 10).map((c, j) => {
              const idx = f * 10 + j;
              return (
                <button
                  key={idx}
                  type="button"
                  data-drop={`tf-${idx}`}
                  onClick={() => onCellTap(idx)}
                  className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-slate-300 bg-slate-50 sm:h-16 sm:w-16"
                  aria-label={c ? `خانة فيها قرص ${DISK_COLORS[c].name}` : 'خانة فارغة'}
                >
                  {c && <span className="block h-10 w-10 animate-pop rounded-full border-4 border-black/15 sm:h-12 sm:w-12" style={{ background: DISK_COLORS[c].hex }} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-bold">
        <span className="chip !text-xl">المجموع: {toAr(count)}</span>
        {colors.map((c) => (byColor[c] ? (
          <span key={c} className="chip" style={{ background: DISK_COLORS[c].hex + '33' }}>
            {DISK_COLORS[c].name}: {toAr(byColor[c])}
          </span>
        ) : null))}
        {frames === 1 && count > 0 && count < 10 && <span className="chip bg-amber-100 text-amber-800">لتكوين ١٠ نحتاج {toAr(10 - count)}</span>}
        {removed > 0 && <span className="chip bg-rose-100 text-rose-700">أخذنا {toAr(removed)} – بقي {toAr(count)}</span>}
      </div>

      {showModes && (
        <div className="flex flex-wrap justify-center gap-2">
          <button className={mode === 'fill' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('fill')}>
            ➕ أضف أقراصاً
          </button>
          <button className={mode === 'remove' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('remove')}>
            ➖ الأخذ من عشرة
          </button>
          <button className="btn-ghost" onClick={doubleIt}>
            ✌️ أوجد الضعف
          </button>
          <button className="btn-ghost" onClick={() => speak(`في الإطار ${numberToWords(count)} أقراص`)}>
            🔊 كم العدد؟
          </button>
          <button className="btn-ghost" onClick={reset}>
            ↺ ابدأ من جديد
          </button>
        </div>
      )}
    </div>
  );
}
