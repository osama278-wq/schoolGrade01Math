import { useState } from 'react';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords } from '../../utils/arabic.js';

const COLORS = ['#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2'];

export function Cube({ color = '#e11d48', size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
      <rect x="2" y="6" width="22" height="22" fill={color} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <path d="M2 6 L8 1 L30 1 L24 6Z" fill={color} opacity="0.7" stroke="rgba(0,0,0,.3)" />
      <path d="M24 6 L30 1 L30 23 L24 28Z" fill={color} opacity="0.55" stroke="rgba(0,0,0,.3)" />
      <circle cx="13" cy="17" r="3.5" fill="rgba(255,255,255,.35)" />
    </svg>
  );
}

/** عرض ثابت لأبراج المكعبات */
export function CubeTowersView({ towers = [], size = 24 }) {
  return (
    <div className="flex items-end justify-center gap-5">
      {towers.map((t, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="flex flex-col-reverse">
            {Array.from({ length: t.n }, (_, j) => (
              <div key={j} style={{ marginTop: -4 }}>
                <Cube color={t.color || COLORS[i % COLORS.length]} size={size} />
              </div>
            ))}
          </div>
          <span className="mt-1 text-xl font-black text-oman-700">{toAr(t.n)}</span>
        </div>
      ))}
    </div>
  );
}

/** عمود العشرة */
function TenRod({ size = 22 }) {
  return (
    <div className="flex flex-col-reverse rounded-md ring-2 ring-oman-600/40">
      {Array.from({ length: 10 }, (_, j) => (
        <div key={j} style={{ marginTop: -4 }}>
          <Cube color="#0f4c5c" size={size} />
        </div>
      ))}
    </div>
  );
}

/** المكعبات المتداخلة وأعمدة العشرات: بناء الأعداد + أبراج زوجية وفردية */
export default function LinkingCubes() {
  const [mode, setMode] = useState('build'); // build | towers | pairs
  const [tens, setTens] = useState(1);
  const [ones, setOnes] = useState(3);
  const [towers, setTowers] = useState([3, 4]);
  const [pairN, setPairN] = useState(7);

  const value = tens * 10 + ones;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <button className={mode === 'build' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('build')}>
          🧱 بناء الأعداد (عشرات وآحاد)
        </button>
        <button className={mode === 'towers' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('towers')}>
          🗼 أبراج وأزواج الأعداد
        </button>
        <button className={mode === 'pairs' ? 'btn-primary' : 'btn-ghost'} onClick={() => setMode('pairs')}>
          🧦 زوجي أم فردي؟
        </button>
      </div>

      {mode === 'build' && (
        <>
          <div className="flex min-h-[260px] items-end gap-3 rounded-3xl bg-white p-4 shadow-inner">
            {Array.from({ length: tens }, (_, i) => (
              <TenRod key={`t${i}`} />
            ))}
            <div className="flex flex-col-reverse">
              {Array.from({ length: ones }, (_, j) => (
                <div key={j} style={{ marginTop: -4 }} className="animate-pop">
                  <Cube color="#f59e0b" size={22} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black">
            <div className="flex items-center gap-2 rounded-2xl bg-oman-100 p-2">
              <button className="btn-primary h-12 w-12 !px-0" onClick={() => { setTens((t) => Math.max(0, t - 1)); sfx('tap'); }}>−</button>
              <span className="min-w-24 text-center">عشرات: {toAr(tens)}</span>
              <button className="btn-primary h-12 w-12 !px-0" onClick={() => { setTens((t) => Math.min(9, t + 1)); sfx('pop'); }}>+</button>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-100 p-2">
              <button className="btn-amber h-12 w-12 !px-0" onClick={() => { setOnes((o) => Math.max(0, o - 1)); sfx('tap'); }}>−</button>
              <span className="min-w-24 text-center">آحاد: {toAr(ones)}</span>
              <button className="btn-amber h-12 w-12 !px-0" onClick={() => {
                sfx('pop');
                if (ones === 9) {
                  setOnes(0);
                  setTens((t) => Math.min(9, t + 1));
                  speak('عشرة آحاد تصبح عموداً من العشرات');
                } else setOnes((o) => o + 1);
              }}>+</button>
            </div>
          </div>
          <button className="btn-ghost text-2xl" onClick={() => speak(`${numberToWords(tens * 10)} و ${numberToWords(ones)} يساوي ${numberToWords(value)}`)}>
            🔊 العدد = <span className="text-4xl text-oman-700">{toAr(value)}</span>
          </button>
        </>
      )}

      {mode === 'towers' && (
        <>
          <div className="flex min-h-[240px] items-end justify-center gap-8 rounded-3xl bg-white p-4 shadow-inner">
            {towers.map((n, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex flex-col-reverse">
                  {Array.from({ length: n }, (_, j) => (
                    <div key={j} style={{ marginTop: -4 }}>
                      <Cube color={COLORS[i]} size={28} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost h-12 w-12 !px-0" onClick={() => setTowers((t) => t.map((x, k) => (k === i ? Math.max(0, x - 1) : x)))}>−</button>
                  <button className="btn-ghost h-12 w-12 !px-0" onClick={() => { sfx('pop'); setTowers((t) => t.map((x, k) => (k === i ? Math.min(10, x + 1) : x))); }}>+</button>
                </div>
                <span className="text-2xl font-black">{toAr(n)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="btn-amber text-xl"
              onClick={() => {
                const total = towers.reduce((a, b) => a + b, 0);
                speak(`${towers.map(numberToWords).join(' و ')} زوجان مجموعهما ${numberToWords(total)}`);
              }}
            >
              🔊 {towers.map(toAr).join(' + ')} = {toAr(towers.reduce((a, b) => a + b, 0))}
            </button>
            {towers.length < 3 && <button className="btn-ghost" onClick={() => setTowers((t) => [...t, 1])}>➕ برج ثالث</button>}
            {towers.length > 2 && <button className="btn-ghost" onClick={() => setTowers((t) => t.slice(0, 2))}>➖ برجان فقط</button>}
          </div>
        </>
      )}

      {mode === 'pairs' && (
        <>
          <div className="flex min-h-[240px] items-end justify-center rounded-3xl bg-white p-4 shadow-inner">
            <div className="grid grid-cols-2 gap-x-1" style={{ direction: 'ltr' }}>
              {Array.from({ length: Math.ceil(pairN / 2) * 2 }, (_, j) => {
                const filled = j < pairN;
                const alone = pairN % 2 === 1 && j === pairN - 1;
                return (
                  <div key={j} style={{ marginTop: -4 }} className={alone ? 'animate-wiggle' : ''}>
                    {filled ? <Cube color={alone ? '#f59e0b' : '#2563eb'} size={30} /> : <div style={{ width: 30, height: 30 }} />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary h-12 w-12 !px-0" onClick={() => setPairN((n) => Math.max(1, n - 1))}>−</button>
            <span className="text-4xl font-black">{toAr(pairN)}</span>
            <button className="btn-primary h-12 w-12 !px-0" onClick={() => { sfx('pop'); setPairN((n) => Math.min(20, n + 1)); }}>+</button>
          </div>
          <button
            className={`btn text-2xl text-white ${pairN % 2 === 0 ? 'bg-green-600' : 'bg-amber-brand'}`}
            onClick={() => speak(`العدد ${numberToWords(pairN)} ${pairN % 2 === 0 ? 'زوجي، كل مكعب له زوج' : 'فردي، بقي مكعب وحده'}`)}
          >
            {pairN % 2 === 0 ? '✅ زوجي' : '☝️ فردي'}
          </button>
        </>
      )}
    </div>
  );
}
