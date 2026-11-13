import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { Modal, SpeakButton } from '../components/ui/index.jsx';
import { speak, sfx } from '../utils/speech.js';

const WELCOME = 'أهلاً بك يا بطل الرياضيات، اختر صورتك لنبدأ الرحلة!';

/** رمز QR زخرفي (محاكاة) مشتق من معرّف التلميذ */
function FakeQR({ id, size = 84 }) {
  const cells = useMemo(() => {
    let h = 7;
    for (const c of id) h = (h * 131 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: 121 }, (_, i) => {
      h = (h * 1103515245 + 12345) >>> 0;
      return (h >> 16) % 2 === 0 || i === 0;
    });
  }, [id]);
  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="3" height="3" fill="#000" />
      <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" fill="#fff" />
      <rect x={x + 1.1} y={y + 1.1} width="0.8" height="0.8" fill="#000" />
    </g>
  );
  return (
    <svg viewBox="0 0 11 11" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      <rect width="11" height="11" fill="#fff" />
      {cells.map((on, i) => (on ? <rect key={i} x={i % 11} y={Math.floor(i / 11)} width="1" height="1" fill="#0f172a" /> : null))}
      {finder(0, 0)}
      {finder(8, 0)}
      {finder(0, 8)}
    </svg>
  );
}

export default function Login() {
  const { state, login } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const [role, setRole] = useState(params.get('role') || null);
  const [scan, setScan] = useState(false);
  const [scanning, setScanning] = useState(null);
  const next = params.get('next');

  useEffect(() => {
    if (role === 'student') speak(WELCOME);
  }, [role]);

  const enter = (r, sid = null) => {
    sfx('success');
    login(r, sid);
    const fallback = r === 'student' ? '/student/map' : r === 'teacher' ? '/teacher/dashboard' : '/parent/overview';
    nav(next && next.startsWith(`/${r}`) ? next : fallback);
  };

  const presentQR = (s) => {
    setScanning(s);
    sfx('whoosh');
    setTimeout(() => {
      setScan(false);
      setScanning(null);
      speak(`أهلاً ${s.name.split(' ')[0]}`);
      enter('student', s.id);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-oman-700 via-oman-600 to-oman-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-col items-center gap-2 text-center text-white">
          <img src="./favicon.svg" alt="" className="h-20 w-20 rounded-3xl shadow-xl" />
          <h1 className="text-3xl font-black sm:text-4xl">رياضياتي</h1>
          <p className="text-lg font-bold text-oman-100">الرياضيات – الصف الأول الأساسي – الفصل الدراسي الأول · المنهج العماني</p>
        </header>

        {!role && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { r: 'student', icon: '🎒', t: 'تلميذ', d: 'ابدأ رحلة المغامرة العمانية', c: 'from-amber-400 to-amber-brand' },
              { r: 'teacher', icon: '👩‍🏫', t: 'معلمة', d: 'لوحة التحكم والتقويم والتحضير', c: 'from-oman-500 to-oman-800' },
              { r: 'parent', icon: '👨‍👩‍👧', t: 'ولي أمر', d: 'متابعة التقدم والواجبات المنزلية', c: 'from-emerald-400 to-emerald-700' }
            ].map((x) => (
              <button
                key={x.r}
                onClick={() => {
                  sfx('tap');
                  if (x.r === 'teacher') enter('teacher');
                  else setRole(x.r);
                }}
                className={`flex min-h-56 flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-br ${x.c} p-6 text-white shadow-2xl transition hover:-translate-y-1 active:scale-95`}
              >
                <span className="text-7xl drop-shadow">{x.icon}</span>
                <span className="text-3xl font-black">{x.t}</span>
                <span className="text-sm font-bold opacity-90">{x.d}</span>
              </button>
            ))}
          </div>
        )}

        {role && (
          <div className="card">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button className="btn-ghost" onClick={() => setRole(null)}>→ رجوع</button>
              {role === 'student' ? (
                <>
                  <SpeakButton text={WELCOME} />
                  <h2 className="flex-1 text-2xl font-black text-oman-700">اختر صورتك</h2>
                  <button className="btn-amber text-lg" onClick={() => setScan(true)}>📷 امسح بطاقتي (QR)</button>
                </>
              ) : (
                <h2 className="flex-1 text-2xl font-black text-oman-700">اختر اسم طفلك</h2>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
              {state.roster.map((s) => (
                <button key={s.id} onClick={() => enter(role, s.id)} className="flex flex-col items-center gap-1 rounded-3xl bg-oman-50 p-2 transition hover:bg-amber-50 hover:ring-4 hover:ring-amber-brand active:scale-95">
                  <Avatar student={s} size={76} />
                  <span className="text-center text-sm font-bold leading-tight text-oman-800">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm font-bold text-oman-700">يعمل التطبيق دون إنترنت بعد أول تحميل · تُحفظ البيانات على هذا الجهاز</p>
      </div>

      <Modal open={scan} onClose={() => { setScan(false); setScanning(null); }} title="مسح رمز QR (محاكاة)" wide>
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl bg-slate-900">
            {scanning ? <FakeQR id={scanning.id} size={150} /> : <span className="text-6xl">📷</span>}
            <div className="absolute inset-4 rounded-2xl border-4 border-dashed border-amber-300" />
            <div className="absolute inset-x-4 h-1 animate-bounce bg-red-500 shadow-[0_0_12px_red]" style={{ top: '50%' }} />
          </div>
          <p className="font-bold text-oman-700">{scanning ? `تمت قراءة بطاقة ${scanning.name}...` : 'قرّب بطاقتك من الكاميرا (المس بطاقتك)'}</p>
          <div className="grid max-h-72 grid-cols-3 gap-2 overflow-auto sm:grid-cols-6">
            {state.roster.map((s) => (
              <button key={s.id} onClick={() => presentQR(s)} disabled={Boolean(scanning)} className="flex flex-col items-center rounded-xl bg-white p-1 shadow ring-1 ring-oman-100">
                <FakeQR id={s.id} size={64} />
                <span className="text-[11px] font-bold">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
