import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp, useStudent, isUnlocked } from '../../context/AppContext.jsx';
import { getUnit, lessonsOfUnit } from '../../data/index.js';
import { SpeakButton, Stars } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

export default function UnitPage() {
  const { id } = useParams();
  const { state } = useApp();
  const { progress } = useStudent();
  const nav = useNavigate();
  const unit = getUnit(id);
  if (!unit) return <p className="card">الوحدة غير موجودة.</p>;
  const lessons = lessonsOfUnit(unit.id);
  const desert = unit.theme === 'desert';

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-[2rem] p-5 text-white shadow-lg ${desert ? 'bg-gradient-to-l from-amber-500 to-orange-700' : 'bg-gradient-to-l from-oman-600 to-oman-800'}`}>
        <Link to="/student/map" className="btn bg-white/20 text-white">→ الخريطة</Link>
        <SpeakButton text={`${unit.title}. ${unit.stage}. اختر محطة متاحة لتبدأ.`} auto />
        <div className="flex-1">
          <div className="text-sm font-bold opacity-90">{unit.stage}</div>
          <h1 className="text-2xl font-black sm:text-3xl">{unit.title}</h1>
          <div className="text-sm opacity-90">كتاب التلميذ ص {toAr(unit.pages[0])}–{toAr(unit.pages[1])}</div>
        </div>
        <span className="text-6xl">{desert ? '🐪' : '⛰️'}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => {
          const lp = progress.lessons?.[l.id];
          const unlocked = isUnlocked(state, progress, l.id);
          const done = lp?.completed;
          const status = done ? 'completed' : unlocked ? 'available' : 'locked';
          const styles = {
            completed: 'bg-green-50 ring-4 ring-green-400',
            available: 'bg-white ring-4 ring-amber-brand animate-float',
            locked: 'bg-slate-100 opacity-70 ring-2 ring-slate-200'
          }[status];
          return (
            <button
              key={l.id}
              onClick={() => {
                if (!unlocked) {
                  sfx('error');
                  speak('هذه المحطة مغلقة. أكمل المحطة السابقة أولاً');
                  return;
                }
                sfx('tap');
                nav(`/student/lesson/${l.id}`);
              }}
              className={`relative flex min-h-44 flex-col gap-2 rounded-[1.75rem] p-4 text-start shadow transition hover:-translate-y-1 ${styles}`}
              aria-label={`المحطة ${l.id}: ${l.title} – ${status === 'completed' ? 'مكتملة' : status === 'available' ? 'متاحة' : 'مغلقة'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white ${done ? 'bg-green-600' : unlocked ? 'bg-amber-brand' : 'bg-slate-400'}`}>
                  {toAr(l.id)}
                </span>
                <span className="text-5xl">{unlocked ? l.icon : '🔒'}</span>
              </div>
              <div className="text-lg font-black leading-snug text-oman-900">{l.title}</div>
              <div className="text-sm font-bold text-oman-600">
                📍 {l.place} · ص {toAr(l.pages[0])}–{toAr(l.pages[1])}
              </div>
              <div className="mt-auto flex items-center justify-between">
                {done ? <Stars n={lp.stars} /> : <span className="text-sm font-bold text-slate-500">{unlocked ? '▶ ابدأ' : 'مغلقة'}</span>}
                {lp?.exit && <span className="chip">تذكرة: {toAr(lp.exit.score)}/{toAr(lp.exit.max)}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
