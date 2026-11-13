import { useEffect, useState } from 'react';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

/** عدد بالأرقام العربية المشرقية */
export function Num({ n, className = '' }) {
  return <span className={className}>{toAr(n)}</span>;
}

/** زر السماعة البارز: ينطق التعليمة (ويمكن تشغيله تلقائياً عند فتح الشاشة) */
export function SpeakButton({ text, auto = false, size = 'lg', className = '', label = 'استمع' }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!auto || !text) return;
    const t = setTimeout(() => speak(text), 350);
    return () => clearTimeout(t);
  }, [auto, text]);
  const dims = size === 'lg' ? 'h-16 w-16 text-3xl' : size === 'md' ? 'h-12 w-12 text-2xl' : 'h-12 w-12 text-xl';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={async () => {
        setBusy(true);
        await speak(text);
        setBusy(false);
      }}
      className={`${dims} shrink-0 rounded-full bg-amber-brand text-white shadow-lg ring-4 ring-amber-200 transition active:scale-90 ${busy ? 'animate-pulse' : ''} ${className}`}
    >
      🔊
    </button>
  );
}

export function Stars({ n = 0, max = 3, size = 'text-2xl' }) {
  return (
    <span className={`${size} leading-none`} aria-label={`${n} من ${max} نجوم`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

/** وجه التغذية الراجعة المرئية (وثيقة التقويم: تغذية راجعة مرئية بوجوه مبتسمة) */
export function FeedbackFace({ kind }) {
  if (!kind) return null;
  const good = kind === 'good';
  return (
    <div className={`flex items-center gap-3 rounded-3xl px-5 py-3 text-xl font-extrabold ${good ? 'animate-pop bg-green-100 text-green-800' : 'animate-wiggle bg-amber-100 text-amber-900'}`}>
      <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill={good ? '#facc15' : '#fde68a'} stroke="#ca8a04" strokeWidth="2" />
        <circle cx="22" cy="26" r="4" fill="#422006" />
        <circle cx="42" cy="26" r="4" fill="#422006" />
        {good ? (
          <path d="M18 38 Q32 54 46 38" stroke="#422006" strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M22 44 Q32 38 42 44" stroke="#422006" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

export function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  const colors = ['#d97706', '#0f4c5c', '#22c55e', '#e11d48', '#facc15', '#38bdf8'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute block h-3 w-2 rounded-sm"
          style={{
            left: `${(i * 97) % 100}%`,
            top: '-10px',
            background: colors[i % colors.length],
            animation: `confetti-fall ${1.8 + (i % 5) * 0.3}s ${(i % 7) * 0.08}s ease-in forwards`
          }}
        />
      ))}
      <style>{`@keyframes confetti-fall{to{transform:translateY(105vh) rotate(720deg);opacity:.6}}`}</style>
    </div>
  );
}

/** لوحة أرقام عربية كبيرة لإدخال الطفل */
export function NumberPad({ value, onChange, onSubmit, maxLen = 3, disabled }) {
  const press = (d) => {
    if (disabled) return;
    sfx('tap');
    if (String(value).length >= maxLen) return;
    onChange(String(value) + d);
  };
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div className="mx-auto w-full max-w-xs no-select">
      <div className="mb-3 flex h-20 items-center justify-center rounded-3xl border-4 border-dashed border-oman-300 bg-white text-5xl font-black text-oman-700">
        {value === '' ? <span className="text-oman-100">؟</span> : toAr(value)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button key={k} type="button" disabled={disabled} onClick={() => press(k)} className="btn h-16 bg-oman-100 text-3xl text-oman-800 hover:bg-oman-300">
            {toAr(k)}
          </button>
        ))}
        <button type="button" disabled={disabled} onClick={() => onChange(String(value).slice(0, -1))} className="btn h-16 bg-rose-100 text-2xl text-rose-700" aria-label="مسح">
          ⌫
        </button>
        <button type="button" disabled={disabled} onClick={() => press(0)} className="btn h-16 bg-oman-100 text-3xl text-oman-800">
          {toAr(0)}
        </button>
        <button type="button" disabled={disabled || value === ''} onClick={onSubmit} className="btn h-16 bg-green-600 text-2xl text-white" aria-label="تحقق">
          ✔
        </button>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-3 no-print" onClick={onClose}>
      <div className={`card max-h-[92vh] w-full overflow-auto ${wide ? 'max-w-4xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-xl font-extrabold text-oman-700">{title}</h3>
          <button className="btn-ghost h-12 w-12 !px-0" onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, color = 'bg-amber-brand' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-oman-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SectionTitle({ children, icon, action }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-oman-700">
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  );
}
