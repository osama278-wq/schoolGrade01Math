import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getItem, setItem, enqueueSync } from '../utils/storage.js';
import { buildDemoState, blankState, emptyStudentProgress, getLesson, starsFromAccuracy, HOMEWORK } from '../data/index.js';
import { toolScore, FIELD_BY_ID } from '../data/assessment.js';

const AppContext = createContext(null);
const STATE_KEY = 'state-v1';

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const saveTimer = useRef(null);

  // تحميل الحالة من IndexedDB (أو إنشاء بيانات تجريبية في أول تشغيل)
  useEffect(() => {
    let alive = true;
    getItem(STATE_KEY).then((saved) => {
      if (!alive) return;
      setState(saved && saved.version === 1 ? saved : buildDemoState());
    });
    return () => {
      alive = false;
    };
  }, []);

  // حفظ مؤجّل لتقليل عمليات الكتابة
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setItem(STATE_KEY, state), 350);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  const update = useCallback((fn) => setState((s) => (s ? fn(structuredClone(s)) : s)), []);

  const ensure = (s, sid) => {
    if (!s.progress[sid]) s.progress[sid] = emptyStudentProgress();
    if (!s.assessment[sid]) s.assessment[sid] = {};
    if (!s.manual[sid]) s.manual[sid] = {};
    return s.progress[sid];
  };

  /** كتابة تلقائية في السجل ما لم تعدّلها المعلمة يدوياً */
  const autoFill = (s, sid, fieldId, value) => {
    if (!fieldId || !FIELD_BY_ID[fieldId]) return;
    if (s.manual[sid]?.[fieldId]) return;
    s.assessment[sid][fieldId] = toolScore(value, FIELD_BY_ID[fieldId].max);
  };

  const actions = useMemo(
    () => ({
      login(role, studentId = null) {
        update((s) => {
          s.session = { role, studentId };
          return s;
        });
      },
      logout() {
        update((s) => {
          s.session = { role: null, studentId: null };
          return s;
        });
      },
      updateSettings(patch) {
        update((s) => {
          s.settings = { ...s.settings, ...patch };
          return s;
        });
      },
      recordPractice(sid, lessonId, { correct, total, skillErrors = {} }) {
        update((s) => {
          const p = ensure(s, sid);
          const prev = p.lessons[lessonId] || {};
          const stars = starsFromAccuracy(correct, total);
          p.lessons[lessonId] = {
            ...prev,
            completed: true,
            stars: Math.max(prev.stars || 0, stars),
            practice: !prev.practice || correct / total >= prev.practice.correct / prev.practice.total ? { correct, total } : prev.practice
          };
          for (const [sk, n] of Object.entries(skillErrors)) p.skillErrors[sk] = (p.skillErrors[sk] || 0) + n;
          // نجاح المهارة يخفف عدّاد الأخطاء (المسار العلاجي التكيفي)
          if (correct === total) for (const sk of getLesson(lessonId)?.skills || []) p.skillErrors[sk] = Math.max(0, (p.skillErrors[sk] || 0) - 2);
          p.points += correct * 10;
          return s;
        });
      },
      recordExit(sid, lessonId, { score, max, skillErrors = {} }) {
        const finalScore = toolScore(score, max);
        update((s) => {
          const p = ensure(s, sid);
          const prev = p.lessons[lessonId] || {};
          p.lessons[lessonId] = { ...prev, exit: { score: finalScore, max, ts: Date.now() } };
          for (const [sk, n] of Object.entries(skillErrors)) p.skillErrors[sk] = (p.skillErrors[sk] || 0) + n;
          p.points += finalScore * 10;
          s.exitLog.unshift({ sid, lessonId, score: finalScore, max, ts: Date.now() });
          s.exitLog = s.exitLog.slice(0, 400);
          autoFill(s, sid, getLesson(lessonId)?.exitTicket.slot, finalScore);
          return s;
        });
        enqueueSync('exit', { sid, lessonId, score: finalScore, max });
        return finalScore;
      },
      recordHomework(sid, hwId, { score, max, skillErrors = {} }) {
        const finalScore = toolScore(score, max);
        update((s) => {
          const p = ensure(s, sid);
          p.homework[hwId] = { score: finalScore, max, ts: Date.now() };
          for (const [sk, n] of Object.entries(skillErrors)) p.skillErrors[sk] = (p.skillErrors[sk] || 0) + n;
          p.points += finalScore * 10;
          autoFill(s, sid, HOMEWORK.find((h) => h.id === hwId)?.slot, finalScore);
          return s;
        });
        enqueueSync('homework', { sid, hwId, score: finalScore, max });
        return finalScore;
      },
      recordRemedial(sid, skill, correct) {
        update((s) => {
          const p = ensure(s, sid);
          if (correct) p.skillErrors[skill] = Math.max(0, (p.skillErrors[skill] || 0) - 1);
          p.points += correct ? 5 : 0;
          return s;
        });
      },
      recordArcade(sid, gameId, score) {
        update((s) => {
          const p = ensure(s, sid);
          p.arcadeBest[gameId] = Math.max(p.arcadeBest[gameId] || 0, score);
          p.points += score;
          return s;
        });
      },
      setAssessment(sid, fieldId, value) {
        update((s) => {
          ensure(s, sid);
          if (value === null) delete s.assessment[sid][fieldId];
          else s.assessment[sid][fieldId] = value;
          s.manual[sid][fieldId] = true;
          return s;
        });
        enqueueSync('assessment', { sid, fieldId, value });
      },
      recordMental(sid, code, occasion, score) {
        update((s) => {
          ensure(s, sid);
          const fieldId = `dlgM${occasion}`;
          s.assessment[sid][fieldId] = toolScore(score, 3);
          s.manual[sid][fieldId] = true;
          s.mentalLog.unshift({ sid, code, occasion, score: toolScore(score, 3), ts: Date.now() });
          s.mentalLog = s.mentalLog.slice(0, 300);
          return s;
        });
      },
      addPortfolio(sid, item) {
        update((s) => {
          const p = ensure(s, sid);
          p.portfolio.unshift({ id: `pf-${Date.now()}`, ts: Date.now(), ...item });
          return s;
        });
      },
      removePortfolio(sid, itemId) {
        update((s) => {
          const p = ensure(s, sid);
          p.portfolio = p.portfolio.filter((x) => x.id !== itemId);
          return s;
        });
      },
      renameStudent(sid, name) {
        update((s) => {
          s.roster = s.roster.map((r) => (r.id === sid ? { ...r, name } : r));
          return s;
        });
      },
      resetDemo() {
        const fresh = buildDemoState();
        setState((s) => ({ ...fresh, session: s?.session || fresh.session }));
      },
      clearAll() {
        setState((s) => ({ ...blankState(s?.roster), session: s?.session || { role: null, studentId: null } }));
      },
      importState(obj) {
        if (obj && obj.version === 1 && obj.progress && obj.assessment) setState(obj);
        else throw new Error('ملف غير صالح');
      }
    }),
    [update]
  );

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-oman-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-8 border-oman-100 border-t-amber-brand" />
          <p className="text-xl font-bold text-oman-700">جارٍ تجهيز رحلتك...</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={{ state, ...actions }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/** التلميذ الحالي وتقدّمه */
export function useStudent() {
  const { state } = useApp();
  const sid = state.session.studentId || state.roster[0]?.id;
  const student = state.roster.find((r) => r.id === sid) || state.roster[0];
  const progress = state.progress[student?.id] || emptyStudentProgress();
  return { sid: student?.id, student, progress };
}

export function isUnlocked(state, progress, lessonId) {
  if (state.settings.unlockAll || lessonId === 1) return true;
  return Boolean(progress.lessons?.[lessonId - 1]?.completed);
}
