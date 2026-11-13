import { memo, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { ASSESSMENT_TOOLS, ALL_FIELDS, computeTotals, levelLabel, validateScore, DIALOGUE_RUBRIC, PRESENTATION_RUBRIC, PROJECT_RUBRIC, LEVELS, DOMAINS } from '../../data/assessment.js';
import { EXIT_SLOTS, HOMEWORK, getLesson } from '../../data/index.js';
import { Modal } from '../../components/ui/index.jsx';
import { downloadCSV } from '../../utils/storage.js';

/** خانة درجة: أعداد صحيحة فقط، بلا صفر، ضمن الدرجة العظمى */
const ScoreCell = memo(function ScoreCell({ sid, field, value, manual, onSave }) {
  const [text, setText] = useState(value ?? '');
  const [error, setError] = useState('');
  useEffect(() => {
    setText(value ?? '');
    setError('');
  }, [value]);

  const commit = (raw) => {
    const r = validateScore(raw, field.max);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setError('');
    if (r.value !== (value ?? null)) onSave(sid, field.id, r.value);
  };

  const auto = typeof value === 'number' && !manual && field.auto;
  return (
    <td className="relative border border-slate-200 p-0">
      <input
        value={text}
        inputMode="numeric"
        aria-label={`${field.label} (من ${field.max})`}
        title={error || (auto ? 'مستوردة تلقائياً من التطبيق' : `${field.label} – من ${field.max}`)}
        onChange={(e) => {
          setText(e.target.value);
          const r = validateScore(e.target.value, field.max);
          setError(r.ok ? '' : r.error);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`h-9 w-11 bg-transparent text-center text-sm font-bold outline-none focus:bg-amber-50 print:h-6 ${error ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500' : auto ? 'text-sky-700' : 'text-slate-900'}`}
      />
      {auto && <span className="absolute left-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-sky-500 no-print" />}
    </td>
  );
});

function Rubrics() {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <h4 className="mb-1 font-black text-oman-700">معيار الحوار (المعرفة والفهم أو حل المشكلات)</h4>
        <ul className="list-inside list-disc">{DIALOGUE_RUBRIC.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="mt-1">{DIALOGUE_RUBRIC.scale.map((s) => `${s.score} = ${s.label}`).join(' · ')}</p>
      </section>
      <section>
        <h4 className="mb-1 font-black text-oman-700">معيار العرض الشفوي (٥ معايير أداء)</h4>
        <ul className="list-inside list-disc">{PRESENTATION_RUBRIC.criteria.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="mt-1">{PRESENTATION_RUBRIC.scale.map((s) => `${s.score} = ${s.label}`).join(' · ')}</p>
      </section>
      <section>
        <h4 className="mb-1 font-black text-oman-700">بنود تصحيح المشروع للصفين (١–٢)</h4>
        {PROJECT_RUBRIC.map((p) => (
          <div key={p.id}>
            <b>{p.title}:</b> {p.items.join('، ')}
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-amber-50 p-2">
        <b>قواعد إلزامية مطبّقة برمجياً:</b> لا أنصاف درجات · لا يُمنح التلميذ صفراً في حالة تنفيذ الأداة (الحد الأدنى ١) · الخانة الفارغة تعني أن الأداة لم تُنفّذ بعد.
      </section>
      <section>
        <b>«≈» قبل المستوى = مؤشر مبدئي محسوب من الخانات المرصودة فقط حتى يكتمل الرصد.</b>
      </section>
      <section>
        <b>مستويات التحصيل (قابلة للتعديل في data/assessment.js):</b> {LEVELS.map((l) => `${l.letter}: ${l.min}+`).join(' · ')}
      </section>
    </div>
  );
}

export default function Assessment() {
  const { state, setAssessment } = useApp();
  const [rubrics, setRubrics] = useState(false);
  const { roster, assessment, manual, settings } = state;

  const exportCSV = () => {
    const head1 = ['م', 'الاسم', ...ALL_FIELDS.map((f) => `${f.toolTitle} – ${f.label} (${f.max}) [${f.domain === 'K' ? 'معرفة' : 'ح.م'}]`), 'المعرفة والفهم (70)', 'حل المشكلات (30)', 'المجموع (100)', 'المستوى'];
    const rows = roster.map((s, i) => {
      const rec = assessment[s.id] || {};
      const t = computeTotals(rec);
      return [i + 1, s.name, ...ALL_FIELDS.map((f) => rec[f.id] ?? ''), t.K, t.PS, t.total, levelLabel(t).text.replace('—', '')];
    });
    downloadCSV(`سجل-التقويم-رياضيات-${settings.className}.csv`, [[`سجل التقويم المستمر – الرياضيات – ${settings.className} – ${settings.school} – ${settings.academicYear}`], head1, ...rows]);
  };

  const missing = roster.reduce((a, s) => a + (ALL_FIELDS.length - computeTotals(assessment[s.id]).filled), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <div className="me-auto">
          <h1 className="text-2xl font-black text-oman-800">سجل التقويم المستمر الذكي – وثيقة 2026م</h1>
          <p className="text-sm font-bold text-oman-600">الصفان (١–٢): المعرفة والفهم ٧٠ + حل المشكلات ٣٠ = ١٠٠ درجة · لا توجد اختبارات قصيرة للصف الأول</p>
        </div>
        <button className="btn-ghost" onClick={() => setRubrics(true)}>📐 المعايير والقواعد</button>
        <button className="btn-primary" onClick={exportCSV}>⬇️ تصدير CSV (Excel)</button>
        <button className="btn-amber" onClick={() => window.print()}>🖨️ طباعة رسمية</button>
      </div>

      <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-5 no-print">
        {ASSESSMENT_TOOLS.map((t) => (
          <div key={t.key} className="card !p-3">
            <div className="font-black text-oman-700">
              {t.title} ({t.total})
            </div>
            <div className="text-slate-600">{t.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-bold no-print">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" /> مستوردة تلقائياً (تذاكر الخروج / الواجبات الإلكترونية)</span>
        <span>خانات لم تُرصد بعد: {missing}</span>
        <span className="text-slate-500">
          مصادر الاستيراد: {Object.entries(EXIT_SLOTS).map(([slot, lid]) => `${slot}←محطة ${lid} (${getLesson(lid).icon})`).join(' · ')} · {HOMEWORK.map((h) => `${h.slot}←${h.id}`).join(' · ')}
        </span>
      </div>

      <div className="print-area card overflow-auto !p-2 landscape-print">
        <div className="print-only mb-2 text-center">
          <div className="text-sm">{settings.school} · العام الدراسي {settings.academicYear}</div>
          <div className="text-lg font-black">نموذج استمارة المتابعة اليومية ورصد الدرجات – المادة: الرياضيات – الصف: {settings.className}</div>
        </div>
        <table className="w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th rowSpan={3} className="border border-slate-300 bg-slate-100 p-1">م</th>
              <th rowSpan={3} className="sticky right-0 z-10 min-w-36 border border-slate-300 bg-slate-100 p-1">الاسم</th>
              <th colSpan={ALL_FIELDS.filter((f) => f.domain === 'K').length} className="border border-slate-300 bg-oman-100 p-1">أدوات التقويم في {DOMAINS.K.label} ({DOMAINS.K.total})</th>
              <th colSpan={ALL_FIELDS.filter((f) => f.domain === 'PS').length} className="border border-slate-300 bg-amber-100 p-1">أدوات التقويم في {DOMAINS.PS.label} ({DOMAINS.PS.total})</th>
              <th rowSpan={3} className="border border-slate-300 bg-oman-100 p-1">م.ف ٧٠</th>
              <th rowSpan={3} className="border border-slate-300 bg-amber-100 p-1">ح.م ٣٠</th>
              <th rowSpan={3} className="border border-slate-300 bg-slate-200 p-1">الكلية ١٠٠</th>
              <th rowSpan={3} className="border border-slate-300 bg-slate-200 p-1">المستوى</th>
            </tr>
            <tr>
              {['K', 'PS'].flatMap((d) =>
                ASSESSMENT_TOOLS.map((t) => {
                  const fs = t.fields.filter((f) => f.domain === d);
                  if (!fs.length) return null;
                  return (
                    <th key={`${d}-${t.key}`} colSpan={fs.length} className={`border border-slate-300 p-1 ${d === 'K' ? 'bg-oman-50' : 'bg-amber-50'}`}>
                      {t.title} ({fs.reduce((a, f) => a + f.max, 0)})
                    </th>
                  );
                })
              )}
            </tr>
            <tr>
              {['K', 'PS'].flatMap((d) =>
                ASSESSMENT_TOOLS.flatMap((t) =>
                  t.fields
                    .filter((f) => f.domain === d)
                    .map((f) => (
                      <th key={f.id} className="border border-slate-300 bg-white p-1 font-bold" title={f.label}>
                        <div className="whitespace-nowrap">{f.short}</div>
                        <div className="text-[10px] text-slate-500">{f.mental ? `*${f.max}` : f.max}</div>
                      </th>
                    ))
                )
              )}
            </tr>
          </thead>
          <tbody>
            {roster.map((s, i) => {
              const rec = assessment[s.id] || {};
              const t = computeTotals(rec);
              const lv = levelLabel(t);
              const ordered = ['K', 'PS'].flatMap((d) => ASSESSMENT_TOOLS.flatMap((tool) => tool.fields.filter((f) => f.domain === d)));
              return (
                <tr key={s.id} className="odd:bg-slate-50/60">
                  <td className="border border-slate-200 p-1">{i + 1}</td>
                  <td className="sticky right-0 z-10 whitespace-nowrap border border-slate-200 bg-white p-1 text-start font-bold">{s.name}</td>
                  {ordered.map((f) => (
                    <ScoreCell key={f.id} sid={s.id} field={f} value={rec[f.id]} manual={manual?.[s.id]?.[f.id]} onSave={setAssessment} />
                  ))}
                  <td className="border border-slate-200 bg-oman-50 font-black">{t.K}</td>
                  <td className="border border-slate-200 bg-amber-50 font-black">{t.PS}</td>
                  <td className="border border-slate-200 bg-slate-100 font-black">{t.total}</td>
                  <td className="border border-slate-200 font-black" style={{ color: lv.color }} title={lv.title}>
                    {lv.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-1 text-[10px] text-slate-500">* درجات الحساب الذهني (1Nc1–1Nc7) تُرصد ٣ مرات × ٣ درجات.</p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm font-bold">
          <div>توقيع المعلم الأول: ..................</div>
          <div>توقيع المشرف التربوي: ..................</div>
          <div>توقيع مدير المدرسة: ..................</div>
        </div>
      </div>

      <Modal open={rubrics} onClose={() => setRubrics(false)} title="معايير وثيقة التقويم وقواعد الرصد" wide>
        <Rubrics />
      </Modal>
    </div>
  );
}
