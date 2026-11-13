import { useState } from 'react';
import { startDrag } from '../../utils/dragdrop.js';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

export const WEIGHT_ITEMS = [
  { id: 'feather', emoji: '🪶', name: 'ريشة', w: 1 },
  { id: 'balloon', emoji: '🎈', name: 'بالون', w: 1 },
  { id: 'cube', emoji: '🧊', name: 'مكعب', w: 2 },
  { id: 'apple', emoji: '🍎', name: 'تفاحة', w: 3 },
  { id: 'dates', emoji: '🌴', name: 'علبة تمر', w: 4 },
  { id: 'bottle', emoji: '🧴', name: 'زجاجة ماء', w: 5 },
  { id: 'teddy', emoji: '🧸', name: 'دبدوب', w: 5 },
  { id: 'book', emoji: '📕', name: 'كتاب', w: 6 },
  { id: 'melon', emoji: '🍉', name: 'بطيخة', w: 9 }
];

/** رسم الميزان ذي الكفتين: angle موجب = الكفة اليمنى أثقل (تنزل) */
function ScaleSVG({ angle = 0, leftContent, rightContent, width = 420, dropZones = false }) {
  const cx = 210;
  const cy = 70;
  const arm = 150;
  const rad = (angle * Math.PI) / 180;
  // اليمين في الرسم = اليمين الفعلي للشاشة
  const rx = cx + arm * Math.cos(rad);
  const ry = cy + arm * Math.sin(rad);
  const lx = cx - arm * Math.cos(rad);
  const ly = cy - arm * Math.sin(rad);
  const pan = (px, py, content, zone) => (
    <g>
      <line x1={px} y1={py} x2={px - 50} y2={py + 70} stroke="#64748b" strokeWidth="2" />
      <line x1={px} y1={py} x2={px + 50} y2={py + 70} stroke="#64748b" strokeWidth="2" />
      <path d={`M${px - 62} ${py + 70} Q${px} ${py + 100} ${px + 62} ${py + 70}Z`} fill="#c084fc" stroke="#7e22ce" strokeWidth="3" />
      <foreignObject x={px - 62} y={py + 18} width="124" height="56">
        <div
          {...(dropZones ? { 'data-drop': zone } : {})}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', height: '56px', fontSize: '26px', lineHeight: 1, borderRadius: 12 }}
        >
          {content}
        </div>
      </foreignObject>
    </g>
  );
  return (
    <svg viewBox="0 0 420 270" width="100%" style={{ maxWidth: width }} role="img" aria-label="ميزان ذو كفتين">
      <path d="M150 262 L270 262 L240 244 L180 244Z" fill="#a855f7" />
      <rect x="204" y="70" width="12" height="176" rx="6" fill="#9333ea" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#7e22ce" strokeWidth="10" strokeLinecap="round" style={{ transition: 'all .6s' }} />
      <circle cx={cx} cy={cy} r="12" fill="#facc15" stroke="#a16207" strokeWidth="3" />
      {pan(lx, ly, leftContent, 'pan-left')}
      {pan(rx, ry, rightContent, 'pan-right')}
    </svg>
  );
}

/** عرض ثابت للأسئلة */
export function BalanceView({ left = '🍎', right = '🪶', heavier = 'left', leftCount = 1, rightCount = 1 }) {
  const angle = heavier === 'left' ? -14 : heavier === 'right' ? 14 : 0;
  const rep = (e, n) => Array.from({ length: n }, (_, i) => <span key={i}>{e}</span>);
  return (
    <div className="mx-auto w-full max-w-sm">
      <ScaleSVG angle={angle} leftContent={rep(left, leftCount)} rightContent={rep(right, rightCount)} />
    </div>
  );
}

/** الميزان ذو الكفتين التفاعلي: محاكاة ميلان الكفتين بالأوزان الافتراضية */
export default function BalanceScale({ items = WEIGHT_ITEMS }) {
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [selected, setSelected] = useState(null);

  const wl = left.reduce((a, it) => a + it.w, 0);
  const wr = right.reduce((a, it) => a + it.w, 0);
  // التلميذ يرى اليمين يميناً: الكفة اليمنى في الرسم هي «pan-right»
  const angle = Math.max(-18, Math.min(18, (wr - wl) * 3));

  const add = (side, item) => {
    if (!item) return;
    const setter = side === 'pan-left' ? setLeft : setRight;
    setter((arr) => (arr.length >= 6 ? arr : [...arr, { ...item, key: `${item.id}-${Date.now()}-${Math.random()}` }]));
    setTimeout(() => sfx('tick'), 300);
  };

  const removeFrom = (side, key) => {
    const setter = side === 'left' ? setLeft : setRight;
    setter((arr) => arr.filter((x) => x.key !== key));
  };

  const verdict = () => {
    if (!left.length || !right.length) return 'ضع أشياء في الكفتين';
    if (wl === wr) return 'الميزان متوازن: الكفتان متساويتان';
    const heavySide = wl > wr ? left : right;
    const lightSide = wl > wr ? right : left;
    return `${heavySide.map((x) => x.name).join(' و')} أثقل من ${lightSide.map((x) => x.name).join(' و')}`;
  };

  const pick = (side) => {
    if (selected) {
      sfx('pop');
      add(side, selected);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center font-bold text-oman-600">اسحب شيئاً إلى إحدى الكفتين (أو المسه ثم المس الكفة). المس الشيء داخل الكفة لإزالته.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onPointerDown={(e) => startDrag(e, { payload: it, ghost: it.emoji, onDrop: (zone, p) => add(zone, p), onTap: (p) => { setSelected(p); sfx('tap'); speak(p.name); } })}
            className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white text-3xl shadow ring-4 ${selected?.id === it.id ? 'ring-amber-brand' : 'ring-oman-100'}`}
            aria-label={it.name}
          >
            {it.emoji}
            <span className="text-[11px] font-bold text-oman-700">{it.name}</span>
          </button>
        ))}
      </div>
      <div className="relative w-full max-w-lg">
        <ScaleSVG
          angle={angle}
          dropZones
          leftContent={left.map((it) => (
            <span key={it.key} role="button" onClick={() => removeFrom('left', it.key)} style={{ cursor: 'pointer' }}>
              {it.emoji}
            </span>
          ))}
          rightContent={right.map((it) => (
            <span key={it.key} role="button" onClick={() => removeFrom('right', it.key)} style={{ cursor: 'pointer' }}>
              {it.emoji}
            </span>
          ))}
          width={520}
        />
        {selected && (
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-2">
            <button className="btn-amber" onClick={() => pick('pan-left')}>⬇ ضع في الكفة اليسرى</button>
            <button className="btn-amber" onClick={() => pick('pan-right')}>ضع في الكفة اليمنى ⬇</button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="btn-primary text-lg" onClick={() => speak(verdict())}>🔊 {verdict()}</button>
        <button className="btn-ghost" onClick={() => { setLeft([]); setRight([]); setSelected(null); }}>↺ أفرغ الكفتين</button>
      </div>
      <p className="text-sm text-oman-600">الأوزان افتراضية لأغراض التعلم: {toAr(left.length)} في اليسرى، {toAr(right.length)} في اليمنى.</p>
    </div>
  );
}
