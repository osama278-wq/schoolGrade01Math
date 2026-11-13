import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp, useStudent } from '../context/AppContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { toAr } from '../utils/arabic.js';
import { isMuted, setMuted, sfx } from '../utils/speech.js';

const LINKS = [
  { to: '/student/map', icon: '🗺️', label: 'الخريطة' },
  { to: '/student/lab', icon: '🧪', label: 'المختبر الحسي' },
  { to: '/student/arcade', icon: '🎮', label: 'ساحة الألعاب' },
  { to: '/student/portfolio', icon: '🏅', label: 'ملف الإنجاز' }
];

export default function StudentLayout() {
  const { logout } = useApp();
  const { student, progress } = useStudent();
  const nav = useNavigate();
  const [muted, setM] = useState(isMuted());
  const stars = Object.values(progress.lessons || {}).reduce((a, l) => a + (l.stars || 0), 0);

  return (
    <div className="min-h-screen bg-oman-50">
      <header className="app-header sticky top-0 z-30 bg-oman-700 text-white shadow-lg no-print">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <Avatar student={student} size={52} className="ring-4 ring-white/40" />
            <div className="leading-tight">
              <div className="text-lg font-extrabold">{student?.name}</div>
              <div className="text-xs text-oman-100">بطل الرياضيات</div>
            </div>
          </div>
          <div className="mx-2 flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-lg font-black" title="النجوم">⭐ {toAr(stars)}</span>
            <span className="rounded-full bg-amber-brand px-3 py-1 text-lg font-black" title="النقاط">💎 {toAr(progress.points || 0)}</span>
          </div>
          <nav className="flex flex-1 flex-wrap justify-end gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => sfx('tap')}
                className={({ isActive }) => `flex min-h-12 items-center gap-1 rounded-2xl px-3 font-bold transition ${isActive ? 'bg-white text-oman-700' : 'hover:bg-white/15'}`}
              >
                <span className="text-2xl" aria-hidden="true">{l.icon}</span>
                <span className="hidden md:inline">{l.label}</span>
              </NavLink>
            ))}
            <button
              className="min-h-12 min-w-12 rounded-2xl text-2xl hover:bg-white/15"
              onClick={() => {
                setMuted(!muted);
                setM(!muted);
              }}
              aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              title={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              className="min-h-12 min-w-12 rounded-2xl text-2xl hover:bg-white/15"
              onClick={() => {
                logout();
                nav('/login');
              }}
              aria-label="خروج"
              title="خروج"
            >
              🚪
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-3 sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}
