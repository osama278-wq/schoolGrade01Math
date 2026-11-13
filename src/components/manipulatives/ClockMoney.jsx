import { useRef, useState } from 'react';
import { startDrag } from '../../utils/dragdrop.js';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, hourText, numberToWords, riyals } from '../../utils/arabic.js';

// ============================ الساعة ============================

/** وجه ساعة بعقربين؛ الدقائق عند ١٢ دائماً (الساعة الكاملة) */
export function ClockView({ hour = 3, size = 180, onHandDrag }) {
  const ref = useRef(null);
  const hAngle = (hour % 12) * 30;
  const handleDown = (e) => {
    if (!onHandDrag) return;
    e.preventDefault();
    const svg = ref.current;
    const move = (ev) => {
      const r = svg.getBoundingClientRect();
      const dx = ev.clientX - (r.left + r.width / 2);
      const dy = ev.clientY - (r.top + r.height / 2);
      let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      const h = Math.round(deg / 30) % 12 || 12;
      onHandDrag(h);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <svg ref={ref} viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={hourText(hour)} style={{ touchAction: 'none' }}>
      <circle cx="100" cy="100" r="94" fill="#fffbeb" stroke="#0f4c5c" strokeWidth="8" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const r1 = i % 5 === 0 ? 78 : 84;
        return <line key={i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + 88 * Math.sin(a)} y2={100 - 88 * Math.cos(a)} stroke="#334155" strokeWidth={i % 5 === 0 ? 3 : 1} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text key={n} x={100 + 64 * Math.sin(a)} y={100 - 64 * Math.cos(a) + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#082f39">
            {toAr(n)}
          </text>
        );
      })}
      {/* عقرب الدقائق عند ١٢ */}
      <line x1="100" y1="100" x2="100" y2="26" stroke="#0f4c5c" strokeWidth="5" strokeLinecap="round" />
      {/* عقرب الساعات */}
      <g transform={`rotate(${hAngle} 100 100)`} style={{ transition: 'transform .3s' }} onPointerDown={handleDown}>
        <line x1="100" y1="100" x2="100" y2="52" stroke="#d97706" strokeWidth="9" strokeLinecap="round" />
        {onHandDrag && <circle cx="100" cy="52" r="14" fill="#d97706" opacity="0.35" style={{ cursor: 'grab' }} />}
      </g>
      <circle cx="100" cy="100" r="7" fill="#082f39" />
    </svg>
  );
}

export function InteractiveClock({ initial = 9, target, onChange }) {
  const [hour, setHour] = useState(initial);
  const set = (h) => {
    const v = ((h - 1 + 12) % 12) + 1;
    if (v !== hour) sfx('tick');
    setHour(v);
    onChange?.(v);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <ClockView hour={hour} size={230} onHandDrag={set} />
      <div className="flex items-center gap-2">
        <button className="btn-primary h-14 w-14 text-2xl !px-0" onClick={() => set(hour - 1)} aria-label="ساعة للخلف">↺</button>
        <button className="btn-amber text-xl" onClick={() => speak(hourText(hour))}>🔊 {hourText(hour)}</button>
        <button className="btn-primary h-14 w-14 text-2xl !px-0" onClick={() => set(hour + 1)} aria-label="ساعة للأمام">↻</button>
      </div>
      {target && (
        <p className={`chip !text-lg ${hour === target ? '!bg-green-100 !text-green-800' : ''}`}>{hour === target ? '✅ أحسنت! ضبطت الساعة' : `اضبط الساعة على ${hourText(target)}`}</p>
      )}
    </div>
  );
}

// ============================ النقود العمانية ============================

export const NOTE_STYLE = {
  1: { bg: 'linear-gradient(135deg,#a7f3d0,#34d399)', border: '#047857', label: 'ريال' },
  5: { bg: 'linear-gradient(135deg,#fbcfe8,#f472b6)', border: '#9d174d', label: '٥ ريالات' },
  10: { bg: 'linear-gradient(135deg,#fed7aa,#fb923c)', border: '#9a3412', label: '١٠ ريالات' }
};

/** ورقة نقدية تعليمية مبسّطة (ليست صورة للعملة الحقيقية) */
export function Note({ value = 1, small = false }) {
  const s = NOTE_STYLE[value];
  const w = small ? 74 : 104;
  const h = small ? 40 : 54;
  return (
    <div
      className="relative flex shrink-0 items-center justify-between overflow-hidden rounded-lg px-2 font-black shadow"
      style={{ width: w, height: h, background: s.bg, border: `3px solid ${s.border}`, color: s.border }}
      aria-label={s.label}
    >
      <span style={{ fontSize: small ? 18 : 24 }}>{toAr(value)}</span>
      {/* رمز قلعة مبسّط */}
      <svg viewBox="0 0 40 30" width={small ? 22 : 30} aria-hidden="true">
        <path d="M4 28 V12 h4 v-4 h4 v4 h4 V6 h8 v6 h4 v-4 h4 v4 h4 v16Z" fill={s.border} opacity="0.55" />
      </svg>
      <span className="absolute bottom-0 left-1 text-[9px] font-bold opacity-80">نموذج تعليمي</span>
    </div>
  );
}

export function MoneyView({ notes = [] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {notes.map((v, i) => (
        <Note key={i} value={v} />
      ))}
    </div>
  );
}

const SHOP = [
  { emoji: '🦒', name: 'زرافة', price: 16 },
  { emoji: '⚽', name: 'كرة', price: 5 },
  { emoji: '🧸', name: 'دبدوب', price: 12 },
  { emoji: '🪁', name: 'طائرة ورقية', price: 7 },
  { emoji: '🚲', name: 'دراجة', price: 27 }
];

/** محفظة النقود العمانية: اسحب الأوراق إلى الصينية واحسب المجموع، ثم اشترِ لعبة */
export function MoneyWallet() {
  const [tray, setTray] = useState([]);
  const [item, setItem] = useState(SHOP[0]);
  const total = tray.reduce((a, b) => a + b.v, 0);

  const add = (v) => {
    setTray((t) => (t.length >= 12 ? t : [...t, { v, k: Math.random() }]));
    sfx('pop');
  };

  const check = () => {
    if (total === item.price) {
      sfx('celebrate');
      speak(`أحسنت! دفعت ${numberToWords(total)} ريالاً ثمن ال${item.name}`);
    } else if (total > item.price) {
      speak(`دفعت أكثر من الثمن. المبلغ ${numberToWords(total)} والثمن ${numberToWords(item.price)}`);
    } else {
      speak(`ما زال ينقصك ${numberToWords(item.price - total)}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {SHOP.map((s) => (
          <button key={s.name} onClick={() => { setItem(s); speak(`${s.name} ثمنها ${numberToWords(s.price)} ريالاً`); }} className={`flex flex-col items-center rounded-2xl bg-white px-3 py-2 shadow ring-4 ${item.name === s.name ? 'ring-amber-brand' : 'ring-oman-100'}`}>
            <span className="text-4xl">{s.emoji}</span>
            <span className="text-sm font-bold">{s.name}</span>
            <span className="chip !py-0">{riyals(s.price)}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {[1, 5, 10].map((v) => (
          <button key={v} type="button" onPointerDown={(e) => startDrag(e, { payload: v, ghost: `<div style="padding:6px 12px;border-radius:8px;background:${v === 1 ? '#34d399' : v === 5 ? '#f472b6' : '#fb923c'};font-weight:900;font-size:24px;color:#111">${toAr(v)}</div>`, onDrop: (z, p) => z === 'tray' && add(p), onTap: add })} aria-label={`أضف ${NOTE_STYLE[v].label}`}>
            <Note value={v} />
          </button>
        ))}
      </div>
      <div data-drop="tray" className="flex min-h-28 w-full max-w-xl flex-wrap items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-amber-brand bg-amber-50 p-3">
        {tray.length === 0 && <span className="font-bold text-amber-800">اسحب الأوراق النقدية إلى هنا</span>}
        {tray.map((n) => (
          <button key={n.k} onClick={() => setTray((t) => t.filter((x) => x.k !== n.k))} aria-label="إزالة">
            <Note value={n.v} small />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="chip !text-2xl">المجموع: {toAr(total)} ريال</span>
        <button className="btn-amber text-lg" onClick={check}>🛒 اشترِ ال{item.name} ({toAr(item.price)})</button>
        <button className="btn-ghost" onClick={() => setTray([])}>↺ أفرغ</button>
      </div>
    </div>
  );
}

/** أداة المختبر السادسة: الوقت + النقود العمانية */
export default function ClockMoney() {
  const [tab, setTab] = useState('clock');
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <button className={tab === 'clock' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('clock')}>🕘 ساعة العقارب</button>
        <button className={tab === 'money' ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab('money')}>💵 النقود العمانية</button>
      </div>
      {tab === 'clock' ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-bold text-oman-600">اسحب العقرب القصير (البرتقالي) أو استخدم الأسهم. العقرب الطويل عند ١٢ دائماً في الساعة الكاملة.</p>
          <InteractiveClock initial={9} />
        </div>
      ) : (
        <MoneyWallet />
      )}
    </div>
  );
}
