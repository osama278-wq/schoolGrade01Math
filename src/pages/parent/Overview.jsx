import { Link } from 'react-router-dom';
import { useApp, useStudent } from '../../context/AppContext.jsx';
import { LESSONS, SKILLS, HOMEWORK, earnedBadges, BADGES, lessonMastery, getLesson } from '../../data/index.js';
import { ASSESSMENT_TOOLS, toolTotal, computeTotals } from '../../data/assessment.js';
import { Stars, ProgressBar, SectionTitle } from '../../components/ui/index.jsx';
import { toAr } from '../../utils/arabic.js';

export default function ParentOverview() {
  const { state } = useApp();
  const { sid, student, progress } = useStudent();
  const rec = state.assessment[sid] || {};
  const done = LESSONS.filter((l) => progress.lessons?.[l.id]?.completed);
  const stars = done.reduce((a, l) => a + (progress.lessons[l.id].stars || 0), 0);
  const weak = Object.entries(progress.skillErrors || {})
    .filter(([, n]) => n >= 3)
    .map(([k, n]) => ({ key: k, n, ...SKILLS[k] }))
    .sort((a, b) => b.n - a.n);
  const badges = earnedBadges(progress);
  const pendingHw = HOMEWORK.filter((h) => !progress.homework?.[h.id]).length;
  const totals = computeTotals(rec);
  const recentExits = state.exitLog.filter((e) => e.sid === sid).slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black text-oman-800">تقدّم {student?.name} في الرياضيات</h1>

      {weak.length > 0 && (
        <div className="card flex flex-wrap items-center gap-3 bg-amber-50 ring-4 ring-amber-brand">
          <span className="text-4xl">🧭</span>
          <div className="flex-1">
            <div className="text-lg font-black text-amber-900">المسار العلاجي التكيفي مُفعَّل</div>
            <div className="text-sm font-bold text-amber-800">رُصدت أخطاء متكررة في: {weak.map((w) => w.label).join('، ')}. نقترح تدريباً قصيراً قبل الانتقال للدرس التالي.</div>
          </div>
          <Link to="/parent/homework#remedial" className="btn-amber">ابدأ التدريب العلاجي</Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="text-sm font-bold text-oman-600">المحطات المنجزة</div>
          <div className="text-3xl font-black text-oman-800">
            {toAr(done.length)} / {toAr(LESSONS.length)}
          </div>
          <ProgressBar value={done.length} max={LESSONS.length} />
        </div>
        <div className="card">
          <div className="text-sm font-bold text-oman-600">النجوم</div>
          <div className="text-3xl font-black text-amber-brand">⭐ {toAr(stars)}</div>
        </div>
        <div className="card">
          <div className="text-sm font-bold text-oman-600">الأوسمة</div>
          <div className="text-3xl">{badges.length ? badges.map((b) => BADGES.find((x) => x.id === b)?.icon).join(' ') : '—'}</div>
        </div>
        <div className="card">
          <div className="text-sm font-bold text-oman-600">واجبات بانتظار الحل</div>
          <div className="text-3xl font-black text-oman-800">{toAr(pendingHw)}</div>
          <Link to="/parent/homework" className="text-sm font-bold text-amber-brand">
            إلى الواجبات ←
          </Link>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="✅">عبارات «أستطيع» – الفصل الدراسي الأول</SectionTitle>
        <div className="grid gap-2 md:grid-cols-2">
          {LESSONS.map((l) => {
            const lp = progress.lessons?.[l.id];
            const m = lessonMastery(lp);
            const status = m === null ? 'لم يبدأ بعد' : m >= 0.8 ? 'أتقن' : m >= 0.6 ? 'في طريقه للإتقان' : 'يحتاج إلى دعم';
            const cls = m === null ? 'bg-slate-50 text-slate-500' : m >= 0.8 ? 'bg-green-50 text-green-800' : m >= 0.6 ? 'bg-yellow-50 text-yellow-800' : 'bg-rose-50 text-rose-800';
            return (
              <div key={l.id} className={`rounded-2xl p-3 ${cls}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black">
                    {l.icon} {toAr(l.id)}. {l.title}
                  </span>
                  {lp?.completed && <Stars n={lp.stars} size="text-base" />}
                </div>
                <ul className="mt-1 text-sm">
                  {l.canDo.map((c) => (
                    <li key={c}>
                      {m !== null && m >= 0.8 ? '⭐' : '○'} {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-1 text-xs font-black">{status}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <SectionTitle icon="📋">ملخص التقويم المستمر</SectionTitle>
          <ul className="space-y-2">
            {ASSESSMENT_TOOLS.map((t) => (
              <li key={t.key} className="flex items-center gap-2">
                <span className="w-36 font-bold">{t.title}</span>
                <div className="flex-1">
                  <ProgressBar value={toolTotal(rec, t.key)} max={t.total} color="bg-oman-600" />
                </div>
                <span className="w-16 text-sm font-black">
                  {toAr(toolTotal(rec, t.key))}/{toAr(t.total)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            رُصدت {toAr(totals.filled)} من {toAr(totals.count)} خانات حتى الآن. الدرجات النهائية تعتمدها المعلمة.
          </p>
        </div>
        <div className="card">
          <SectionTitle icon="🎟️">آخر تذاكر الخروج</SectionTitle>
          {recentExits.length === 0 && <p className="text-slate-500">لا توجد بعد</p>}
          <ul className="space-y-2">
            {recentExits.map((e, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-oman-50 p-2">
                <span className="font-bold">
                  {getLesson(e.lessonId)?.icon} {getLesson(e.lessonId)?.title}
                </span>
                <span className="text-2xl">{e.score >= 4 ? '😀' : e.score === 3 ? '🙂' : '🤔'}</span>
                <span className="chip">
                  {toAr(e.score)}/{toAr(e.max)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
