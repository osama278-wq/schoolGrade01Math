import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { LESSONS, SKILLS, lessonMastery, masteryColor } from '../../data/index.js';
import { computeTotals, levelLabel } from '../../data/assessment.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { Modal, SectionTitle } from '../../components/ui/index.jsx';
import { downloadJSON } from '../../utils/storage.js';

function Stat({ icon, label, value, sub, color = 'bg-white' }) {
  return (
    <div className={`card flex items-center gap-3 ${color}`}>
      <span className="text-4xl">{icon}</span>
      <div>
        <div className="text-sm font-bold text-oman-600">{label}</div>
        <div className="text-3xl font-black text-oman-800">{value}</div>
        {sub && <div className="text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, updateSettings, resetDemo, clearAll, importState, renameStudent } = useApp();
  const [rosterOpen, setRosterOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const { roster, progress, assessment } = state;

  const data = useMemo(() => {
    const matrix = roster.map((s) => LESSONS.map((l) => lessonMastery(progress[s.id]?.lessons?.[l.id])));
    const colAvg = LESSONS.map((_, j) => {
      const vals = matrix.map((r) => r[j]).filter((v) => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });
    const colCount = LESSONS.map((_, j) => matrix.filter((r) => r[j] !== null).length);
    const skillGaps = Object.entries(SKILLS)
      .map(([k, s]) => {
        const struggling = roster.filter((st) => (progress[st.id]?.skillErrors?.[k] || 0) >= 3).length;
        return { key: k, ...s, struggling };
      })
      .filter((x) => x.struggling > 0)
      .sort((a, b) => b.struggling - a.struggling);
    const exits = state.exitLog.slice(0, 200);
    const exitAvg = exits.length ? exits.reduce((a, e) => a + e.score / e.max, 0) / exits.length : 0;
    const totals = roster.map((s) => computeTotals(assessment[s.id]));
    const atRisk = roster.filter((s) => {
      const vals = LESSONS.map((l) => lessonMastery(progress[s.id]?.lessons?.[l.id])).filter((v) => v !== null);
      return vals.length && vals.reduce((a, b) => a + b, 0) / vals.length < 0.6;
    });
    const suggested = LESSONS.find((l, j) => colCount[j] < roster.length * 0.7) || LESSONS[LESSONS.length - 1];
    return { matrix, colAvg, colCount, skillGaps, exitAvg, totals, atRisk, suggested };
  }, [roster, progress, assessment, state.exitLog]);

  const completedAvg = roster.length ? data.colCount.reduce((a, b) => a + b, 0) / roster.length : 0;

  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      importState(JSON.parse(await f.text()));
      setMsg('✅ تم استيراد النسخة الاحتياطية');
    } catch {
      setMsg('❌ الملف غير صالح');
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-oman-800">لوحة التحكم والخرائط الحرارية</h1>
          <p className="text-sm font-bold text-oman-600">
            {state.settings.className} · العام الدراسي {state.settings.academicYear}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/teacher/classroom-live" className="btn-amber">🎡 ابدأ الحصة</Link>
          <Link to={`/teacher/planner?lesson=${data.suggested.id}`} className="btn-primary">📝 تحضير درس اليوم</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="👧🏻" label="تلاميذ الشعبة" value={roster.length} sub="بيانات تجريبية قابلة للتعديل" />
        <Stat icon="🗺️" label="متوسط المحطات المنجزة" value={`${completedAvg.toFixed(1)} / ${LESSONS.length}`} />
        <Stat icon="🎟️" label="متوسط تذاكر الخروج" value={`${Math.round(data.exitAvg * 100)}%`} sub={`${state.exitLog.length} تذكرة مسجّلة`} />
        <Stat icon="🚩" label="بحاجة إلى دعم" value={data.atRisk.length} sub="متوسط إتقان أقل من ٦٠٪" color="bg-rose-50" />
      </div>

      <div className="card">
        <SectionTitle icon="🌡️" action={<div className="flex flex-wrap gap-2 text-xs font-bold">{[0.9, 0.7, 0.4, null].map((m, i) => { const c = masteryColor(m); return <span key={i} className="rounded-full px-2 py-1" style={{ background: c.bg, color: c.fg }}>{c.label}</span>; })}</div>}>
          الخريطة الحرارية التشخيصية (التلاميذ × المحطات)
        </SectionTitle>
        <div className="overflow-auto">
          <table className="w-full border-separate border-spacing-0.5 text-center text-xs">
            <thead>
              <tr>
                <th className="sticky right-0 z-10 min-w-36 bg-white p-1 text-start">التلميذ</th>
                {LESSONS.map((l) => (
                  <th key={l.id} className="min-w-10 p-1" title={l.title}>
                    <div className="text-lg">{l.icon}</div>
                    <div>{l.id}</div>
                  </th>
                ))}
                <th className="p-1">المجموع</th>
                <th className="p-1">المستوى</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s, i) => {
                const t = data.totals[i];
                const lv = levelLabel(t);
                return (
                  <tr key={s.id}>
                    <td className="sticky right-0 z-10 bg-white p-1 text-start">
                      <div className="flex items-center gap-1">
                        <Avatar student={s} size={26} />
                        <span className="font-bold">{s.name}</span>
                      </div>
                    </td>
                    {data.matrix[i].map((m, j) => {
                      const c = masteryColor(m);
                      return (
                        <td key={j} className="h-8 rounded-md font-bold" style={{ background: c.bg, color: c.fg }} title={`${s.name} – ${LESSONS[j].title}: ${m === null ? 'لم يبدأ' : Math.round(m * 100) + '%'}`}>
                          {m === null ? '' : Math.round(m * 100)}
                        </td>
                      );
                    })}
                    <td className="font-black">{t.total}</td>
                    <td className="font-black" style={{ color: lv.color }} title={lv.title}>{lv.text}</td>
                  </tr>
                );
              })}
              <tr className="font-black">
                <td className="sticky right-0 bg-oman-50 p-1 text-start">متوسط الشعبة</td>
                {data.colAvg.map((m, j) => {
                  const c = masteryColor(m);
                  return (
                    <td key={j} className="h-9 rounded-md ring-2 ring-white" style={{ background: c.bg, color: c.fg }}>
                      {m === null ? '' : Math.round(m * 100)}
                    </td>
                  );
                })}
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <SectionTitle icon="🧭">فجوات المهارات (أخطاء متكررة ≥ ٣)</SectionTitle>
          {data.skillGaps.length === 0 && <p className="text-oman-600">لا توجد فجوات جماعية حالياً 🎉</p>}
          <ul className="space-y-2">
            {data.skillGaps.slice(0, 8).map((g) => {
              const pct = g.struggling / roster.length;
              const c = masteryColor(1 - pct * 1.6);
              return (
                <li key={g.key} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 font-bold">{g.label}</span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(6, pct * 100)}%`, background: c.bg }} />
                  </div>
                  <span className="w-20 text-sm font-bold">{g.struggling} تلاميذ</span>
                  <Link className="btn-ghost !min-h-10 text-xs" to={`/teacher/planner?lesson=${g.lesson}`}>تدخّل</Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="card">
          <SectionTitle icon="🚩">تلاميذ بحاجة إلى دعم فوري</SectionTitle>
          {data.atRisk.length === 0 && <p className="text-oman-600">لا يوجد</p>}
          <div className="flex flex-wrap gap-2">
            {data.atRisk.map((s) => (
              <span key={s.id} className="flex items-center gap-1 rounded-full bg-rose-50 py-1 pe-3 ps-1 font-bold text-rose-800 ring-1 ring-rose-200">
                <Avatar student={s} size={28} />
                {s.name}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-oman-600">
            يُفعَّل لهؤلاء <b>المسار العلاجي التكيفي</b> تلقائياً في بوابة ولي الأمر. الدرس المقترح اليوم: <b>{data.suggested.title}</b>
          </p>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon="⚙️">الإعدادات والبيانات</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 font-bold">
              <input type="checkbox" className="h-6 w-6" checked={state.settings.unlockAll} onChange={(e) => updateSettings({ unlockAll: e.target.checked })} />
              فتح جميع المحطات للتلاميذ (بدلاً من التسلسل)
            </label>
            {[
              ['school', 'اسم المدرسة'],
              ['className', 'الصف / الشعبة'],
              ['teacherName', 'اسم المعلمة'],
              ['academicYear', 'العام الدراسي']
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm font-bold">
                <span className="w-28">{label}</span>
                <input className="flex-1 rounded-xl border-2 border-oman-100 p-2" value={state.settings[k] || ''} onChange={(e) => updateSettings({ [k]: e.target.value })} />
              </label>
            ))}
            <button className="btn-ghost self-start" onClick={() => setRosterOpen(true)}>👥 تعديل أسماء الشعبة</button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-oman-600">تُحفظ جميع البيانات في IndexedDB على هذا الجهاز وتعمل دون إنترنت. صدّر نسخة احتياطية لنقلها إلى جهاز آخر.</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => downloadJSON(`نسخة-رياضياتي-${new Date().toISOString().slice(0, 10)}.json`, state)}>⬇️ تصدير نسخة احتياطية</button>
              <button className="btn-ghost" onClick={() => fileRef.current?.click()}>⬆️ استيراد</button>
              <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => { if (confirm('إعادة تحميل البيانات التجريبية؟ ستُستبدل البيانات الحالية.')) { resetDemo(); setMsg('تمت إعادة البيانات التجريبية'); } }}>🔄 البيانات التجريبية</button>
              <button className="btn border-2 border-rose-200 bg-white text-rose-700" onClick={() => { if (confirm('مسح كل الدرجات والتقدم والبدء الفعلي؟')) { clearAll(); setMsg('تم مسح البيانات – بداية فعلية'); } }}>🧹 بدء فعلي (مسح الكل)</button>
            </div>
            {msg && <p className="font-bold text-oman-700">{msg}</p>}
          </div>
        </div>
      </div>

      <Modal open={rosterOpen} onClose={() => setRosterOpen(false)} title="أسماء تلاميذ الشعبة" wide>
        <div className="grid gap-2 sm:grid-cols-2">
          {roster.map((s, i) => (
            <label key={s.id} className="flex items-center gap-2">
              <span className="w-6 text-sm font-bold">{i + 1}</span>
              <Avatar student={s} size={32} />
              <input className="flex-1 rounded-xl border-2 border-oman-100 p-2" defaultValue={s.name} onBlur={(e) => e.target.value.trim() && renameStudent(s.id, e.target.value.trim())} />
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
