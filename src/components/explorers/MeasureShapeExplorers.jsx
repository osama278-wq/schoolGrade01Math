// ساحات الاستكشاف الحسي للقياس والهندسة (المحطات ٣، ٦، ٨، ٩، ١٠)
import { useMemo, useState } from 'react';
import { Tabs } from './NumberExplorers.jsx';
import BalanceScale from '../manipulatives/BalanceScale.jsx';
import { Cube } from '../manipulatives/LinkingCubes.jsx';
import { InteractiveClock, ClockView } from '../manipulatives/ClockMoney.jsx';
import { Shape2D, Solid, SHAPE_NAMES, SOLID_NAMES } from '../lesson/Visual.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr, numberToWords, hourText, riyals } from '../../utils/arabic.js';
import { rand, shuffle, pick } from '../../utils/random.js';

// ---------------------------------------------------------------- ٣: القياس والطول
const PEOPLE = [
  { name: 'مريم', h: 4, e: '👧' },
  { name: 'محمد', h: 6, e: '👦' },
  { name: 'سالم', h: 8, e: '🧑' },
  { name: 'الجد', h: 10, e: '👴' }
];

export function MeasureExplorer() {
  const [tab, setTab] = useState('foot');
  const [unit, setUnit] = useState('cube');
  const [placed, setPlaced] = useState(0);
  const [foot] = useState(() => rand(6, 9));
  const [order, setOrder] = useState([]);
  const people = useMemo(() => shuffle(PEOPLE), []);
  const unitLen = unit === 'cube' ? 1 : 2; // القلم يساوي مكعبين
  const need = Math.round(foot / unitLen);
  const footPx = foot * 40;

  const addUnit = () => {
    if (placed >= need + 2) return;
    const n = placed + 1;
    setPlaced(n);
    sfx('pop');
    if (n === need) {
      sfx('success');
      speak(`طول القدم العملاقة ${numberToWords(n)} ${unit === 'cube' ? 'مكعبات' : 'أقلام'}`);
    } else speak(numberToWords(n));
  };

  const pickPerson = (p) => {
    const expected = [...PEOPLE].sort((a, b) => a.h - b.h)[order.length];
    if (p.name === expected.name) {
      setOrder((o) => [...o, p]);
      sfx('success');
      speak(order.length === 0 ? `${p.name} الأقصر` : order.length === PEOPLE.length - 1 ? `${p.name} الأطول` : `${p.name} أطول من ${order[order.length - 1].name}`);
    } else {
      sfx('error');
      speak('ابحث عن الأقصر من الباقين');
    }
  };

  return (
    <div>
      <Tabs tabs={[['foot', 'بصمة القدم العملاقة'], ['order', 'الأقصر والأطول']]} value={tab} onChange={setTab} />
      {tab === 'foot' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <button className={unit === 'cube' ? 'btn-primary' : 'btn-ghost'} onClick={() => { setUnit('cube'); setPlaced(0); }}>🧊 نقيس بالمكعبات</button>
            <button className={unit === 'pencil' ? 'btn-primary' : 'btn-ghost'} onClick={() => { setUnit('pencil'); setPlaced(0); }}>✏️ نقيس بالأقلام</button>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="mx-auto flex w-max flex-col items-start gap-1 p-2" dir="ltr">
              <svg width={footPx} height="110" viewBox={`0 0 ${footPx} 110`}>
                <path d={`M10 70 C10 30 ${footPx * 0.35} 20 ${footPx * 0.6} 30 C${footPx * 0.85} 38 ${footPx - 8} 45 ${footPx - 8} 75 C${footPx - 8} 100 20 105 10 70Z`} fill="#e7e5e4" stroke="#78716c" strokeWidth="4" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <ellipse key={i} cx={footPx - 22 - i * 4} cy={22 + i * 14} rx="9" ry="7" fill="#e7e5e4" stroke="#78716c" strokeWidth="3" />
                ))}
              </svg>
              <div className="flex">
                {Array.from({ length: placed }, (_, i) =>
                  unit === 'cube' ? (
                    <div key={i} className="animate-pop" style={{ width: 40 }}>
                      <Cube color={i % 2 ? '#2563eb' : '#f59e0b'} size={40} />
                    </div>
                  ) : (
                    <div key={i} className="flex h-8 animate-pop items-center rounded-full border-2 border-amber-800 bg-amber-300 text-xs font-black" style={{ width: 80 }}>
                      ✏️
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-amber text-xl" onClick={addUnit}>➕ ضع {unit === 'cube' ? 'مكعباً' : 'قلماً'}</button>
            <button className="btn-ghost" onClick={() => setPlaced(0)}>↺</button>
            <span className="chip !text-xl">{toAr(placed)} {unit === 'cube' ? 'مكعبات' : 'أقلام'}</span>
          </div>
          {placed > need && <p className="font-bold text-rose-700">تجاوزنا طول القدم! أزل بعض الوحدات.</p>}
          {unit === 'pencil' && placed === need && <p className="chip !bg-amber-100 !text-amber-800">لاحظ: نحتاج أقلاماً أقل من المكعبات لأن القلم أطول من المكعب</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">المس الأشخاص من الأقصر إلى الأطول</p>
          <div className="flex items-end justify-center gap-6">
            {people.filter((p) => !order.includes(p)).map((p) => (
              <button key={p.name} onClick={() => pickPerson(p)} className="flex flex-col items-center">
                <span style={{ fontSize: p.h * 9, lineHeight: 1 }}>{p.e}</span>
                <span className="font-bold">{p.name}</span>
              </button>
            ))}
          </div>
          <div className="flex min-h-28 items-end justify-center gap-4 rounded-2xl bg-white p-3 shadow-inner">
            {order.map((p, i) => (
              <div key={p.name} className="flex animate-pop flex-col items-center">
                <span style={{ fontSize: p.h * 7, lineHeight: 1 }}>{p.e}</span>
                <span className="text-sm font-bold">{i === 0 ? 'الأقصر' : i === PEOPLE.length - 1 ? 'الأطول' : p.name}</span>
              </div>
            ))}
          </div>
          {order.length === PEOPLE.length && <button className="btn-ghost" onClick={() => setOrder([])}>↺ مرة أخرى</button>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٦: الأشكال والمجسمات والأنماط والتماثل
const STICK_SHAPES = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon' };
const SOLID_FACES = { cube: 'وجوهه مربعات', cuboid: 'وجوهه مستطيلات ومربعات', sphere: 'ليس له وجوه مستوية', cone: 'قاعدته دائرة', pyramid: 'وجوهه مثلثات', prism: 'فيه مثلثان ومستطيلات', cylinder: 'قاعدتاه دائرتان' };

export function ShapesExplorer() {
  const [tab, setTab] = useState('box');
  const [mystery, setMystery] = useState(() => pick(['circle', 'square', 'rectangle', 'triangle']));
  const [revealed, setRevealed] = useState(false);
  const [dice, setDice] = useState(4);
  const [rolling, setRolling] = useState(false);
  const [patternSeq, setPatternSeq] = useState(['circle', 'square', 'circle', 'square']);
  const [mirror, setMirror] = useState(() => Array(16).fill(false));

  const guess = (t) => {
    const ok = t === mystery;
    setRevealed(true);
    sfx(ok ? 'success' : 'error');
    speak(ok ? `أحسنت! إنه ${SHAPE_NAMES[t]}` : `إنه ${SHAPE_NAMES[mystery]}`);
  };

  const roll = () => {
    setRolling(true);
    sfx('whoosh');
    setTimeout(() => {
      const d = rand(3, 6);
      setDice(d);
      setRolling(false);
      speak(`${numberToWords(d)} عيدان تصنع ${SHAPE_NAMES[STICK_SHAPES[d]]}`);
    }, 600);
  };

  const nextPattern = (t) => {
    const unit = patternSeq.slice(0, 2);
    const expected = unit[patternSeq.length % 2];
    if (t === expected) {
      setPatternSeq((s) => [...s, t]);
      sfx('pop');
    } else {
      sfx('error');
      speak('انظر إلى النمط: ماذا يتكرر؟');
    }
  };

  return (
    <div>
      <Tabs tabs={[['box', 'ما الشكل؟'], ['sticks', 'صناعة الأشكال بالعيدان'], ['solids', 'المجسمات'], ['pattern', 'ما التالي؟'], ['sym', 'التماثل']]} value={tab} onChange={setTab} />

      {tab === 'box' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">ما الشكل الذي يخرج من الصندوق؟</p>
          <div className="relative h-44 w-56">
            <div className="absolute inset-x-0 top-0 flex justify-center" style={{ clipPath: revealed ? 'none' : 'inset(0 0 55% 0)' }}>
              <Shape2D type={mystery} color="#dc2626" fill="#f87171" size={110} />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 rounded-xl border-4 border-amber-800 bg-amber-300 shadow-lg" style={{ display: revealed ? 'none' : 'block' }}>
              <div className="h-4 bg-amber-500" />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {['circle', 'square', 'rectangle', 'triangle'].map((t) => (
              <button key={t} onClick={() => guess(t)} className="btn-ghost flex-col !py-1">
                <Shape2D type={t} size={44} />
                <span>{SHAPE_NAMES[t]}</span>
              </button>
            ))}
          </div>
          <button className="btn-amber" onClick={() => { setMystery(pick(['circle', 'square', 'rectangle', 'triangle'])); setRevealed(false); }}>📦 صندوق جديد</button>
        </div>
      )}

      {tab === 'sticks' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">ارمِ حجر النرد: كم عوداً ستستخدم؟ ماذا ستصنع؟</p>
          <button onClick={roll} className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-6xl font-black text-rose-600 shadow-lg ring-4 ring-rose-200 ${rolling ? 'animate-spin' : ''}`} aria-label="ارمِ النرد">
            {toAr(dice)}
          </button>
          <svg viewBox="0 0 220 220" width="220" height="220">
            {Array.from({ length: dice }, (_, i) => {
              const a1 = (Math.PI * 2 * i) / dice - Math.PI / 2;
              const a2 = (Math.PI * 2 * (i + 1)) / dice - Math.PI / 2;
              return <line key={i} x1={110 + 85 * Math.cos(a1)} y1={115 + 85 * Math.sin(a1)} x2={110 + 85 * Math.cos(a2)} y2={115 + 85 * Math.sin(a2)} stroke="#b45309" strokeWidth="12" strokeLinecap="round" className="animate-pop" />;
            })}
          </svg>
          <p className="chip !text-2xl">{toAr(dice)} عيدان ← {SHAPE_NAMES[STICK_SHAPES[dice]]}</p>
          <p className="text-sm text-oman-600">تحدٍّ من الكتاب: كيف تصنع ٤ مربعات؟ جرّب بالعيدان الحقيقية!</p>
        </div>
      )}

      {tab === 'solids' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.keys(SOLID_NAMES).map((t) => (
            <button key={t} className="card flex flex-col items-center gap-1 hover:ring-4 hover:ring-amber-brand" onClick={() => { sfx('tap'); speak(`${SOLID_NAMES[t]}، ${SOLID_FACES[t]}`); }}>
              <Solid type={t} size={90} />
              <span className="text-lg font-black">{SOLID_NAMES[t]}</span>
              <span className="text-xs text-oman-600">{SOLID_FACES[t]}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'pattern' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
            {patternSeq.map((t, i) => (
              <Shape2D key={i} type={t} color={t === 'circle' ? '#db2777' : t === 'square' ? '#f59e0b' : '#16a34a'} fill={t === 'circle' ? '#db2777' : t === 'square' ? '#f59e0b' : '#16a34a'} size={48} />
            ))}
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border-4 border-dashed border-amber-brand text-2xl font-black text-amber-brand">؟</span>
          </div>
          <div className="flex gap-2">
            {['circle', 'square', 'triangle'].map((t) => (
              <button key={t} className="btn-ghost flex-col !py-1" onClick={() => nextPattern(t)}>
                <Shape2D type={t} size={40} />
                {SHAPE_NAMES[t]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setPatternSeq(['triangle', 'square', 'triangle', 'square'])}>نمط جديد</button>
            <button className="btn-ghost" onClick={() => setPatternSeq(['circle', 'square', 'circle', 'square'])}>↺</button>
          </div>
        </div>
      )}

      {tab === 'sym' && (
        <div className="flex flex-col items-center gap-3">
          <p className="font-bold text-oman-600">لوّن مربعات في النصف الأيمن، وسيظهر النصف الأيسر مثل المرآة (التماثل)</p>
          <div className="flex items-stretch">
            {[0, 1].map((half) => (
              <div key={half} className={`grid grid-cols-2 gap-1 p-1 ${half === 0 ? 'border-l-4 border-dashed border-rose-500' : ''}`} dir="ltr">
                {Array.from({ length: 8 }, (_, k) => {
                  const row = Math.floor(k / 2);
                  const col = k % 2;
                  // النصف الأيمن (half=1) قابل للتلوين، والأيسر انعكاسه
                  const rightIdx = row * 2 + (half === 1 ? col : 1 - col);
                  const on = mirror[rightIdx];
                  return (
                    <button
                      key={k}
                      disabled={half === 0}
                      onClick={() => { setMirror((m) => m.map((v, i) => (i === rightIdx ? !v : v))); sfx('pop'); }}
                      className={`h-14 w-14 rounded-md border-2 ${on ? 'bg-violet-500' : 'bg-white'} ${half === 0 ? 'opacity-90' : ''}`}
                      aria-label="مربع"
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setMirror(Array(16).fill(false))}>↺ مسح</button>
          <p className="text-sm text-oman-600">ابحث في الصف عن أشياء متماثلة: الفراشة، الصدفة، ندفة الثلج.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٨: السعة
const VESSELS = [
  { id: 'cup', name: 'الكوب', cap: 2, w: 60, h: 70, color: '#38bdf8' },
  { id: 'jar', name: 'البرطمان', cap: 5, w: 90, h: 120, color: '#f59e0b' },
  { id: 'bucket', name: 'دلو الطلاء', cap: 8, w: 120, h: 140, color: '#a855f7' },
  { id: 'dates', name: 'وعاء التمر', cap: 4, w: 110, h: 80, color: '#b45309' }
];

export function CapacityExplorer() {
  const [fill, setFill] = useState({});
  const [order, setOrder] = useState([]);
  const [tab, setTab] = useState('fill');

  const pour = (v) => {
    const cur = fill[v.id] || 0;
    if (cur >= v.cap) {
      speak(`${v.name} ممتلئ! يتسع ${numberToWords(v.cap)} أكواب`);
      sfx('success');
      return;
    }
    setFill((f) => ({ ...f, [v.id]: cur + 1 }));
    sfx('whoosh');
    speak(numberToWords(cur + 1));
  };

  const pickOrder = (v) => {
    const expected = [...VESSELS].sort((a, b) => a.cap - b.cap)[order.length];
    if (v.id === expected.id) {
      setOrder((o) => [...o, v]);
      sfx('success');
    } else {
      sfx('error');
      speak('أيّها يتسع للكمية الأقل من الباقي؟');
    }
  };

  return (
    <div>
      <Tabs tabs={[['fill', 'املأ الأوعية بالأكواب'], ['order', 'ترتيب السعات']]} value={tab} onChange={setTab} />
      {tab === 'fill' ? (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">المس الوعاء لتصب فيه كوباً من الماء 🥛</p>
          <div className="flex flex-wrap items-end justify-center gap-5">
            {VESSELS.map((v) => {
              const pct = Math.min(1, (fill[v.id] || 0) / v.cap);
              return (
                <button key={v.id} onClick={() => pour(v)} className="flex flex-col items-center gap-1">
                  <div className="relative overflow-hidden rounded-b-3xl rounded-t-md border-4 border-slate-500 bg-white" style={{ width: v.w, height: v.h }}>
                    <div className="absolute inset-x-0 bottom-0 bg-sky-400/80 transition-all duration-500" style={{ height: `${pct * 100}%` }} />
                  </div>
                  <span className="font-bold">{v.name}</span>
                  <span className="chip">{toAr(fill[v.id] || 0)} 🥛</span>
                </button>
              );
            })}
          </div>
          <button className="btn-ghost" onClick={() => setFill({})}>↺ أفرغ الأوعية</button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">المس الأوعية من التي تتسع للكمية الأقل إلى التي تتسع للكمية الأكثر</p>
          <div className="flex flex-wrap items-end justify-center gap-4">
            {VESSELS.filter((v) => !order.includes(v)).map((v) => (
              <button key={v.id} onClick={() => pickOrder(v)} className="flex flex-col items-center">
                <div className="rounded-b-3xl rounded-t-md border-4 border-slate-500" style={{ width: v.w * 0.7, height: v.h * 0.7, background: v.color + '55' }} />
                <span className="font-bold">{v.name}</span>
              </button>
            ))}
          </div>
          <div className="flex min-h-24 items-end gap-3 rounded-2xl bg-white p-3 shadow-inner">
            {order.map((v, i) => (
              <div key={v.id} className="flex animate-pop flex-col items-center">
                <div className="rounded-b-2xl border-2 border-slate-500" style={{ width: v.w * 0.45, height: v.h * 0.45, background: v.color + '88' }} />
                <span className="text-xs font-bold">{i === 0 ? 'الأقل' : i === VESSELS.length - 1 ? 'الأكثر' : v.name}</span>
              </div>
            ))}
          </div>
          {order.length === VESSELS.length && <button className="btn-ghost" onClick={() => setOrder([])}>↺</button>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ٩: مطعم المدرسة
export const MENU = [
  { e: '🌴', name: 'تمر', price: 1 },
  { e: '💧', name: 'ماء', price: 1 },
  { e: '🥔', name: 'رقائق', price: 2 },
  { e: '☕', name: 'شاي', price: 2 },
  { e: '🍰', name: 'كعكة', price: 3 },
  { e: '🥣', name: 'شوربة', price: 4 }
];

const SCHEDULE = [
  { hour: 9, text: 'يفتح المطعم' },
  { hour: 10, text: 'يُقدَّم الفطور' },
  { hour: 11, text: 'يتوقف تقديم الفطور' },
  { hour: 1, text: 'يُقدَّم الشاي لمدة ساعة واحدة' },
  { hour: 2, text: 'يُغلق المطعم' }
];

export function CanteenExplorer() {
  const [tab, setTab] = useState('menu');
  const [tray, setTray] = useState([]);
  const [event, setEvent] = useState(SCHEDULE[0]);
  const [target, setTarget] = useState(null);
  const total = tray.reduce((a, b) => a + b.price, 0);

  return (
    <div>
      <Tabs tabs={[['menu', 'ما الثمن؟'], ['times', 'أوقات المطعم'], ['set', 'اضبط الساعة']]} value={tab} onChange={setTab} />
      {tab === 'menu' && (
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold text-oman-600">اختر وجبتك من قائمة مطعم المدرسة (أسعار تعليمية بالريال)</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {MENU.map((m) => (
              <button key={m.name} onClick={() => { if (tray.length < 6) { setTray((t) => [...t, { ...m, k: Math.random() }]); sfx('pop'); speak(`${m.name} ${riyals(m.price)}`); } }} className="card flex flex-col items-center !p-2 hover:ring-4 hover:ring-amber-brand">
                <span className="text-5xl">{m.e}</span>
                <span className="font-bold">{m.name}</span>
                <span className="rounded-full bg-amber-brand px-2 font-black text-white">{toAr(m.price)} ريال</span>
              </button>
            ))}
          </div>
          <div className="flex min-h-24 w-full max-w-xl flex-wrap items-center justify-center gap-2 rounded-[40px] border-8 border-amber-200 bg-amber-50 p-3">
            {tray.length === 0 && <span className="font-bold text-amber-700">صينيتك فارغة</span>}
            {tray.map((t) => (
              <button key={t.k} className="text-4xl" onClick={() => setTray((x) => x.filter((y) => y.k !== t.k))} aria-label={`إزالة ${t.name}`}>
                {t.e}
              </button>
            ))}
          </div>
          {tray.length > 0 && (
            <button className="btn-primary text-2xl" onClick={() => speak(`ثمن الوجبة ${tray.map((t) => numberToWords(t.price)).join(' زائد ')} يساوي ${numberToWords(total)}`)}>
              🔊 {tray.map((t) => toAr(t.price)).join(' + ')} = {toAr(total)} ريال
            </button>
          )}
          <button className="btn-ghost" onClick={() => setTray([])}>↺ صينية جديدة</button>
        </div>
      )}
      {tab === 'times' && (
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
          <div className="flex flex-col gap-2">
            {SCHEDULE.map((s) => (
              <button key={s.text} onClick={() => { setEvent(s); sfx('tick'); speak(`${s.text} عند ${hourText(s.hour)}`); }} className={`btn justify-start text-lg ${event === s ? 'bg-oman-700 text-white' : 'bg-white text-oman-700 ring-2 ring-oman-100'}`}>
                🕘 {s.text}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <ClockView hour={event.hour} size={220} />
            <span className="chip !text-xl">{hourText(event.hour)}</span>
          </div>
        </div>
      )}
      {tab === 'set' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            {SCHEDULE.map((s) => (
              <button key={s.text} className={target === s ? 'btn-amber' : 'btn-ghost'} onClick={() => { setTarget(s); speak(`اضبط الساعة: ${s.text} عند ${hourText(s.hour)}`); }}>
                {s.text}
              </button>
            ))}
          </div>
          <InteractiveClock initial={12} target={target?.hour} onChange={(h) => { if (target && h === target.hour) { sfx('success'); speak('أحسنت! ضبطت الساعة'); } }} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ١٠: الميزان
export function BalanceExplorer() {
  return <BalanceScale />;
}
