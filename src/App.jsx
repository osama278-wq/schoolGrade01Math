import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import TeacherLayout from './layouts/TeacherLayout.jsx';
import ParentLayout from './layouts/ParentLayout.jsx';
import StudentMap from './pages/student/Map.jsx';
import UnitPage from './pages/student/Unit.jsx';
import LessonPage from './pages/student/Lesson.jsx';
import Lab from './pages/student/Lab.jsx';
import Arcade from './pages/student/Arcade.jsx';
import Portfolio from './pages/student/Portfolio.jsx';
import Dashboard from './pages/teacher/Dashboard.jsx';
import ClassroomLive from './pages/teacher/ClassroomLive.jsx';
import Planner from './pages/teacher/Planner.jsx';
import Assessment from './pages/teacher/Assessment.jsx';
import Rewards from './pages/teacher/Rewards.jsx';
import ParentOverview from './pages/parent/Overview.jsx';
import ParentHomework from './pages/parent/Homework.jsx';

function RequireRole({ role, children }) {
  const { state } = useApp();
  const loc = useLocation();
  if (state.session.role !== role) return <Navigate to={`/login?role=${role}&next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/student"
        element={
          <RequireRole role="student">
            <StudentLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="map" replace />} />
        <Route path="map" element={<StudentMap />} />
        <Route path="unit/:id" element={<UnitPage />} />
        <Route path="lesson/:id" element={<LessonPage />} />
        <Route path="lab" element={<Lab />} />
        <Route path="arcade" element={<Arcade />} />
        <Route path="portfolio" element={<Portfolio />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <RequireRole role="teacher">
            <TeacherLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="classroom-live" element={<ClassroomLive />} />
        <Route path="planner" element={<Planner />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="rewards" element={<Rewards />} />
      </Route>

      <Route
        path="/parent"
        element={
          <RequireRole role="parent">
            <ParentLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ParentOverview />} />
        <Route path="homework" element={<ParentHomework />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
