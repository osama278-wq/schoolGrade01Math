import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp, useStudent } from '../../context/AppContext.jsx';
import { HOMEWORK, LESSONS, SKILLS, getLesson } from '../../data/index.js';
import QuestionRunner from '../../components/lesson/QuestionRunner.jsx';
import { SectionTitle, FeedbackFace, Confetti } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

/** بنك أسئلة المهارة: كل الأسئلة الموسومة بها، من الأسهل إلى الأصعب */
function remedialBank(skill) {
  const rank = { easy: 0, medium: 1, challenge: 2 };
  const qs = [];
  LESSONS.forEach((l) => {
    l.practice.filter((q) => q.skill === skill).forEach((q) => qs.push(q));
    l.exitTicket.items.filter((q) => q.skill === skill).forEach((q) => qs.push({ ...q, points: undefined, level: 'medium' }));
  });
  HOMEWORK.forEach((h) => h.questions.filter((q) => q.skill === skill).forEach((q) => qs.push({ ...q, level: 'easy' })));
  return qs.sort((a, b) => (rank[a.level] ?? 1) - (rank[b.level] ?? 1)).slice(0, 5);
}

export default function ParentHomework() {
  const { recordHomework, recordRemedial } = useApp();
  const { sid, student, progress } = useStudent();
  const loc = useLocation();
  const [active, setActive] = useState(null); // { kind: 'hw'|'remedial', id }
  const [result, setResult] = useState(null);

  const weak = useMemo(
    () =>
      Object.entries(progress.skillErrors || {})
        .filter(([, n]) => n >= 3)
        .map(([k, n]) => ({ key: k, n, ...SKILLS[k] }))
        .sort((a, b) => b.n - a.n),
    [progress.skillErrors]
  );

  useEffect(() => {
    if (loc.hash === '#remedial') document.getElementById('remedial')?.scrollIntoView({ behavior: 'smooth' });
  }, [loc.hash]);

  if (active) {
    const hw = active.kind === 'hw' ? HOMEWORK.find((h) => h.id === active.id) : null;
    const questions = hw ? hw.questions : remedialBank(active.id);
    const title = hw ? hw.title : `تدريب علاجي: ${SKILLS[active.id]?.label}`;

    if (result) {
      return (
        <div className="card flex flex-col items-center gap-3 py-8 text-center">
          <Confetti show={result.final === result.max} />
          <FeedbackFace kind={result.final >= result.max - 1 ? 'good' : 'bad'} />
          <h2 className="text-3xl font-black text-oman-700">
            {hw ? `الدرجة: ${toAr(result.final)} من ${toAr(result.max)}` : `أجبت عن ${toAr(result.solved)} من ${toAr(result.total)}`}
          </h2>
          <p className="font-bold text-oman-600">{hw ? '✅ أُرسلت الدرجة إلى سجل المعلمة' : 'أحسنت! كل إجابة صحيحة تقلّل من احتياج المهارة للدعم.'}</p>
          <button className="btn-primary" onClick={() => { setActive(null); setResult(null); }}>
            العودة إلى القائمة
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setActive(null)}>→ رجوع</button>
          <h2 className="text-xl font-black text-oman-800">{title}</h2>
        </div>
        <div className="rounded-[2rem] bg-white p-4 shadow">
          <QuestionRunner
            questions={questions}
            mode={hw ? 'homework' : 'practice'}
            onFinish={(r) => {
              if (hw) {
                const final = recordHomework(sid, hw.id, { score: r.solved, max: 5, skillErrors: r.skillErrors });
                setResult({ ...r, final, max: 5 });
                sfx('celebrate');
                speak(`انتهى الواجب. درجتك ${final} من خمسة`);
              } else {
                r.results.forEach((x) => recordRemedial(sid, active.id, x.correct));
                setResult({ ...r, final: r.solved, max: r.total });
                sfx('success');
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black text-oman-800">الواجبات المنزلية الإلكترونية – {student?.name}</h1>
      <p className="text-sm font-bold text-oman-600">
        وفق وثيقة التقويم: ٤ واجبات للمعرفة والفهم + واجب واحد لحل المشكلات (٥ درجات لكل منها). التصحيح آلي مع تغذية راجعة فورية بالوجوه المبتسمة، وتُرحَّل الدرجة إلى سجل المعلمة.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {HOMEWORK.map((h) => {
          const r = progress.homework?.[h.id];
          return (
            <div key={h.id} className={`card flex flex-col gap-2 ${r ? 'bg-green-50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-black text-oman-800">{h.title}</div>
                  <div className="text-sm text-oman-600">
                    {h.domain === 'problem' ? 'حل المشكلات' : 'المعرفة والفهم'} · المحطات: {h.lessons.map((id) => getLesson(id).icon).join(' ')}
                  </div>
                </div>
                {r ? <span className="chip !bg-green-200 !text-green-900">😀 {toAr(r.score)}/{toAr(r.max)}</span> : <span className="chip !bg-amber-100 !text-amber-800">بانتظار الحل</span>}
              </div>
              <button className={r ? 'btn-ghost' : 'btn-amber'} onClick={() => { setActive({ kind: 'hw', id: h.id }); setResult(null); }}>
                {r ? '↺ أعد المحاولة' : '▶ ابدأ الواجب'}
              </button>
            </div>
          );
        })}
      </div>

      <div id="remedial" className="card">
        <SectionTitle icon="🧭">المسار العلاجي التكيفي</SectionTitle>
        {weak.length === 0 ? (
          <p className="font-bold text-green-700">لا توجد مهارات تحتاج إلى دعم حالياً. أحسنت! 🎉</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {weak.map((w) => (
              <div key={w.key} className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3">
                <span className="text-3xl">{getLesson(w.lesson)?.icon}</span>
                <div className="flex-1">
                  <div className="font-black text-amber-900">{w.label}</div>
                  <div className="text-xs font-bold text-amber-800">
                    أخطاء متكررة: {toAr(w.n)} · المهارة التأسيسية من المحطة {toAr(w.lesson)}
                  </div>
                </div>
                <button className="btn-amber" onClick={() => { setActive({ kind: 'remedial', id: w.key }); setResult(null); }}>
                  تدرّب
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
