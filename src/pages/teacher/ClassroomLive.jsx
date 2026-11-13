import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { LESSONS, MENTAL, getLesson } from '../../data/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { SectionTitle } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

const SLICE_COLORS = ['#0f4c5c', '#d97706', '#14687c', '#b45309', '#1b8199', '#92400e'];

// ------------------------------------------------------------ عجلة السحب العشوائي
function NameWheel() {
  const { state, recordMental } = useApp();
  const roster = state.roster;
  const [exclude, setExclude] = useState(true);
  const [drawn, setDrawn] = useState([]);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [code, setCode] = useState('1Nc1');
  const [occasion, setOccasion] = useState(1);
  const [saved, setSaved] = useState('');

  const pool = exclude ? roster.filter((s) => !drawn.includes(s.id)) : roster;
  const n = roster.length;
  const slice = 360 / n;

  const spin = () => {
    if (spinning || !pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const idx = roster.findIndex((s) => s.id === pick.id);
    // المؤشر في الأعلى: ندوّر العجلة حتى يقع منتصف الشريحة تحته
    const target = 360 * 6 + (360 - (idx * slice + slice / 2));
    const base = angle - (angle % 360);
    setAngle(base + target);
    setSpinning(true);
    setWinner(null);
    setSaved('');
    sfx('whoosh');
    const ticks = setInterval(() => sfx('tick'), 160);
    setTimeout(() => {
      clearInterval(ticks);
      setSpinning(false);
      setWinner(pick);
      setDrawn((d) => [...d, pick.id]);
      sfx('success');
      speak(pick.name);
    }, 4200);
  };

  const rate = (score) => {
    recordMental(winner.id, code, occasion, score);
    setSaved(`حُفظ: ${winner.name} – حساب ذهني ${occasion} (${code}) = ${score}/3`);
    sfx('star');
  };

  return (
    <div className="card">
      <SectionTitle icon="🎡" action={<label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" className="h-5 w-5" checked={exclude} onChange={(e) => setExclude(e.target.checked)} /> استبعاد من سُحب (عدالة الحوار)</label>}>
        عجلة السحب العشوائي
      </SectionTitle>
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1 text-4xl">🔻</div>
          <svg viewBox="-110 -110 220 220" width="340" height="340" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.15,.85,.2,1)' : 'none' }}>
            {roster.map((s, i) => {
              const a0 = ((i * slice - 90) * Math.PI) / 180;
              const a1 = (((i + 1) * slice - 90) * Math.PI) / 180;
              const mid = ((i + 0.5) * slice - 90);
              const used = drawn.includes(s.id) && exclude;
              return (
                <g key={s.id}>
                  <path d={`M0 0 L${100 * Math.cos(a0)} ${100 * Math.sin(a0)} A100 100 0 0 1 ${100 * Math.cos(a1)} ${100 * Math.sin(a1)}Z`} fill={used ? '#cbd5e1' : SLICE_COLORS[i % SLICE_COLORS.length]} stroke="#fff" strokeWidth="0.6" />
                  <text transform={`rotate(${mid}) translate(58 0)`} fontSize="6.2" fontWeight="800" fill="#fff" textAnchor="middle" dominantBaseline="middle">
                    {s.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
            <circle r="16" fill="#fff" stroke="#d97706" strokeWidth="3" />
          </svg>
        </div>
        <div className="flex flex-1 flex-col items-center gap-3">
          <button className="btn-amber text-2xl" onClick={spin} disabled={spinning || !pool.length}>
            {pool.length ? '🎯 أدر العجلة' : 'سُحبت كل الأسماء'}
          </button>
          {!pool.length && <button className="btn-ghost" onClick={() => setDrawn([])}>↺ إعادة جميع الأسماء</button>}
          {winner && (
            <div className="flex w-full animate-pop flex-col items-center gap-2 rounded-3xl bg-amber-50 p-4 ring-4 ring-amber-brand">
              <Avatar student={winner} size={96} />
              <div className="text-3xl font-black text-oman-800">{winner.name}</div>
              <div className="w-full rounded-2xl bg-white p-3">
                <div className="mb-2 text-sm font-black text-oman-700">رصد سريع – الحساب الذهني (٣ درجات × ٣ مرات)</div>
                <div className="flex flex-wrap items-center gap-2">
                  <select className="rounded-xl border-2 border-oman-100 p-2 font-bold" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr">
                    {MENTAL.map((m) => (
                      <option key={m.code} value={m.code} title={m.ar}>
                        {m.code}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((o) => (
                      <button key={o} className={occasion === o ? 'btn-primary !min-h-10' : 'btn-ghost !min-h-10'} onClick={() => setOccasion(o)}>
                        الرصد {toAr(o)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="my-2 text-xs text-oman-600">{MENTAL.find((m) => m.code === code)?.ar}</p>
                <div className="flex gap-2">
                  {[1, 2, 3].map((sc) => (
                    <button key={sc} className="btn flex-1 bg-oman-100 text-2xl text-oman-800 hover:bg-oman-300" onClick={() => rate(sc)}>
                      {sc}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">لا تُمنح درجة صفر عند تنفيذ الأداة (الحد الأدنى ١).</p>
                {saved && <p className="mt-2 text-sm font-bold text-green-700">✅ {saved}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ مؤقت المجموعات
function GroupTimer() {
  const [mins, setMins] = useState(3);
  const [left, setLeft] = useState(180);
  const [running, setRunning] = useState(false);
  const total = useRef(180);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setRunning(false);
          sfx('alarm');
          setTimeout(() => sfx('alarm'), 1200);
          speak('انتهى الوقت، أحسنتم يا مجموعات');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const setM = (m) => {
    setMins(m);
    total.current = m * 60;
    setLeft(m * 60);
    setRunning(false);
  };

  const pct = total.current ? left / total.current : 0;
  const R = 80;
  const C = 2 * Math.PI * R;

  return (
    <div className="card">
      <SectionTitle icon="⏳">مؤقت المجموعات</SectionTitle>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((m) => (
            <button key={m} className={mins === m ? 'btn-primary !min-h-10 !min-w-10' : 'btn-ghost !min-h-10 !min-w-10'} onClick={() => setM(m)}>
              {toAr(m)}
            </button>
          ))}
          <span className="self-center text-sm font-bold">دقائق</span>
        </div>
        <svg viewBox="0 0 200 200" width="230" height="230">
          <circle cx="100" cy="100" r={R} fill="#f0f7f8" stroke="#d4ecf0" strokeWidth="18" />
          <circle cx="100" cy="100" r={R} fill="none" stroke={left < 30 ? '#dc2626' : '#d97706'} strokeWidth="18" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 100 100)" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x="100" y="115" textAnchor="middle" fontSize="44" fontWeight="900" fill="#082f39">
            {toAr(Math.floor(left / 60))}:{toAr(String(left % 60).padStart(2, '0'))}
          </text>
        </svg>
        <div className="flex gap-2">
          <button className="btn-amber text-xl" onClick={() => { if (left === 0) setLeft(total.current); setRunning((r) => !r); sfx('tap'); }}>
            {running ? '⏸ إيقاف مؤقت' : '▶ ابدأ'}
          </button>
          <button className="btn-ghost" onClick={() => setM(mins)}>↺</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ عارض تذاكر الخروج اللحظي
function ExitViewer() {
  const { state } = useApp();
  const [lessonId, setLessonId] = useState('all');
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);
  const names = useMemo(() => Object.fromEntries(state.roster.map((s) => [s.id, s])), [state.roster]);
  const list = state.exitLog.filter((e) => lessonId === 'all' || e.lessonId === Number(lessonId)).slice(0, 60);
  const dist = [1, 2, 3, 4, 5].map((sc) => list.filter((e) => e.score === sc).length);
  const maxD = Math.max(1, ...dist);
  const ago = (ts) => {
    const m = Math.round((now - ts) / 60000);
    if (m < 1) return 'الآن';
    if (m < 60) return `قبل ${m} د`;
    const h = Math.round(m / 60);
    if (h < 24) return `قبل ${h} س`;
    return `قبل ${Math.round(h / 24)} يوم`;
  };

  return (
    <div className="card">
      <SectionTitle
        icon="🎟️"
        action={
          <select className="rounded-xl border-2 border-oman-100 p-2 font-bold" value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
            <option value="all">كل المحطات</option>
            {LESSONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}. {l.title}
              </option>
            ))}
          </select>
        }
      >
        عارض نتائج تذاكر الخروج اللحظي
      </SectionTitle>
      <div className="mb-4 flex h-32 items-end justify-center gap-4">
        {dist.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-sm font-black">{d}</span>
            <div className="w-12 rounded-t-xl transition-all" style={{ height: `${(d / maxD) * 90}px`, background: i >= 3 ? '#22c55e' : i === 2 ? '#facc15' : '#ef4444' }} />
            <span className="text-sm font-bold">{toAr(i + 1)}/٥</span>
          </div>
        ))}
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-oman-600">
              <th className="p-1 text-start">التلميذ</th>
              <th className="p-1 text-start">المحطة</th>
              <th className="p-1">الدرجة</th>
              <th className="p-1">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e, i) => (
              <tr key={i} className="border-t border-oman-50">
                <td className="p-1">
                  <div className="flex items-center gap-1">
                    <Avatar student={names[e.sid]} size={24} />
                    <span className="font-bold">{names[e.sid]?.name}</span>
                  </div>
                </td>
                <td className="p-1">{getLesson(e.lessonId)?.icon} {e.lessonId}</td>
                <td className="p-1 text-center">
                  <span className={`rounded-full px-2 font-black ${e.score >= 4 ? 'bg-green-100 text-green-800' : e.score === 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-rose-100 text-rose-800'}`}>
                    {e.score}/{e.max}
                  </span>
                </td>
                <td className="p-1 text-center text-xs text-slate-500">{ago(e.ts)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-oman-300">
                  لا توجد تذاكر بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ClassroomLive() {
  const enterBoard = () => document.documentElement.requestFullscreen?.().catch(() => {});
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-black text-oman-800">الحقيبة الصفية الحية – وضع السبورة الذكية</h1>
        <button className="btn-ghost" onClick={enterBoard}>🖥️ ملء الشاشة</button>
      </div>
      <NameWheel />
      <div className="grid gap-4 lg:grid-cols-2">
        <GroupTimer />
        <ExitViewer />
      </div>
    </div>
  );
}
