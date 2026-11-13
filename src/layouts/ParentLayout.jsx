import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp, useStudent } from '../context/AppContext.jsx';
import Avatar from '../components/ui/Avatar.jsx';

export default function ParentLayout() {
  const { logout } = useApp();
  const { student } = useStudent();
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-oman-50">
      <header className="app-header sticky top-0 z-30 bg-white shadow no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-3 py-2">
          <Avatar student={student} size={48} />
          <div className="leading-tight">
            <div className="text-xs text-oman-600">بوابة ولي الأمر · متابعة</div>
            <div className="text-lg font-extrabold text-oman-800">{student?.name}</div>
          </div>
          <nav className="flex flex-1 flex-wrap justify-end gap-1">
            {[
              ['/parent/overview', '📈 تقدّم طفلي'],
              ['/parent/homework', '📚 الواجبات والمسار العلاجي']
            ].map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-12 items-center rounded-xl px-3 font-bold ${isActive ? 'bg-oman-700 text-white' : 'text-oman-700 hover:bg-oman-50'}`}>
                {label}
              </NavLink>
            ))}
            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              خروج
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-3 sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}
