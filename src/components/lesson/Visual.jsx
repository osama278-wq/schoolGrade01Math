// =====================================================================
// محرّك التمثيل الأيقوني (برونر – المرحلة الثانية)
// يحوّل وصف «visual» في curriculum.json إلى رسم SVG/HTML قابل للطباعة
// =====================================================================
import { TenFrameView } from '../manipulatives/TenFrame.jsx';
import { CubeTowersView, Cube } from '../manipulatives/LinkingCubes.jsx';
import { NumberLineView } from '../manipulatives/NumberLine.jsx';
import { HundredView } from '../manipulatives/HundredBoard.jsx';
import { BalanceView } from '../manipulatives/BalanceScale.jsx';
import { ClockView, MoneyView } from '../manipulatives/ClockMoney.jsx';
import { toAr, ordinal } from '../../utils/arabic.js';

export const BEAD_COLORS = {
  yellow: { hex: '#facc15', name: 'أصفر' },
  green: { hex: '#22c55e', name: 'أخضر' },
  blue: { hex: '#3b82f6', name: 'أزرق' },
  white: { hex: '#ffffff', name: 'أبيض' },
  red: { hex: '#ef4444', name: 'أحمر' }
};

// ------------------------- الأشكال الثنائية الأبعاد -------------------------
export function Shape2D({ type, color = '#0f4c5c', size = 70, fill }) {
  const f = fill || color + '33';
  const common = { fill: f, stroke: color, strokeWidth: 4, strokeLinejoin: 'round' };
  const poly = (n) => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${50 + 42 * Math.cos(a)},${52 + 42 * Math.sin(a)}`;
    });
    return <polygon points={pts.join(' ')} {...common} />;
  };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={SHAPE_NAMES[type]}>
      {type === 'circle' && <circle cx="50" cy="50" r="42" {...common} />}
      {type === 'square' && <rect x="12" y="12" width="76" height="76" {...common} />}
      {type === 'rectangle' && <rect x="4" y="26" width="92" height="48" {...common} />}
      {type === 'triangle' && <polygon points="50,8 92,88 8,88" {...common} />}
      {type === 'pentagon' && poly(5)}
      {type === 'hexagon' && poly(6)}
      {type === 'diamond' && <polygon points="50,6 94,50 50,94 6,50" {...common} />}
      {type === 'oval' && <ellipse cx="50" cy="50" rx="46" ry="30" {...common} />}
    </svg>
  );
}

export const SHAPE_NAMES = {
  circle: 'دائرة',
  square: 'مربع',
  rectangle: 'مستطيل',
  triangle: 'مثلث',
  pentagon: 'خماسي',
  hexagon: 'سداسي',
  diamond: 'معيّن',
  oval: 'شكل بيضاوي'
};

const SHAPE_COLORS = { circle: '#16a34a', square: '#dc2626', rectangle: '#0f766e', triangle: '#ca8a04', pentagon: '#7c3aed', hexagon: '#2563eb' };

// ------------------------- المجسمات -------------------------
export const SOLID_NAMES = {
  cube: 'مكعب',
  cuboid: 'منشور رباعي',
  sphere: 'كرة',
  cone: 'مخروط',
  pyramid: 'هرم',
  prism: 'منشور ثلاثي',
  cylinder: 'أسطوانة'
};

export function Solid({ type, size = 90 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={SOLID_NAMES[type]}>
      {type === 'cube' && (
        <g stroke="#7f1d1d" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="20,35 60,35 60,85 20,85" fill="#e11d48" />
          <polygon points="20,35 38,18 78,18 60,35" fill="#fb7185" />
          <polygon points="60,35 78,18 78,68 60,85" fill="#be123c" />
        </g>
      )}
      {type === 'cuboid' && (
        <g stroke="#854d0e" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="8,45 70,45 70,82 8,82" fill="#facc15" />
          <polygon points="8,45 24,30 86,30 70,45" fill="#fde047" />
          <polygon points="70,45 86,30 86,67 70,82" fill="#eab308" />
        </g>
      )}
      {type === 'sphere' && (
        <g>
          <defs>
            <radialGradient id="sph" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#93a3c8" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="52" r="38" fill="url(#sph)" stroke="#475569" strokeWidth="2" />
        </g>
      )}
      {type === 'cone' && (
        <g stroke="#581c87" strokeWidth="2.5">
          <path d="M50 8 L82 80 A32 10 0 0 1 18 80 Z" fill="#a855f7" />
          <ellipse cx="50" cy="80" rx="32" ry="10" fill="#c084fc" />
        </g>
      )}
      {type === 'pyramid' && (
        <g stroke="#14532d" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="50,8 14,78 56,90" fill="#4ade80" />
          <polygon points="50,8 56,90 88,72" fill="#16a34a" />
        </g>
      )}
      {type === 'prism' && (
        <g stroke="#7c2d12" strokeWidth="2.5" strokeLinejoin="round">
          <polygon points="10,82 30,40 50,82" fill="#fb923c" />
          <polygon points="30,40 74,26 94,68 50,82" fill="#f97316" />
          <polygon points="50,82 94,68 74,26 30,40" fill="#ea580c" opacity="0.6" />
        </g>
      )}
      {type === 'cylinder' && (
        <g stroke="#0c4a6e" strokeWidth="2.5">
          <path d="M22 22 V78 A28 9 0 0 0 78 78 V22" fill="#38bdf8" />
          <ellipse cx="50" cy="22" rx="28" ry="9" fill="#7dd3fc" />
        </g>
      )}
    </svg>
  );
}

// ------------------------- اليدان والأصابع -------------------------
function Hand({ up = 5, color = '#16a34a' }) {
  const fingers = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 110 130" width="96" height="114" aria-label={`${up} أصابع`}>
      <rect x="18" y="62" width="74" height="58" rx="22" fill="#fcd9b6" stroke="#b45309" strokeWidth="2.5" />
      <rect x="18" y="104" width="74" height="16" rx="6" fill={color} />
      {fingers.map((i) => {
        const raised = i < up;
        const x = 22 + i * 15;
        const h = raised ? 46 : 16;
        return <rect key={i} x={x} y={66 - h} width="12" height={h + 8} rx="6" fill="#fcd9b6" stroke="#b45309" strokeWidth="2" />;
      })}
    </svg>
  );
}

// ------------------------- الأوعية -------------------------
function Container({ h = 60, w = 50, color = '#38bdf8', label }) {
  return (
    <div className="flex flex-col items-center justify-end gap-1">
      <svg viewBox={`0 0 ${w + 10} ${h + 14}`} width={w + 10} height={h + 14}>
        <ellipse cx={(w + 10) / 2} cy="7" rx={w / 2} ry="5" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
        <path d={`M5 7 V${h + 4} Q5 ${h + 12} 13 ${h + 12} H${w - 3} Q${w + 5} ${h + 12} ${w + 5} ${h + 4} V7`} fill={color} stroke="#475569" strokeWidth="2" />
        <rect x="9" y="12" width="5" height={h - 10} rx="2" fill="#fff" opacity="0.5" />
      </svg>
      {label && <span className="text-lg font-black text-oman-800">{label}</span>}
    </div>
  );
}

// ------------------------- المكوّن الرئيسي -------------------------
export default function Visual({ v, compact = false }) {
  if (!v) return null;
  const size = compact ? 0.75 : 1;

  switch (v.kind) {
    case 'objects': {
      const items = Array.from({ length: v.count }, (_, i) => i);
      return (
        <div className={`mx-auto flex max-w-md flex-wrap justify-center ${v.scatter ? 'gap-x-5 gap-y-2' : 'gap-3'}`} aria-label={`${v.count} عناصر`}>
          {items.map((i) => (
            <span
              key={i}
              className={`relative inline-block ${v.crossed && i >= v.count - v.crossed ? 'opacity-40' : ''}`}
              style={{ fontSize: 40 * size, transform: v.scatter ? `translateY(${((i * 37) % 17) - 8}px) rotate(${((i * 53) % 30) - 15}deg)` : undefined }}
            >
              {v.emoji}
              {v.crossed && i >= v.count - v.crossed && <span className="absolute inset-0 flex items-center justify-center text-4xl text-rose-600">✕</span>}
            </span>
          ))}
        </div>
      );
    }
    case 'groups':
      return (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {v.groups.map((g, gi) => (
            <div key={gi} className="flex items-center gap-4">
              {gi > 0 && <span className="text-4xl font-black text-amber-brand">{v.op || '+'}</span>}
              <div className="flex max-w-[180px] flex-wrap justify-center gap-1 rounded-3xl border-4 border-oman-100 bg-white p-3">
                {Array.from({ length: g.count }, (_, i) => (
                  <span key={i} style={{ fontSize: 32 * size }}>
                    {g.emoji}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case 'pairs':
      return (
        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
          {Array.from({ length: v.count }, (_, i) => (
            <span key={i} style={{ fontSize: 40 * size, transform: `rotate(${((i * 41) % 24) - 12}deg)` }} className="inline-block">
              {v.emoji}
            </span>
          ))}
        </div>
      );
    case 'tenframe':
      return (
        <div className="flex justify-center">
          <TenFrameView {...v} size={compact ? 34 : 44} />
        </div>
      );
    case 'cubes':
      return <CubeTowersView towers={v.towers} size={compact ? 20 : 26} />;
    case 'numberline':
      return <NumberLineView from={v.from} to={v.to} jumps={v.jumps || []} mark={v.mark || []} height={compact ? 100 : 120} />;
    case 'track':
      return (
        <div className="flex flex-wrap justify-center" dir="rtl">
          {Array.from({ length: v.to - v.from + 1 }, (_, i) => v.from + i).map((n) => (
            <div key={n} className={`flex h-12 w-12 items-center justify-center border-2 border-oman-300 text-2xl font-black ${v.hide?.includes(n) ? 'bg-amber-100 text-amber-700' : 'bg-white text-oman-700'}`}>
              {v.hide?.includes(n) ? '؟' : toAr(n)}
            </div>
          ))}
        </div>
      );
    case 'hundred':
      return (
        <div className="flex justify-center overflow-x-auto">
          <HundredView from={v.from} to={v.to} highlight={v.highlight || []} hide={v.hide || []} cell={compact ? 24 : v.to > 30 ? 28 : 34} />
        </div>
      );
    case 'clock':
      return (
        <div className="flex justify-center">
          <ClockView hour={v.hour} size={compact ? 140 : 180} />
        </div>
      );
    case 'money':
      return <MoneyView notes={v.notes} />;
    case 'balance':
      return <BalanceView {...v} />;
    case 'shapes':
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {v.items.map((t, i) => (
            <Shape2D key={i} type={t} color={SHAPE_COLORS[t]} size={compact ? 54 : 70} />
          ))}
        </div>
      );
    case 'solids':
      return (
        <div className="flex flex-wrap justify-center gap-4">
          {v.items.map((t, i) => (
            <Solid key={i} type={t} size={compact ? 70 : 100} />
          ))}
        </div>
      );
    case 'pattern':
      return (
        <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
          {v.seq.map((s, i) => {
            const [type, color] = s.split(':');
            return <Shape2D key={i} type={type} color={color} fill={color} size={compact ? 42 : 54} />;
          })}
          <span className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-dashed border-amber-brand text-3xl font-black text-amber-brand">؟</span>
        </div>
      );
    case 'beads': {
      const len = v.length || 10;
      return (
        <div className="overflow-x-auto">
          <div className="mx-auto flex w-max items-center gap-0 px-2" dir="rtl">
            <div className="h-1 w-8 rounded bg-slate-500" />
            {Array.from({ length: len }, (_, i) => {
              const pos = i + 1;
              const shown = pos <= (v.show ?? len);
              const c = BEAD_COLORS[v.pattern[i % v.pattern.length]];
              const isMark = pos === v.mark;
              return (
                <div key={i} className="relative flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full border-2 ${isMark ? 'border-4 border-amber-brand' : 'border-slate-500'}`}
                    style={{ background: shown ? c.hex : '#f1f5f9', marginInline: -1 }}
                  >
                    {!shown && <span className="flex h-full items-center justify-center text-lg font-black text-slate-400">{isMark ? '؟' : ''}</span>}
                  </div>
                  <span className={`text-xs font-bold ${isMark ? 'text-amber-brand' : 'text-slate-400'}`}>{toAr(pos)}</span>
                </div>
              );
            })}
            <div className="h-1 w-8 rounded bg-slate-500" />
          </div>
          {v.mark && <p className="mt-1 text-center font-bold text-amber-700">الكرة {ordinal(v.mark) !== `رقم ${v.mark}` ? ordinal(v.mark) : `رقم ${toAr(v.mark)}`}</p>}
        </div>
      );
    }
    case 'hands':
      return (
        <div className="flex items-end justify-center gap-6">
          <Hand up={v.right} color="#16a34a" />
          <Hand up={v.left} color="#dc2626" />
        </div>
      );
    case 'containers':
      return (
        <div className="flex items-end justify-center gap-6">
          {v.items.map((c, i) => (
            <Container key={i} {...c} />
          ))}
        </div>
      );
    case 'lengths':
      return (
        <div className="mx-auto flex max-w-lg flex-col gap-3" dir="rtl">
          {v.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-left text-lg font-bold">{it.label}</span>
              <div className="h-7 rounded-full shadow" style={{ width: `${it.len * 30 * size}px`, background: it.color, borderInlineEnd: '10px solid #1f2937' }} />
            </div>
          ))}
        </div>
      );
    case 'measure':
      return (
        <div className="flex flex-col items-center" dir="rtl">
          <span style={{ fontSize: 90 * size, lineHeight: 1, transform: 'scaleX(1.4)' }}>{v.object}</span>
          <div className="mt-1 flex">
            {Array.from({ length: v.units }, (_, i) => (
              <div key={i} style={{ marginInline: -2 }}>
                <Cube color={i % 2 ? '#2563eb' : '#f59e0b'} size={30} />
              </div>
            ))}
          </div>
        </div>
      );
    case 'prices':
      return (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {v.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <span className="text-3xl font-black text-amber-brand">و</span>}
              <div className="flex flex-col items-center rounded-2xl bg-white p-2 shadow ring-2 ring-oman-100">
                <span className="text-5xl">{it.emoji}</span>
                <span className="font-bold">{it.label}</span>
                <span className="mt-1 rounded-full bg-amber-brand px-3 text-lg font-black text-white">{toAr(it.price)} ريال</span>
              </div>
            </div>
          ))}
        </div>
      );
    case 'puzzle':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-sky-300 text-5xl font-black text-sky-900 shadow" style={{ clipPath: 'polygon(0 0,100% 0,100% 35%,88% 35%,88% 65%,100% 65%,100% 100%,0 100%)' }}>
            {toAr(v.a)}
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-dashed border-amber-brand bg-amber-50 text-5xl font-black text-amber-brand">؟</div>
          <span className="mr-4 rounded-full bg-oman-700 px-4 py-2 text-3xl font-black text-white">= {toAr(v.total)}</span>
        </div>
      );
    case 'balloons':
      return (
        <div className="flex items-end justify-center gap-3">
          {v.values.map((n, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex h-20 w-16 items-center justify-center rounded-[50%] text-3xl font-black text-white shadow" style={{ background: ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e'][i % 4] }}>
                {toAr(n)}
              </div>
              <div className="h-10 w-0.5 bg-slate-400" />
            </div>
          ))}
        </div>
      );
    case 'shoes':
      return (
        <div className="mx-auto flex w-48 flex-col-reverse items-center">
          {v.sizes.map((s, i) => (
            <div key={i} className="flex h-14 w-44 items-center justify-between rounded-md border-2 border-green-900 px-3 text-2xl font-black shadow" style={{ background: i % 2 ? '#86efac' : '#f0fdf4', transform: `translateX(${((i * 13) % 20) - 10}px)` }}>
              <span>{toAr(s)}</span>
              <span>👟</span>
            </div>
          ))}
        </div>
      );
    case 'text':
      return <p className="text-center text-5xl font-black text-oman-700">{v.text}</p>;
    default:
      return null;
  }
}
