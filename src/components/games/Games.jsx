// ألعاب الطلاقة الذهنية (1Nc1–1Nc7)
import { useEffect, useState } from 'react';
import GameShell from './GameShell.jsx';
import { Shape2D, Solid, SHAPE_NAMES, SOLID_NAMES } from '../lesson/Visual.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords } from '../../utils/arabic.js';
import { rand, shuffle, pick } from '../../utils/random.js';

// ------------------------------------------------ ١) فرقعة فقاعات أزواج العدد ١٠
function BubbleRound({ addScore }) {
  const make = () => {
    const n = rand(0, 10);
    const answer = 10 - n;
    const others = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== answer)).slice(0, 5);
    return {
      n,
      answer,
      bubbles: shuffle([answer, ...others]).map((v, i) => ({ v, id: `${Date.now()}-${i}`, x: 6 + ((i * 16 + rand(0, 6)) % 86), delay: rand(0, 12) / 10, dur: 3 + rand(0, 15) / 10 }))
    };
  };
  const [round, setRound] = useState(make);
  const [popped, setPopped] = useState(null);
  const [wrong, setWrong] = useState(null);

  useEffect(() => {
    speak(`ما زوج العدد ${numberToWords(round.n)} لتكوين عشرة؟`);
  }, [round]);

  const tap = (b) => {
    if (popped) return;
    if (b.v === round.answer) {
      setPopped(b.id);
      sfx('pop');
      addScore(10);
      setTimeout(() => {
        setPopped(null);
        setRound(make());
      }, 450);
    } else {
      setWrong(b.id);
      sfx('error');
      addScore(-2);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-sky-200 to-cyan-500 shadow-inner">
      <div className="absolute inset-x-0 top-3 z-10 flex justify-center">
        <div className="rounded-3xl bg-white/90 px-6 py-2 text-center shadow-lg">
          <div className="text-4xl font-black text-oman-800">
            {toAr(round.n)} + ؟ = {toAr(10)}
          </div>
        </div>
      </div>
      {round.bubbles.map((b) => (
        <button
          key={b.id}
          onClick={() => tap(b)}
          className={`absolute flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 text-3xl font-black text-oman-900 shadow-lg transition ${popped === b.id ? 'scale-150 opacity-0' : ''} ${wrong === b.id ? 'animate-wiggle bg-rose-200/90' : 'bg-white/60'}`}
          style={{ left: `${b.x}%`, top: `${30 + ((b.x * 7) % 50)}%`, animation: popped === b.id || wrong === b.id ? undefined : `float ${b.dur}s ${b.delay}s ease-in-out infinite` }}
          aria-label={`فقاعة ${b.v}`}
        >
          {toAr(b.v)}
        </button>
      ))}
    </div>
  );
}

export function BubblePairsGame({ best, onEnd }) {
  return (
    <GameShell title="فرقعة فقاعات أزواج العدد ١٠" icon="🫧" codes={['1Nc1', '1Nc2']} seconds={60} best={best} onEnd={onEnd} instructions="فرقع الفقاعة التي تكمل العدد إلى عشرة. لديك ستون ثانية!">
      {({ addScore }) => <BubbleRound addScore={addScore} />}
    </GameShell>
  );
}

// ------------------------------------------------ ٢) سباق واحات الجمع والطرح
function makeFact() {
  const type = pick(['pair10', 'add', 'sub', 'double', 'near', 'bridge']);
  let a;
  let b;
  let ans;
  let text;
  switch (type) {
    case 'pair10':
      a = rand(1, 9);
      ans = 10 - a;
      text = `${toAr(a)} + ؟ = ${toAr(10)}`;
      break;
    case 'double':
      a = rand(1, 5);
      ans = a * 2;
      text = `${toAr(a)} + ${toAr(a)} = ؟`;
      break;
    case 'near':
      a = rand(2, 5);
      ans = a * 2 + 1;
      text = `${toAr(a)} + ${toAr(a + 1)} = ؟`;
      break;
    case 'bridge':
      a = rand(6, 9);
      b = rand(11 - a, 9);
      ans = a + b;
      text = `${toAr(a)} + ${toAr(b)} = ؟`;
      break;
    case 'sub':
      a = rand(5, 15);
      b = rand(1, Math.min(5, a));
      ans = a - b;
      text = `${toAr(a)} − ${toAr(b)} = ؟`;
      break;
    default:
      a = rand(1, 9);
      b = rand(1, 10 - a);
      ans = a + b;
      text = `${toAr(a)} + ${toAr(b)} = ؟`;
  }
  const opts = new Set([ans]);
  while (opts.size < 3) {
    const v = ans + rand(-3, 3);
    if (v >= 0) opts.add(v);
  }
  return { text, ans, opts: shuffle([...opts]) };
}

function RaceRound({ addScore }) {
  const GOAL = 10;
  const [me, setMe] = useState(0);
  const [rival, setRival] = useState(0);
  const [fact, setFact] = useState(makeFact);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setRival((r) => Math.min(GOAL, r + 1)), 7500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (me >= GOAL) {
      sfx('celebrate');
      speak('وصلت إلى الواحة! سباق جديد');
      addScore(30);
      setTimeout(() => {
        setMe(0);
        setRival(0);
      }, 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const answer = (v) => {
    if (v === fact.ans) {
      sfx('success');
      addScore(10);
      setMe((m) => Math.min(GOAL, m + 1));
      setFlash('good');
    } else {
      sfx('error');
      setFlash('bad');
    }
    setTimeout(() => setFlash(null), 300);
    setFact(makeFact());
  };

  const lane = (pos, emoji, color) => (
    <div className={`relative h-16 rounded-2xl ${color}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-4xl">🌴</span>
      <span className="absolute top-1/2 -translate-y-1/2 text-5xl transition-all duration-500" style={{ right: `${(pos / GOAL) * 82}%`, transform: 'translateY(-50%)' }}>
        {emoji}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-[2rem] bg-gradient-to-l from-amber-100 to-amber-300 p-3">
        {lane(me, '🐪', 'bg-amber-200')}
        {lane(rival, '🐫', 'bg-orange-200')}
        <p className="text-center text-sm font-bold text-amber-900">جملك 🐪 ضد جمل الحاسوب 🐫 – أجب بسرعة لتصل إلى الواحة!</p>
      </div>
      <div className={`card flex flex-col items-center gap-4 ${flash === 'good' ? 'ring-4 ring-green-400' : flash === 'bad' ? 'ring-4 ring-rose-400' : ''}`}>
        <div className="text-5xl font-black text-oman-800">{fact.text}</div>
        <div className="flex gap-3">
          {fact.opts.map((o) => (
            <button key={o} onClick={() => answer(o)} className="btn min-h-20 min-w-24 border-4 border-oman-100 bg-white text-4xl shadow">
              {toAr(o)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OasisRaceGame({ best, onEnd }) {
  return (
    <GameShell title="سباق واحات الجمع والطرح" icon="🐪" codes={['1Nc1', '1Nc4', '1Nc5', '1Nc6']} seconds={90} best={best} onEnd={onEnd} instructions="أجب عن كل سؤال جمع أو طرح بسرعة ليتقدم جملك نحو الواحة. لديك تسعون ثانية!">
      {({ addScore }) => <RaceRound addScore={addScore} />}
    </GameShell>
  );
}

// ------------------------------------------------ ٣) صائد الأعداد الزوجية والفردية
function CatcherRound({ addScore }) {
  const make = (target) => ({ target, nums: Array.from({ length: 9 }, () => rand(1, 20)), id: Math.random() });
  const [round, setRound] = useState(() => make(pick(['even', 'odd'])));
  const [caught, setCaught] = useState([]);
  const isTarget = (n) => (round.target === 'even' ? n % 2 === 0 : n % 2 === 1);
  const remaining = round.nums.filter((n, i) => isTarget(n) && !caught.includes(i)).length;

  useEffect(() => {
    speak(round.target === 'even' ? 'اصطد الأعداد الزوجية' : 'اصطد الأعداد الفردية');
  }, [round]);

  useEffect(() => {
    if (remaining === 0) {
      sfx('star');
      addScore(5);
      setTimeout(() => {
        setCaught([]);
        setRound(make(pick(['even', 'odd'])));
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const tap = (n, i) => {
    if (caught.includes(i)) return;
    if (isTarget(n)) {
      setCaught((c) => [...c, i]);
      sfx('pop');
      addScore(10);
    } else {
      sfx('error');
      addScore(-5);
      speak(`${numberToWords(n)} ${n % 2 === 0 ? 'زوجي' : 'فردي'}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`rounded-3xl px-6 py-3 text-3xl font-black text-white shadow ${round.target === 'even' ? 'bg-green-600' : 'bg-amber-brand'}`}>
        🥅 اصطد الأعداد {round.target === 'even' ? 'الزوجية' : 'الفردية'}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {round.nums.map((n, i) => (
          <button key={`${round.id}-${i}`} onClick={() => tap(n, i)} className={`h-24 w-24 animate-pop rounded-3xl text-4xl font-black shadow-lg transition sm:h-28 sm:w-28 ${caught.includes(i) ? 'scale-90 bg-green-200 text-green-800' : 'bg-white text-oman-800 hover:-translate-y-1'}`}>
            {caught.includes(i) ? '✓' : toAr(n)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OddEvenCatcherGame({ best, onEnd }) {
  return (
    <GameShell title="صائد الأعداد الزوجية والفردية" icon="🥅" codes={['1Nc7', '1Nn5']} seconds={60} best={best} onEnd={onEnd} instructions="اصطد كل الأعداد المطلوبة: زوجية أو فردية. انتبه! الخطأ يخصم نقاطاً.">
      {({ addScore }) => <CatcherRound addScore={addScore} />}
    </GameShell>
  );
}

// ------------------------------------------------ ٤) بازل تكوين الأشكال والمجسمات
const PUZZLES = [
  { kind: 'name2d', make: () => { const t = pick(['circle', 'square', 'rectangle', 'triangle', 'pentagon', 'hexagon']); return { show: <Shape2D type={t} size={120} color="#0f4c5c" />, q: 'ما اسم هذا الشكل؟', ans: SHAPE_NAMES[t], opts: shuffle([SHAPE_NAMES[t], ...shuffle(Object.values(SHAPE_NAMES).filter((n) => n !== SHAPE_NAMES[t] && n !== 'معيّن' && n !== 'شكل بيضاوي')).slice(0, 2)]) }; } },
  { kind: 'name3d', make: () => { const t = pick(Object.keys(SOLID_NAMES)); return { show: <Solid type={t} size={130} />, q: 'ما اسم هذا المجسم؟', ans: SOLID_NAMES[t], opts: shuffle([SOLID_NAMES[t], ...shuffle(Object.values(SOLID_NAMES).filter((n) => n !== SOLID_NAMES[t])).slice(0, 2)]) }; } },
  { kind: 'sides', make: () => { const t = pick(['triangle', 'square', 'pentagon', 'hexagon']); const n = { triangle: 3, square: 4, pentagon: 5, hexagon: 6 }[t]; return { show: <span className="text-5xl font-black text-oman-700">{toAr(n)} أضلاع</span>, q: `أي شكل له ${toAr(n)} أضلاع؟`, ans: SHAPE_NAMES[t], opts: shuffle(['مثلث', 'مربع', 'خماسي', 'سداسي'].filter((x) => x !== SHAPE_NAMES[t]).slice(0, 2).concat(SHAPE_NAMES[t])) }; } },
  { kind: 'compose', make: () => { const c = pick([{ parts: ['square', 'square'], ans: 'مستطيل', txt: 'مربعان متجاوران يكوّنان...' }, { parts: ['triangle', 'triangle'], ans: 'مربع', txt: 'مثلثان قائمان متساويان يكوّنان...' }, { parts: ['square', 'square', 'square', 'square', 'square', 'square'], ans: 'مكعب', txt: 'ستة مربعات تكوّن وجوه...' }]); return { show: <div className="flex gap-1">{c.parts.map((p, i) => <Shape2D key={i} type={p} size={50} color="#d97706" />)}</div>, q: c.txt, ans: c.ans, opts: shuffle([c.ans, ...['مستطيل', 'مربع', 'مكعب', 'مثلث', 'كرة'].filter((x) => x !== c.ans).slice(0, 2)]) }; } }
];

function PuzzleRound({ addScore }) {
  const make = () => pick(PUZZLES).make();
  const [p, setP] = useState(make);
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    speak(p.q);
  }, [p]);
  const answer = (o) => {
    if (o === p.ans) {
      sfx('success');
      addScore(10);
      setFlash('good');
    } else {
      sfx('error');
      setFlash('bad');
      speak(`الإجابة: ${p.ans}`);
    }
    setTimeout(() => {
      setFlash(null);
      setP(make());
    }, 600);
  };
  return (
    <div className={`card flex flex-col items-center gap-4 py-6 ${flash === 'good' ? 'ring-4 ring-green-400' : flash === 'bad' ? 'ring-4 ring-rose-400' : ''}`}>
      <div className="flex min-h-36 items-center justify-center">{p.show}</div>
      <p className="text-2xl font-black text-oman-800">{p.q}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {p.opts.map((o) => (
          <button key={o} onClick={() => answer(o)} className="btn min-h-16 min-w-28 border-4 border-oman-100 bg-white text-2xl shadow">
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ShapePuzzleGame({ best, onEnd }) {
  return (
    <GameShell title="بازل تكوين الأشكال والمجسمات" icon="🧩" codes={['1Gs1', '1Gs2']} seconds={90} best={best} onEnd={onEnd} instructions="تعرّف الأشكال والمجسمات، واكتشف ماذا تكوّن الأشكال معاً. لديك تسعون ثانية!">
      {({ addScore }) => <PuzzleRound addScore={addScore} />}
    </GameShell>
  );
}
