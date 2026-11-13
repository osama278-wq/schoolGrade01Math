import { useState } from 'react';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords } from '../../utils/arabic.js';

/**
 * عرض خط الأعداد (SVG). rtl=true يضع الصفر يميناً كما في أشرطة الأعداد بالكتاب.
 * jumps: [[من، إلى], ...] ترسم قفزات بخطوة واحدة
 */
export function NumberLineView({ from = 0, to = 20, jumps = [], mark = [], highlight = [], rtl = true, height = 120, onPick, current }) {
  const n = to - from;
  const W = Math.max(520, n * 38);
  const pad = 26;
  const step = (W - pad * 2) / n;
  const x = (v) => (rtl ? W - pad - (v - from) * step : pad + (v - from) * step);
  const baseY = height - 42;

  const hops = [];
  jumps.forEach(([a, b], k) => {
    const dir = b >= a ? 1 : -1;
    for (let v = a; v !== b; v += dir) hops.push({ a: v, b: v + dir, k, dir });
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${height}`} className="mx-auto block min-w-[480px]" style={{ maxWidth: W }} role="img" aria-label="خط الأعداد">
        <defs>
          <marker id="nl-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10z" fill="#d97706" />
          </marker>
        </defs>
        <line x1={pad - 14} y1={baseY} x2={W - pad + 14} y2={baseY} stroke="#0f4c5c" strokeWidth="4" strokeLinecap="round" />
        {hops.map((h, i) => {
          const x1 = x(h.a);
          const x2 = x(h.b);
          const mid = (x1 + x2) / 2;
          const color = h.dir > 0 ? '#d97706' : '#be123c';
          return <path key={i} d={`M${x1} ${baseY - 6} Q${mid} ${baseY - 46} ${x2} ${baseY - 6}`} fill="none" stroke={color} strokeWidth="3.5" markerEnd="url(#nl-arrow)" className="animate-pop" />;
        })}
        {Array.from({ length: n + 1 }, (_, i) => {
          const v = from + i;
          const isMark = mark.includes(v);
          const isHi = highlight.includes(v) || current === v;
          return (
            <g key={v} onClick={onPick ? () => onPick(v) : undefined} style={{ cursor: onPick ? 'pointer' : 'default' }}>
              <rect x={x(v) - step / 2} y={baseY - 50} width={step} height={92} fill="transparent" />
              <line x1={x(v)} y1={baseY - 10} x2={x(v)} y2={baseY + 10} stroke="#0f4c5c" strokeWidth={v % 5 === 0 ? 4 : 2.5} />
              {(isHi || isMark) && <circle cx={x(v)} cy={baseY + 26} r="15" fill={isMark ? '#fde68a' : '#bae6fd'} stroke="#d97706" strokeWidth="2" />}
              <text x={x(v)} y={baseY + 33} textAnchor="middle" fontSize="19" fontWeight="800" fill="#082f39">
                {toAr(v)}
              </text>
              {current === v && (
                <text x={x(v)} y={baseY - 52} textAnchor="middle" fontSize="30">
                  🧒
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** خط الأعداد الديناميكي (٠–٢٠ و٠–٣٠) مع أداة رسم قوس القفز للأمام والخلف */
export default function NumberLine() {
  const [max, setMax] = useState(20);
  const [pos, setPos] = useState(5);
  const [start, setStart] = useState(5);
  const [jumps, setJumps] = useState([]);
  const [rtl, setRtl] = useState(true);

  const move = (delta) => {
    const target = Math.min(max, Math.max(0, pos + delta));
    if (target === pos) return;
    sfx('whoosh');
    setJumps((j) => [...j, [pos, target]]);
    setPos(target);
    speak(numberToWords(target));
  };

  const pick = (v) => {
    if (v === pos) return;
    sfx('whoosh');
    setJumps((j) => [...j, [pos, v]]);
    setPos(v);
    speak(numberToWords(v));
  };

  const reset = (v = pos) => {
    setStart(v);
    setPos(v);
    setJumps([]);
  };

  const diff = pos - start;
  const equation = diff === 0 ? toAr(start) : diff > 0 ? `${toAr(start)} + ${toAr(diff)} = ${toAr(pos)}` : `${toAr(start)} − ${toAr(-diff)} = ${toAr(pos)}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {[20, 30].map((m) => (
          <button key={m} className={max === m ? 'btn-primary' : 'btn-ghost'} onClick={() => { setMax(m); reset(Math.min(pos, m)); }}>
            ٠ – {toAr(m)}
          </button>
        ))}
        <button className="btn-ghost" onClick={() => setRtl((r) => !r)}>⇄ اتجاه الخط</button>
      </div>
      <p className="text-center font-bold text-oman-600">المس أي عدد لتقفز إليه، أو استخدم أزرار القفز. (المس «ابدأ من هنا» لتحديد نقطة البداية)</p>
      <NumberLineView from={0} to={max} jumps={jumps} current={pos} highlight={[start]} rtl={rtl} onPick={pick} height={140} />
      <div className="flex flex-wrap justify-center gap-2">
        <button className="btn-amber text-xl" onClick={() => move(1)}>قفزة للأمام +١</button>
        <button className="btn-amber text-xl" onClick={() => move(2)}>قفزتان للأمام +٢</button>
        <button className="btn text-xl bg-rose-600 text-white" onClick={() => move(-1)}>قفزة للخلف −١</button>
        <button className="btn text-xl bg-rose-600 text-white" onClick={() => move(-2)}>خطوتان للخلف −٢</button>
        <button className="btn-ghost" onClick={() => reset(pos)}>📍 ابدأ من هنا</button>
        <button className="btn-ghost" onClick={() => reset(0)}>↺ مسح</button>
      </div>
      <button
        className="btn-ghost text-3xl font-black"
        onClick={() => speak(diff === 0 ? numberToWords(start) : diff > 0 ? `${numberToWords(start)} زائد ${numberToWords(diff)} يساوي ${numberToWords(pos)}` : `${numberToWords(start)} ناقص ${numberToWords(-diff)} يساوي ${numberToWords(pos)}`)}
      >
        🔊 <span dir="rtl">{equation}</span>
      </button>
      {diff !== 0 && <p className="chip !text-lg">الفرق بين {toAr(Math.min(start, pos))} و{toAr(Math.max(start, pos))} هو {toAr(Math.abs(diff))}</p>}
    </div>
  );
}
