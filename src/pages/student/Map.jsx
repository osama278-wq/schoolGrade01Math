import { Link, useNavigate } from 'react-router-dom';
import { useApp, useStudent, isUnlocked } from '../../context/AppContext.jsx';
import { LESSONS, UNITS } from '../../data/index.js';
import { SpeakButton, Stars, ProgressBar } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

// مواقع المحطات على الخريطة (الرحلة تبدأ من اليمين: جبال الحجر ← مطرح ← الشرقية ← صلالة)
const POS = {
  1: [905, 540],
  2: [800, 490],
  3: [890, 400],
  4: [775, 345],
  5: [880, 255],
  6: [760, 205],
  7: [655, 125],
  8: [545, 165],
  9: [630, 265],
  10: [520, 330],
  11: [405, 390],
  12: [285, 320],
  13: [195, 430],
  14: [95, 535]
};

function pathD() {
  const pts = LESSONS.map((l) => POS[l.id]);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2 + (i % 2 ? 30 : -30);
    const cy = (y0 + y1) / 2 + (i % 2 ? -20 : 20);
    d += ` Q${cx} ${cy} ${x1} ${y1}`;
  }
  return d;
}

export default function StudentMap() {
  const { state } = useApp();
  const { student, progress } = useStudent();
  const nav = useNavigate();
  const intro = `مرحباً ${student?.name?.split(' ')[0] || ''}! هذه خريطة رحلتك العمانية. المرحلة الأولى في جبال الحجر وسواحل مطرح، والمرحلة الثانية في رمال الشرقية وواحات صلالة. المس المحطة المضيئة لتبدأ.`;

  const open = (l) => {
    if (isUnlocked(state, progress, l.id)) {
      sfx('tap');
      nav(`/student/lesson/${l.id}`);
    } else {
      sfx('error');
      speak('هذه المحطة مغلقة. أكمل المحطة السابقة أولاً');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SpeakButton text={intro} auto />
        <h1 className="text-2xl font-black text-oman-700 sm:text-3xl">خريطة المغامرة العمانية</h1>
      </div>

      <div className="overflow-hidden rounded-[2rem] shadow-xl ring-4 ring-white">
        <svg viewBox="0 0 1000 620" className="block w-full" role="img" aria-label="خريطة الرحلة" style={{ direction: 'ltr' }}>
          <defs>
            <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d6c3a5" />
              <stop offset="1" stopColor="#a3b18a" />
            </linearGradient>
            <linearGradient id="sand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fbe7b5" />
              <stop offset="1" stopColor="#e9c46a" />
            </linearGradient>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0e7490" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          {/* المرحلة الأولى: جبال الحجر وسواحل مطرح */}
          <rect x="470" y="0" width="530" height="620" fill="url(#mtn)" />
          <path d="M470 0 H1000 V70 C900 95 800 60 700 85 C620 105 540 70 470 90Z" fill="url(#sea)" />
          {[[560, 470], [690, 420], [960, 330], [700, 560], [980, 150]].map(([x, y], i) => (
            <path key={i} d={`M${x - 90} ${y + 50} L${x - 20} ${y - 50} L${x + 10} ${y - 20} L${x + 40} ${y - 70} L${x + 110} ${y + 50}Z`} fill={i % 2 ? '#8d7a5f' : '#a08b6b'} opacity="0.55" />
          ))}
          <text x="850" y="52" fontSize="34">⛵</text>
          <text x="600" y="48" fontSize="26">🐟</text>
          <text x="940" y="610" fontSize="30">🏔️</text>
          <text x="980" y="125" textAnchor="end" fontSize="22" fontWeight="900" fill="#082f39">سواحل مطرح</text>
          <text x="985" y="600" textAnchor="end" fontSize="22" fontWeight="900" fill="#3f3f1f">جبال الحجر</text>
          {/* المرحلة الثانية: رمال الشرقية وواحات صلالة */}
          <rect x="0" y="0" width="470" height="620" fill="url(#sand)" />
          {[[90, 140], [260, 90], [380, 210], [150, 260]].map(([x, y], i) => (
            <path key={i} d={`M${x - 120} ${y + 40} Q${x} ${y - 50} ${x + 120} ${y + 40}Z`} fill="#e0b25a" opacity="0.6" />
          ))}
          <path d="M0 470 C80 440 180 470 260 500 C320 520 380 560 470 560 V620 H0Z" fill="#4d9b6a" />
          <text x="40" y="590" fontSize="34">🌴</text>
          <text x="300" y="590" fontSize="30">🌴</text>
          <text x="400" y="610" fontSize="26">🌿</text>
          <text x="320" y="170" fontSize="34">🐪</text>
          <text x="20" y="40" fontSize="22" fontWeight="900" fill="#7c4a03">رمال الشرقية</text>
          <text x="20" y="460" fontSize="22" fontWeight="900" fill="#14532d">واحات صلالة</text>
          <line x1="470" y1="0" x2="470" y2="620" stroke="#fff" strokeWidth="4" strokeDasharray="14 10" opacity="0.7" />

          {/* مسار الرحلة */}
          <path d={pathD()} fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" opacity="0.85" />
          <path d={pathD()} fill="none" stroke="#d97706" strokeWidth="5" strokeDasharray="2 14" strokeLinecap="round" />

          {LESSONS.map((l) => {
            const [x, y] = POS[l.id];
            const lp = progress.lessons?.[l.id];
            const unlocked = isUnlocked(state, progress, l.id);
            const done = lp?.completed;
            const fill = done ? '#16a34a' : unlocked ? '#d97706' : '#94a3b8';
            return (
              <g key={l.id} onClick={() => open(l)} style={{ cursor: 'pointer' }} role="button" aria-label={`المحطة ${l.id}: ${l.title}`}>
                {unlocked && !done && <circle cx={x} cy={y} r="44" fill="#fbbf24" opacity="0.45" className="animate-pulse" />}
                <circle cx={x} cy={y} r="34" fill={fill} stroke="#fff" strokeWidth="6" />
                <text x={x} y={y + 11} textAnchor="middle" fontSize="30">
                  {unlocked ? l.icon : '🔒'}
                </text>
                <circle cx={x + 26} cy={y - 26} r="14" fill="#0f4c5c" stroke="#fff" strokeWidth="3" />
                <text x={x + 26} y={y - 20} textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff">
                  {toAr(l.id)}
                </text>
                {done && (
                  <text x={x} y={y + 56} textAnchor="middle" fontSize="16">
                    {'⭐'.repeat(lp.stars || 0)}
                  </text>
                )}
                <text x={x} y={y + (done ? 76 : 58)} textAnchor="middle" fontSize="14" fontWeight="800" fill="#082f39" stroke="#fff" strokeWidth="3" paintOrder="stroke">
                  {l.place}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {UNITS.map((u) => {
          const done = u.lessons.filter((id) => progress.lessons?.[id]?.completed).length;
          const stars = u.lessons.reduce((a, id) => a + (progress.lessons?.[id]?.stars || 0), 0);
          return (
            <Link key={u.id} to={`/student/unit/${u.id}`} className={`card flex items-center gap-4 transition hover:-translate-y-0.5 hover:ring-4 ${u.theme === 'desert' ? 'hover:ring-dune' : 'hover:ring-oman-300'}`}>
              <span className="text-6xl">{u.theme === 'desert' ? '🐪' : '⛰️'}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-amber-brand">{u.stage}</div>
                <div className="text-xl font-black text-oman-800">{u.title}</div>
                <div className="my-2">
                  <ProgressBar value={done} max={u.lessons.length} />
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-oman-600">
                  <span>
                    {toAr(done)} من {toAr(u.lessons.length)} محطات
                  </span>
                  <Stars n={Math.round(stars / u.lessons.length)} size="text-lg" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
