import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { pendingSyncCount } from '../utils/storage.js';
import { toAr } from '../utils/arabic.js';

const LINKS = [
  { to: '/teacher/dashboard', icon: '📊', label: 'لوحة التحكم' },
  { to: '/teacher/classroom-live', icon: '🎡', label: 'الحقيبة الصفية' },
  { to: '/teacher/planner', icon: '📝', label: 'التحضير وأوراق العمل' },
  { to: '/teacher/assessment', icon: '📋', label: 'سجل التقويم' },
  { to: '/teacher/rewards', icon: '🏆', label: 'التكريم' }
];

export function OnlineBadge() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    pendingSyncCount().then(setPending);
    const t = setInterval(() => pendingSyncCount().then(setPending), 15000);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      clearInterval(t);
    };
  }, []);
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${online ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`} title="البيانات محفوظة محلياً على هذا الجهاز">
      {online ? '● متصل' : '● دون اتصال'} · بانتظار المزامنة: {toAr(pending)}
    </span>
  );
}

export default function TeacherLayout() {
  const { state, logout } = useApp();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 print:min-h-0 print:bg-white">
      <header className="app-header sticky top-0 z-30 border-b-4 border-amber-brand bg-oman-800 text-white no-print">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2">
          <div className="me-3">
            <div className="text-lg font-extrabold">بوابة المعلمة</div>
            <div className="text-xs text-oman-100">
              {state.settings.className} · {state.settings.school}
            </div>
          </div>
          <nav className="flex flex-1 flex-wrap gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex min-h-12 items-center gap-1 rounded-xl px-3 text-sm font-bold ${isActive ? 'bg-white text-oman-800' : 'hover:bg-white/10'}`}>
                <span aria-hidden="true">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <OnlineBadge />
          <button
            className="btn min-h-12 bg-white/10 text-sm hover:bg-white/20"
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            خروج
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-3 sm:p-5 print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
