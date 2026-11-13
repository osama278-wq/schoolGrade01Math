// ساحات الاستكشاف الحسي للمحطات العددية (١، ٢، ٤، ٥، ٧، ١١، ١٢، ١٣، ١٤)
import { useMemo, useState } from 'react';
import TenFrame from '../manipulatives/TenFrame.jsx';
import HundredBoard from '../manipulatives/HundredBoard.jsx';
import NumberLine from '../manipulatives/NumberLine.jsx';
import { MoneyWallet } from '../manipulatives/ClockMoney.jsx';
import { startDrag } from '../../utils/dragdrop.js';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords, ordinal } from '../../utils/arabic.js';
import { rand, shuffle } from '../../utils/random.js';
import { BEAD_COLORS } from '../lesson/Visual.jsx';

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      {tabs.map(([k, label]) => (
        <button key={k} className={value === k ? 'btn-primary' : 'btn-ghost'} onClick={() => { sfx('tap'); onChange(k); }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- ١: العدّ
const BOOK_SETS = [
  { n: 1, e: '🍌', name: 'موزة' },
  { n: 2, e: '🐘', name: 'فيلان' },
  { n: 3, e: '🥚', name: 'بيضات' },
  { n: 4, e: '🐈', name: 'قطط' },
  { n: 5, e: '🥁', name: 'طبول' },
  { n: 6, e: '👒', name: 'قبعات' },
  { n: 7, e: '🦋', name: 'فراشات' },
  { n: 8, e: '👟', name: 'أحذية' },
  { n: 9, e: '🚗', name: 'ألعاب' },
  { n: 10, e: '⚽', name: 'كرات' }
];

export function CountingExplorer() {
  const [tab, setTab] = useState('track');
  const [set, setSet] = useState(BOOK_SETS[4]);
  const [tapped, setTapped] = useState([]);
  const [shown, setShown] = useState(null);
  const [matches, setMatches] = useState({});
  const matchSets = useMemo(() => shuffle(BOOK_SETS.filter((s) => [3, 5, 7].includes(s.n))), []);
  const matchCards = useMemo(() => shuffle([3, 5, 7]), []);

  const tapObj = (i) => {
    if (tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    sfx('pop');
    if (next.length === set.n) {
      speak(`${numberToWords(next.length)}. عدد ال${set.name} ${numberToWords(set.n)}`);
      sfx('success');
    } else speak(numberToWords(next.length));
  };

  return (
    <div>
      <Tabs tabs={[['track', 'شريط الأعداد'], ['count', 'عُدّ بالنقر'], ['match', 'صِل العدد بالمجموعة']]} value={tab} onChange={setTab} />
      {tab === 'track' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center" dir="rtl">
            {BOOK_SETS.map((s) => (
              <button key={s.n} onClick={() => { setShown(s); sfx('tap'); speak(numberToWords(s.n)); }} className={`h-16 w-16 border-2 border-oman-300 text-3xl font-black sm:h-20 sm:w-20 ${shown?.n === s.n ? 'bg-amber-brand text-white' : 'bg-white text-oman-700'}`}>
                {toAr(s.n)}
              </button>
            ))}
          </div>
          {shown && (
            <div className="card flex max-w-md animate-pop flex-wrap justify-center gap-2 text-5xl">
              {Array.from({ length: shown.n }, (_, i) => (
                <span key={i}>{shown.e}</span>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'count' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {BOOK_SETS.map((s) => (
              <button key={s.n} onClick={() => { setSet(s); setTapped([]); }} className={`h-14 w-14 rounded-2xl text-3xl ${set.n === s.n ? 'bg-amber-100 ring-4 ring-amber-brand' : 'bg-white'}`} aria-label={s.name}>
                {s.e}
              </button>
            ))}
          </div>
          <p className="font-bold text-oman-600">المس كل شيء مرة واحدة وأنا أعدّ معك</p>
          <div className="card flex min-h-40 max-w-xl flex-wrap justify-center gap-4">
            {Array.from({ length: set.n }, (_, i) => (
              <button key={i} onClick={() => tapObj(i)} className={`relative text-6xl transition ${tapped.includes(i) ? 'scale-90 opacity-60' : 'hover:scale-110'}`}>
                {set.e}
                {tapped.includes(i) && <span className="absolute -top-2 right-0 rounded-full bg-oman-700 px-2 text-lg font-black text-white">{toAr(tapped.indexOf(i) + 1)}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="chip !text-2xl">{toAr(tapped.length)}</span>
            <button className="btn-ghost" onClick={() => setTapped([])}>↺ عُدّ من جديد</button>
          </div>
        </div>
      )}
      {tab === 'match' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">اسحب بطاقة العدد إلى المجموعة المناسبة</p>
          <div className="flex flex-wrap justify-center gap-3">
            {matchCards.filter((n) => !Object.values(matches).includes(n)).map((n) => (
              <button key={n} onPointerDown={(e) => startDrag(e, { payload: n, ghost: `<div style="background:#0f4c5c;color:#fff;border-radius:16px;padding:8px 18px;font-weight:900">${toAr(n)}</div>`, onDrop: (zone, p) => {
                const target = Number(zone.replace('set-', ''));
                if (target === p) { setMatches((m) => ({ ...m, [zone]: p })); sfx('success'); speak(`أحسنت، ${numberToWords(p)}`); }
                else { sfx('error'); speak('عُدّ مرة أخرى'); }
              } })} className="btn-primary h-20 w-20 text-4xl">
                {toAr(n)}
              </button>
            ))}
          </div>
          <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            {matchSets.map((s) => (
              <div key={s.n} data-drop={`set-${s.n}`} className={`card flex min-h-36 flex-col items-center justify-between gap-2 ${matches[`set-${s.n}`] ? 'ring-4 ring-green-500' : ''}`}>
                <div className="flex flex-wrap justify-center gap-1 text-4xl">{Array.from({ length: s.n }, (_, i) => <span key={i}>{s.e}</span>)}</div>
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-dashed border-oman-300 text-3xl font-black text-green-700">{matches[`set-${s.n}`] ? toAr(s.n) : ''}</span>
              </div>
            ))}
          </div>
          {Object.keys(matches).length === 3 && <button className="btn-ghost" onClick={() => setMatches({})}>↺ مرة أخرى</button>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٢: إطار العشرة
export function TenFrameExplorer() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center font-bold text-oman-600">كوّن العدد ١٠ بلونين أو بثلاثة ألوان، ثم جرّب «الأخذ من عشرة» و«أوجد الضعف».</p>
      <TenFrame frames={1} colors={['red', 'yellow', 'blue']} />
    </div>
  );
}

// ---------------------------------------------------------------- ٤: أزواج الأعداد
function TapHand({ up, setUp, color }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 110 130" width="150" height="176" className="no-select">
        <rect x="18" y="62" width="74" height="58" rx="22" fill="#fcd9b6" stroke="#b45309" strokeWidth="2.5" />
        <rect x="18" y="104" width="74" height="16" rx="6" fill={color} />
        {[0, 1, 2, 3, 4].map((i) => {
          const raised = i < up;
          const h = raised ? 46 : 16;
          return (
            <rect key={i} x={22 + i * 15} y={66 - h} width="12" height={h + 8} rx="6" fill={raised ? '#fcd9b6' : '#e7c3a0'} stroke="#b45309" strokeWidth="2" style={{ cursor: 'pointer' }} onClick={() => { sfx('tap'); setUp(raised && up === i + 1 ? i : i + 1); }} />
          );
        })}
      </svg>
      <div className="flex items-center gap-2">
        <button className="btn-ghost h-12 w-12 !px-0" onClick={() => setUp(Math.max(0, up - 1))}>−</button>
        <span className="text-3xl font-black">{toAr(up)}</span>
        <button className="btn-ghost h-12 w-12 !px-0" onClick={() => setUp(Math.min(5, up + 1))}>+</button>
      </div>
    </div>
  );
}

export function PairsExplorer() {
  const [tab, setTab] = useState('hands');
  const [target, setTarget] = useState(7);
  const [r, setR] = useState(4);
  const [l, setL] = useState(3);
  const [found, setFound] = useState([]);
  const [slots, setSlots] = useState({});
  const cards = useMemo(() => shuffle([11, 12, 13, 14, 15, 16, 17, 18, 19]), []);

  const sum = r + l;
  const check = () => {
    speak(`${numberToWords(r)} و ${numberToWords(l)} زوجان مجموعهما ${numberToWords(sum)}`);
    if (sum === target) {
      const key = [r, l].sort().join('+');
      if (!found.includes(key)) {
        setFound((f) => [...f, key]);
        sfx('star');
      }
    }
  };

  return (
    <div>
      <Tabs tabs={[['hands', 'أصابع اليدين'], ['teens', 'الأعداد ١٠–٢٠']]} value={tab} onChange={setTab} />
      {tab === 'hands' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-bold">اكتشف أزواج العدد:</span>
            {[6, 7, 8, 9, 10].map((t) => (
              <button key={t} className={target === t ? 'btn-amber' : 'btn-ghost'} onClick={() => { setTarget(t); setFound([]); speak(`هيا نكتشف أزواج العدد ${numberToWords(t)}`); }}>
                {toAr(t)}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-6">
            <TapHand up={r} setUp={setR} color="#16a34a" />
            <span className="mb-20 text-4xl font-black text-amber-brand">+</span>
            <TapHand up={l} setUp={setL} color="#dc2626" />
          </div>
          <button className={`btn text-3xl text-white ${sum === target ? 'bg-green-600' : 'bg-oman-700'}`} onClick={check}>
            🔊 {toAr(r)} + {toAr(l)} = {toAr(sum)} {sum === target ? '✅' : ''}
          </button>
          <div className="card w-full max-w-md text-center">
            <p className="font-bold">أزواج العدد {toAr(target)} التي اكتشفتها:</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {found.length === 0 && <span className="text-oman-300">لا شيء بعد</span>}
              {found.map((k) => (
                <span key={k} className="chip !text-xl">{k.split('+').map(toAr).join(' + ')}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">اسحب بطاقة العدد إلى مكانها الصحيح في الشريط (أعداد أكثر من عشرة بقليل)</p>
          <div className="flex flex-wrap justify-center" dir="rtl">
            {Array.from({ length: 11 }, (_, i) => 10 + i).map((n) => (
              <div key={n} data-drop={`teen-${n}`} className={`flex h-16 w-14 items-center justify-center border-2 border-oman-300 text-2xl font-black ${n === 10 || n === 20 || slots[n] ? 'bg-white text-oman-700' : 'bg-amber-50'}`}>
                {n === 10 || n === 20 || slots[n] ? toAr(n) : ''}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {cards.filter((n) => !slots[n]).map((n) => (
              <button key={n} onPointerDown={(e) => startDrag(e, { payload: n, ghost: `<div style="background:#d97706;color:#fff;border-radius:14px;padding:8px 14px;font-weight:900">${toAr(n)}</div>`, onDrop: (zone, p) => {
                if (zone === `teen-${p}`) { setSlots((s) => ({ ...s, [p]: true })); sfx('success'); speak(`${numberToWords(p)}: عشرة و ${numberToWords(p - 10)}`); }
                else { sfx('error'); }
              } })} className="btn-amber h-16 w-16 text-3xl">
                {toAr(n)}
              </button>
            ))}
          </div>
          {Object.keys(slots).length === 9 && (
            <div className="flex gap-2">
              <span className="chip !bg-green-100 !text-xl !text-green-800">رائع! رتّبت الأعداد كلها 🎉</span>
              <button className="btn-ghost" onClick={() => setSlots({})}>↺</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٥: التقدير والعدّ
export function EstimateExplorer() {
  const [tab, setTab] = useState('jar');
  const [n, setN] = useState(() => rand(9, 28));
  const [guess, setGuess] = useState(null);
  const [poured, setPoured] = useState(0);
  const [one, setOne] = useState(3);

  const pour = () => {
    setPoured(0);
    let k = 0;
    const t = setInterval(() => {
      k++;
      setPoured(k);
      sfx('tick');
      if (k >= n) {
        clearInterval(t);
        const close = Math.abs(guess - n) <= 3;
        speak(`عددها ${numberToWords(n)}. ${close ? 'تخمينك قريب جداً، أحسنت!' : 'جرّب أن تخمّن مرة أخرى'}`);
        if (close) sfx('success');
      }
    }, 140);
  };

  return (
    <div>
      <Tabs tabs={[['jar', 'خمّن ثم عُدّ'], ['double', 'ضعف العدد']]} value={tab} onChange={setTab} />
      {tab === 'jar' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-56 w-48 flex-wrap content-end items-end justify-center gap-0.5 overflow-hidden rounded-b-[40px] rounded-t-xl border-8 border-sky-200 bg-sky-50/60 p-2">
            {Array.from({ length: n - poured }, (_, i) => (
              <span key={i} className="h-5 w-5 rounded-sm" style={{ background: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'][i % 5] }} />
            ))}
          </div>
          <p className="text-xl font-bold">خمّن: كم مكعباً في الوعاء؟</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[5, 10, 15, 20, 25, 30].map((g) => (
              <button key={g} className={guess === g ? 'btn-amber' : 'btn-ghost'} onClick={() => { setGuess(g); speak(`تخمينك ${numberToWords(g)}`); }}>
                نحو {toAr(g)}
              </button>
            ))}
          </div>
          <button className="btn-primary text-xl" disabled={!guess} onClick={pour}>🫗 صُبّ المكعبات وعُدّها</button>
          <div className="grid grid-cols-10 gap-1" dir="rtl">
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className={`flex h-9 w-9 items-center justify-center rounded border text-sm font-black ${i < poured ? 'bg-amber-brand text-white' : 'bg-white text-oman-700'}`}>
                {toAr(i + 1)}
              </div>
            ))}
          </div>
          {poured === n && (
            <div className="flex gap-2">
              <span className="chip !text-xl">تخمينك {toAr(guess)} – العدد {toAr(n)}</span>
              <button className="btn-ghost" onClick={() => { setN(rand(9, 28)); setGuess(null); setPoured(0); }}>وعاء جديد</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">في يد واحدة {toAr(one)} قطع. كم القطع في اليدين معاً؟</p>
          <div className="flex items-center gap-6">
            {[0, 1].map((h) => (
              <div key={h} className="flex h-40 w-40 flex-wrap content-center items-center justify-center gap-1 rounded-[50%] bg-[#fcd9b6] p-4 shadow-inner">
                {Array.from({ length: one }, (_, i) => (
                  <span key={i} className="h-6 w-6 rounded-md" style={{ background: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'][i % 5] }} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary h-12 w-12 !px-0" onClick={() => setOne((o) => Math.max(1, o - 1))}>−</button>
            <span className="text-3xl font-black">{toAr(one)}</span>
            <button className="btn-primary h-12 w-12 !px-0" onClick={() => setOne((o) => Math.min(10, o + 1))}>+</button>
          </div>
          <button className="btn-amber text-2xl" onClick={() => { sfx('success'); speak(`ضعف ${numberToWords(one)} هو ${numberToWords(one * 2)}`); }}>
            🔊 ضعف {toAr(one)} = {toAr(one * 2)}
          </button>
          <p className="chip">شبه الضعف: {toAr(one)} + {toAr(one + 1)} = {toAr(one * 2 + 1)}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٧: بازل أزواج ٧ + لوحة المائة
export function Puzzle7Explorer() {
  const [tab, setTab] = useState('puzzle');
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState([]);
  const lefts = [0, 1, 2, 3, 4, 5, 6, 7];
  const rights = useMemo(() => shuffle([0, 1, 2, 3, 4, 5, 6, 7]), []);

  const pickRight = (b) => {
    if (sel === null) return speak('اختر قطعة من الجهة الأولى');
    if (sel + b === 7) {
      setDone((d) => [...d, sel]);
      sfx('success');
      speak(`${numberToWords(sel)} و ${numberToWords(b)} تركيبة من أزواج العدد سبعة`);
    } else {
      sfx('error');
      speak(`${numberToWords(sel)} زائد ${numberToWords(b)} يساوي ${numberToWords(sel + b)}، ليس سبعة`);
    }
    setSel(null);
  };

  return (
    <div>
      <Tabs tabs={[['puzzle', 'بازل أزواج العدد ٧'], ['hundred', 'لوحة المائة']]} value={tab} onChange={setTab} />
      {tab === 'puzzle' ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">اختر قطعة من الصف الأول ثم القطعة التي تكمّلها لتكوين ٧</p>
          <div className="flex flex-wrap justify-center gap-2">
            {lefts.map((a) => (
              <button key={a} disabled={done.includes(a)} onClick={() => { setSel(a); sfx('tap'); }} className={`h-16 w-16 rounded-2xl text-3xl font-black shadow ${done.includes(a) ? 'bg-green-200 text-green-800' : sel === a ? 'bg-amber-brand text-white' : 'bg-sky-300 text-sky-900'}`}>
                {toAr(a)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {rights.map((b) => (
              <button key={b} disabled={done.includes(7 - b)} onClick={() => pickRight(b)} className={`h-16 w-16 rounded-2xl text-3xl font-black shadow ${done.includes(7 - b) ? 'bg-green-200 text-green-800' : 'bg-yellow-300 text-yellow-900'}`}>
                {toAr(b)}
              </button>
            ))}
          </div>
          <div className="card flex flex-wrap justify-center gap-2">
            {done.length === 0 && <span className="text-oman-300">التركيبات المكتشفة تظهر هنا</span>}
            {[...done].sort().map((a) => (
              <span key={a} className="chip !text-xl">{toAr(a)} + {toAr(7 - a)} = ٧</span>
            ))}
          </div>
          {done.length === 8 && <button className="btn-ghost" onClick={() => setDone([])}>↺ العب مرة أخرى</button>}
        </div>
      ) : (
        <HundredBoard />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ١١: زوجي أم فردي
const PAIR_ITEMS = [
  { e: '🧦', name: 'جوارب' },
  { e: '🧤', name: 'قفازات' },
  { e: '👟', name: 'أحذية' },
  { e: '👀', name: 'عيون' }
];

export function OddEvenExplorer() {
  const [item, setItem] = useState(PAIR_ITEMS[0]);
  const [n, setN] = useState(7);
  const [paired, setPaired] = useState(false);
  const even = n % 2 === 0;
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {PAIR_ITEMS.map((it) => (
          <button key={it.e} className={`h-14 w-14 rounded-2xl text-3xl ${item.e === it.e ? 'bg-amber-100 ring-4 ring-amber-brand' : 'bg-white'}`} onClick={() => { setItem(it); setPaired(false); }}>
            {it.e}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary h-12 w-12 !px-0" onClick={() => { setN((x) => Math.max(1, x - 1)); setPaired(false); }}>−</button>
        <span className="text-4xl font-black">{toAr(n)}</span>
        <button className="btn-primary h-12 w-12 !px-0" onClick={() => { setN((x) => Math.min(20, x + 1)); setPaired(false); sfx('pop'); }}>+</button>
      </div>
      <div className="card flex min-h-32 max-w-2xl flex-wrap items-center justify-center gap-3">
        {paired
          ? Array.from({ length: Math.ceil(n / 2) }, (_, i) => {
              const single = !even && i === Math.ceil(n / 2) - 1;
              return (
                <div key={i} className={`flex animate-pop gap-1 rounded-2xl border-4 px-2 py-1 text-4xl ${single ? 'animate-wiggle border-amber-brand bg-amber-50' : 'border-green-500 bg-green-50'}`}>
                  <span>{item.e}</span>
                  {!single && <span>{item.e}</span>}
                </div>
              );
            })
          : Array.from({ length: n }, (_, i) => (
              <span key={i} className="text-4xl" style={{ transform: `rotate(${((i * 47) % 40) - 20}deg)` }}>
                {item.e}
              </span>
            ))}
      </div>
      <button className="btn-amber text-xl" onClick={() => { setPaired(true); sfx('whoosh'); setTimeout(() => speak(even ? `العدد ${numberToWords(n)} زوجي، لكل واحد زوج` : `العدد ${numberToWords(n)} فردي، بقي واحد وحده`), 400); }}>
        🤝 رتّبها أزواجاً
      </button>
      {paired && <span className={`chip !text-2xl ${even ? '!bg-green-100 !text-green-800' : '!bg-amber-100 !text-amber-800'}`}>{even ? 'زوجي ✅' : 'فردي ☝️'}</span>}
      <div className="flex flex-wrap justify-center gap-1" dir="rtl">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((k) => (
          <span key={k} className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-black ${k % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
            {toAr(k)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- ١٢: خيوط الكرات و«بين»
const PATTERNS = [
  ['yellow', 'green'],
  ['blue', 'green', 'white'],
  ['white', 'white', 'red'],
  ['blue', 'blue', 'green', 'white']
];

export function BeadsExplorer() {
  const [tab, setTab] = useState('beads');
  const [pi, setPi] = useState(0);
  const [ask, setAsk] = useState(7);
  const [answered, setAnswered] = useState(null);
  const [pair, setPair] = useState([13, 21]);
  const [picked, setPicked] = useState([]);
  const pattern = PATTERNS[pi];
  const correct = pattern[(ask - 1) % pattern.length];

  const newBetween = () => {
    const a = rand(1, 22);
    const b = a + rand(3, 8);
    setPair([a, b]);
    setPicked([]);
    sfx('whoosh');
    speak(`ما الأعداد بين ${numberToWords(a)} و ${numberToWords(b)}؟`);
  };

  const between = Array.from({ length: pair[1] - pair[0] - 1 }, (_, i) => pair[0] + 1 + i);

  return (
    <div>
      <Tabs tabs={[['beads', 'خيوط الكرات'], ['between', 'لعبة «بين»']]} value={tab} onChange={setTab} />
      {tab === 'beads' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {PATTERNS.map((p, i) => (
              <button key={i} onClick={() => { setPi(i); setAnswered(null); }} className={`flex gap-0.5 rounded-xl p-2 ${pi === i ? 'bg-amber-100 ring-4 ring-amber-brand' : 'bg-white'}`}>
                {p.map((c, k) => (
                  <span key={k} className="h-6 w-6 rounded-full border border-slate-400" style={{ background: BEAD_COLORS[c].hex }} />
                ))}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0 overflow-x-auto" dir="rtl">
            {Array.from({ length: 18 }, (_, i) => {
              const pos = i + 1;
              const visible = pos <= 6 || (answered && pos === ask);
              return (
                <button key={i} onClick={() => { setAsk(pos); setAnswered(null); speak(`ما لون الكرة ${ordinal(pos) || numberToWords(pos)}؟`); }} className="flex flex-col items-center">
                  <span className={`h-10 w-10 rounded-full border-2 ${pos === ask ? 'border-4 border-amber-brand' : 'border-slate-500'}`} style={{ background: visible ? BEAD_COLORS[pattern[i % pattern.length]].hex : '#f1f5f9' }} />
                  <span className="text-xs font-bold text-slate-500">{toAr(pos)}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xl font-bold">ما لون الكرة رقم {toAr(ask)}؟ (المس أي كرة لتغيير السؤال)</p>
          <div className="flex gap-2">
            {[...new Set(pattern)].map((c) => (
              <button key={c} onClick={() => {
                const ok = c === correct;
                setAnswered(c);
                sfx(ok ? 'success' : 'error');
                speak(ok ? `صحيح! الكرة ${BEAD_COLORS[c].name}` : `لونها ${BEAD_COLORS[correct].name}. انظر إلى النمط`);
              }} className="flex h-16 w-24 flex-col items-center justify-center rounded-2xl bg-white shadow ring-2 ring-oman-100">
                <span className="h-8 w-8 rounded-full border border-slate-400" style={{ background: BEAD_COLORS[c].hex }} />
                <span className="text-sm font-bold">{BEAD_COLORS[c].name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 text-4xl font-black">
            <span className="rounded-2xl bg-white px-4 py-2 shadow">🎲 {toAr(pair[0])}</span>
            <span className="text-xl text-oman-600">بين</span>
            <span className="rounded-2xl bg-white px-4 py-2 shadow">🎲 {toAr(pair[1])}</span>
          </div>
          <p className="font-bold text-oman-600">المس كل الأعداد التي تقع بينهما</p>
          <div className="flex flex-wrap justify-center gap-1" dir="rtl">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((k) => {
              const isEnd = k === pair[0] || k === pair[1];
              const on = picked.includes(k);
              return (
                <button key={k} onClick={() => {
                  if (isEnd) return;
                  if (between.includes(k)) { setPicked((p) => (p.includes(k) ? p : [...p, k])); sfx('pop'); }
                  else { sfx('error'); speak(`${numberToWords(k)} ليس بينهما`); }
                }} className={`h-11 w-11 rounded-lg text-lg font-black ${isEnd ? 'bg-oman-700 text-white' : on ? 'bg-green-500 text-white' : 'bg-white text-oman-700 shadow'}`}>
                  {toAr(k)}
                </button>
              );
            })}
          </div>
          {picked.length === between.length && between.length > 0 && <span className="chip !bg-green-100 !text-xl !text-green-800">أحسنت! بينهما {toAr(between.length)} أعداد</span>}
          <button className="btn-amber text-xl" onClick={newBetween}>🎲 ارمِ حجري النرد</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ١٣: الجمع والطرح
export function AddSubExplorer() {
  const [tab, setTab] = useState('balloons');
  const [balloons, setBalloons] = useState([6, 4, 8]);
  const [sel, setSel] = useState([]);
  const [merged, setMerged] = useState(null);
  const [a, setA] = useState(5);
  const [b, setB] = useState(4);
  const [joined, setJoined] = useState(false);
  const [sheep, setSheep] = useState(8);
  const [out, setOut] = useState(0);

  const newBalloons = () => {
    const x = rand(1, 9);
    setBalloons(shuffle([x, 10 - x, rand(1, 9)]));
    setSel([]);
    setMerged(null);
  };

  const tapBalloon = (i) => {
    if (merged) return;
    const next = sel.includes(i) ? sel.filter((k) => k !== i) : [...sel, i].slice(-2);
    setSel(next);
    sfx('pop');
    if (next.length === 2) {
      const s = balloons[next[0]] + balloons[next[1]];
      if (s === 10) {
        setMerged(next);
        sfx('success');
        const rest = balloons.find((_, k) => !next.includes(k));
        speak(`زوج العشرة! عشرة زائد ${numberToWords(rest)} يساوي ${numberToWords(10 + rest)}`);
      } else speak(`${numberToWords(s)}، ليس عشرة. ابحث عن زوج العشرة`);
    }
  };

  const total = balloons.reduce((x, y) => x + y, 0);

  return (
    <div>
      <Tabs tabs={[['balloons', 'البالونات وأزواج ١٠'], ['fields', 'الحقول والأواني (الضم)'], ['gate', 'أغلق البوابة! (الأخذ)'], ['line', 'خط الأعداد']]} value={tab} onChange={setTab} />
      {tab === 'balloons' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">المس بالونين مجموعهما ١٠، ثم أضف البالون الثالث</p>
          <div className="flex items-end gap-4">
            {balloons.map((n, i) => (
              <button key={i} onClick={() => tapBalloon(i)} className={`flex flex-col items-center transition ${merged?.includes(i) ? 'scale-90 opacity-70' : ''}`}>
                <span className={`flex h-24 w-20 items-center justify-center rounded-[50%] text-4xl font-black text-white shadow-lg ${sel.includes(i) ? 'ring-8 ring-amber-300' : ''}`} style={{ background: ['#ef4444', '#3b82f6', '#22c55e'][i] }}>
                  {toAr(n)}
                </span>
                <span className="h-12 w-0.5 bg-slate-400" />
              </button>
            ))}
          </div>
          {merged && (
            <p className="animate-pop text-3xl font-black text-oman-700">
              {toAr(balloons[merged[0]])} + {toAr(balloons[merged[1]])} = ١٠ ← ١٠ + {toAr(balloons.find((_, k) => !merged.includes(k)))} = {toAr(total)}
            </p>
          )}
          <button className="btn-amber" onClick={newBalloons}>🎈 بالونات جديدة</button>
        </div>
      )}
      {tab === 'fields' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[[a, setA, '🐐'], [b, setB, '🐐']].map(([v, set, e], k) => (
              <div key={k} className="flex flex-col items-center gap-2">
                <div className={`flex h-40 w-48 flex-wrap content-center justify-center gap-1 rounded-2xl border-8 border-green-800 bg-green-300 p-2 transition ${joined ? (k === 0 ? 'translate-x-6' : '-translate-x-6') : ''}`}>
                  {Array.from({ length: v }, (_, i) => (
                    <span key={i} className="text-2xl">{e}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost h-12 w-12 !px-0" onClick={() => { set(Math.max(0, v - 1)); setJoined(false); }}>−</button>
                  <span className="text-2xl font-black">{toAr(v)}</span>
                  <button className="btn-ghost h-12 w-12 !px-0" onClick={() => { set(Math.min(10, v + 1)); setJoined(false); }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-amber text-xl" onClick={() => { setJoined(true); sfx('whoosh'); speak(`نضم الحقلين: ${numberToWords(a)} و ${numberToWords(b)} يساوي ${numberToWords(a + b)}`); }}>
            🤲 اضمم الحقلين
          </button>
          {joined && <p className="animate-pop text-4xl font-black text-oman-700">{toAr(a)} + {toAr(b)} = {toAr(a + b)}</p>}
        </div>
      )}
      {tab === 'gate' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">المس الخروف ليخرج من البوابة. كم بقي في الحقل؟</p>
          <div className="flex items-center gap-2">
            <div className="flex h-44 w-72 flex-wrap content-center justify-center gap-2 rounded-2xl border-8 border-green-800 bg-green-300 p-2">
              {Array.from({ length: sheep - out }, (_, i) => (
                <button key={i} className="text-4xl" onClick={() => { setOut((o) => o + 1); sfx('pop'); speak(`بقي ${numberToWords(sheep - out - 1)}`); }}>
                  🐑
                </button>
              ))}
            </div>
            <div className="flex w-20 flex-col items-center">
              <span className="text-3xl">🚪</span>
              <div className="flex flex-wrap justify-center">{Array.from({ length: out }, (_, i) => <span key={i} className="text-xl opacity-70">🐑</span>)}</div>
            </div>
          </div>
          <p className="text-4xl font-black text-oman-700">{toAr(sheep)} − {toAr(out)} = {toAr(sheep - out)}</p>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => { setSheep(rand(6, 12)); setOut(0); }}>حقل جديد</button>
            <button className="btn-primary" onClick={() => { sfx('success'); speak('أغلقنا البوابة!'); }}>🔒 أغلق البوابة!</button>
          </div>
        </div>
      )}
      {tab === 'line' && <NumberLine />}
    </div>
  );
}

// ---------------------------------------------------------------- ١٤: صناديق الأحذية والنقود
export function ShopMoneyExplorer() {
  const [tab, setTab] = useState('shoes');
  const sizes = [35, 25, 29, 23, 42];
  const [stack, setStack] = useState([]);
  const sorted = [...sizes].sort((x, y) => x - y);

  const pickBox = (s) => {
    const expected = sorted[stack.length];
    if (s === expected) {
      setStack((st) => [...st, s]);
      sfx('success');
      speak(`مقاس ${numberToWords(s)}`);
    } else {
      sfx('error');
      speak('ابحث عن أصغر مقاس من الصناديق الباقية');
    }
  };

  return (
    <div>
      <Tabs tabs={[['shoes', 'كومة صناديق الأحذية'], ['money', 'محفظة النقود العمانية']]} value={tab} onChange={setTab} />
      {tab === 'shoes' ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">رتّب الصناديق: المس الصندوق الأصغر مقاساً أولاً</p>
          <div className="flex flex-wrap justify-center gap-2">
            {sizes.filter((s) => !stack.includes(s)).map((s) => (
              <button key={s} onClick={() => pickBox(s)} className="flex h-16 w-28 items-center justify-between rounded-lg border-2 border-green-900 bg-green-200 px-3 text-2xl font-black shadow">
                {toAr(s)} <span>👟</span>
              </button>
            ))}
          </div>
          <div className="flex min-h-24 flex-wrap items-end justify-center gap-2 rounded-2xl bg-white p-3 shadow-inner">
            {stack.map((s, i) => (
              <div key={s} className="flex animate-pop flex-col items-center">
                <span className="text-xs font-bold text-slate-500">{toAr(i + 1)}</span>
                <span className="rounded-lg bg-amber-brand px-3 py-2 text-2xl font-black text-white">{toAr(s)}</span>
              </div>
            ))}
          </div>
          {stack.length === 5 && (
            <div className="flex gap-2">
              <span className="chip !bg-green-100 !text-xl !text-green-800">الترتيب: {stack.map(toAr).join('، ')}</span>
              <button className="btn-ghost" onClick={() => setStack([])}>↺</button>
            </div>
          )}
        </div>
      ) : (
        <MoneyWallet />
      )}
    </div>
  );
}
