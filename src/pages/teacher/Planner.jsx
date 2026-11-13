import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { LESSONS, MENTAL, getLesson } from '../../data/index.js';
import Visual from '../../components/lesson/Visual.jsx';
import { toAr } from '../../utils/arabic.js';

const STRATEGIES = {
  sixhats: {
    name: 'القبعات الست للتفكير',
    steps: ['⚪ البيضاء: ماذا نرى من حقائق وأعداد؟', '🔴 الحمراء: ماذا نشعر تجاه المسألة؟', '🟡 الصفراء: ما الفوائد/ما الذي نجح؟', '⚫ السوداء: أين قد نخطئ؟', '🟢 الخضراء: طرق جديدة للحل', '🔵 الزرقاء: ماذا تعلمنا؟ (الختام)']
  },
  kwl: { name: 'جدول التعلم KWL', steps: ['K: ماذا أعرف عن الموضوع؟ (بالرسم أو الكلام)', 'W: ماذا أريد أن أعرف؟', 'L: ماذا تعلمت؟ (في نهاية الحصة)'] },
  tps: { name: 'فكّر – زاوج – شارك', steps: ['فكّر وحدك دقيقة واحدة', 'ناقش زميلك وقارنا الحلول', 'شارك الصف بإجابتكما'] },
  heads: { name: 'الرؤوس المرقمة معاً', steps: ['تقسيم الصف إلى مجموعات رباعية مرقمة ١–٤', 'طرح المهمة وتفكير جماعي', 'استدعاء رقم عشوائي للإجابة باسم المجموعة'] },
  stations: { name: 'المحطات التعليمية', steps: ['محطة حسية (المحسوسات)', 'محطة أيقونية (الصور والرسم)', 'محطة رمزية (الأعداد والجمل)', 'محطة رقمية (التطبيق على الجهاز اللوحي)'] },
  roleplay: { name: 'لعب الأدوار', steps: ['توزيع الأدوار (بائع/مشترٍ...)', 'تنفيذ الموقف بالمحسوسات', 'مناقشة ما حدث رياضياً'] },
  play: { name: 'التعلم باللعب', steps: ['تقديم اللعبة وقوانينها', 'اللعب في مجموعات', 'استخلاص المفهوم الرياضي'] }
};

function pickStrategy(text = '') {
  if (text.includes('القبعات')) return 'sixhats';
  if (text.includes('KWL')) return 'kwl';
  if (text.includes('زاوج')) return 'tps';
  if (text.includes('الرؤوس')) return 'heads';
  if (text.includes('المحطات')) return 'stations';
  if (text.includes('الأدوار')) return 'roleplay';
  return 'play';
}

function Cell({ label, children }) {
  return (
    <div className="rounded-xl border border-oman-100 p-2">
      <div className="text-xs font-bold text-oman-600">{label}</div>
      <div className="font-bold">{children}</div>
    </div>
  );
}

// ------------------------------------------------------------ خطة الدرس
function LessonPlan({ lesson, settings }) {
  const [strategy, setStrategy] = useState(pickStrategy(lesson.planner.strategy));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const mental = MENTAL.filter((m) => lesson.mentalCodes.includes(m.code));
  const st = STRATEGIES[strategy];
  return (
    <div className="print-area card">
      <div className="mb-3 flex flex-wrap items-center gap-2 no-print">
        <label className="font-bold">
          استراتيجية التعلم النشط:{' '}
          <select className="rounded-xl border-2 border-oman-100 p-2" value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            {Object.entries(STRATEGIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="font-bold">
          التاريخ: <input type="date" className="rounded-xl border-2 border-oman-100 p-2" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button className="btn-primary ms-auto" onClick={() => window.print()}>🖨️ طباعة الخطة</button>
      </div>

      <h2 className="mb-2 text-center text-2xl font-black text-oman-800">خطة درس يومية – الرياضيات – الصف الأول</h2>
      <div className="mb-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
        <Cell label="المدرسة">{settings.school}</Cell>
        <Cell label="الصف/الشعبة">{settings.className}</Cell>
        <Cell label="التاريخ">{date}</Cell>
        <Cell label="المعلمة">{settings.teacherName}</Cell>
        <Cell label="عنوان الدرس">{lesson.title}</Cell>
        <Cell label="الوحدة">الوحدة {lesson.strand}</Cell>
        <Cell label="صفحات الكتاب">ص {toAr(lesson.pages[0])}–{toAr(lesson.pages[1])}</Cell>
        <Cell label="الزمن">٤٠ دقيقة</Cell>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="avoid-break rounded-2xl bg-oman-50 p-3">
          <h3 className="mb-1 font-black text-oman-700">🎯 نواتج التعلم</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {lesson.objectives.map((o) => (
              <li key={o.code}>
                <b dir="ltr">{o.code}</b> – {o.text}
              </li>
            ))}
          </ul>
        </section>
        <section className="avoid-break rounded-2xl bg-oman-50 p-3">
          <h3 className="mb-1 font-black text-oman-700">🗣️ المفردات والأدوات</h3>
          <p className="text-sm">
            <b>المفردات: </b>
            {lesson.vocabulary.map((v) => v.word).join('، ')}
          </p>
          <p className="text-sm">
            <b>الأدوات: </b>
            {lesson.planner.resources.join('، ')}، تطبيق «رياضياتي» على السبورة الذكية
          </p>
        </section>
      </div>

      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-oman-700 text-white">
            <th className="border border-oman-300 p-2">المرحلة</th>
            <th className="border border-oman-300 p-2">الزمن</th>
            <th className="border border-oman-300 p-2">الإجراءات (المعلمة والتلاميذ)</th>
          </tr>
        </thead>
        <tbody className="align-top">
          <tr>
            <td className="border border-oman-100 p-2 font-bold">التهيئة والحساب الذهني</td>
            <td className="border border-oman-100 p-2">٥ د</td>
            <td className="border border-oman-100 p-2">
              {lesson.planner.warmup}
              {mental.length > 0 && (
                <div className="mt-1 text-xs text-oman-600">
                  أهداف الاستراتيجيات الذهنية:{' '}
                  {mental.map((m) => (
                    <span key={m.code}>
                      <b dir="ltr">{m.code}</b> {m.ar}؛{' '}
                    </span>
                  ))}
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-oman-100 p-2 font-bold">التمثيل الحسي (برونر ١)</td>
            <td className="border border-oman-100 p-2">١٠ د</td>
            <td className="border border-oman-100 p-2">
              {lesson.intro} يعمل التلاميذ في مجموعات بالمحسوسات ({lesson.planner.resources.slice(0, 2).join('، ')})، ثم تعرض المعلمة «ساحة الاستكشاف» في التطبيق على السبورة.
            </td>
          </tr>
          <tr>
            <td className="border border-oman-100 p-2 font-bold">التمثيل الأيقوني (برونر ٢)</td>
            <td className="border border-oman-100 p-2">١٠ د</td>
            <td className="border border-oman-100 p-2">
              تنفيذ استراتيجية <b>{st.name}</b>:
              <ul className="list-inside list-disc">
                {st.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              مع صفحات الكتاب: {lesson.bookTitles.join('، ')}.
            </td>
          </tr>
          <tr>
            <td className="border border-oman-100 p-2 font-bold">التمثيل الرمزي والتدريب (برونر ٣)</td>
            <td className="border border-oman-100 p-2">١٠ د</td>
            <td className="border border-oman-100 p-2">
              تمرين «تدرّب معي» المتدرّج (سهل – متوسط – تحدٍّ) مع تغذية راجعة فورية؛ ورقة عمل متمايزة بثلاثة مسارات.
            </td>
          </tr>
          <tr>
            <td className="border border-oman-100 p-2 font-bold">الختام والتقويم</td>
            <td className="border border-oman-100 p-2">٥ د</td>
            <td className="border border-oman-100 p-2">
              تذكرة الخروج ({toAr(lesson.exitTicket.items.length)} مفردات – ٥ درجات – درجات المفردة ٠، ١، ٢):
              <ol className="list-inside list-decimal">
                {lesson.exitTicket.items.map((q) => (
                  <li key={q.id}>
                    {q.prompt} <span className="text-xs text-oman-600">({toAr(q.points)})</span>
                  </li>
                ))}
              </ol>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {[
          ['🤲 الدعم الحسي', 'العمل بالمحسوسات الحقيقية، أعداد أصغر، شريط أعداد أمام التلميذ، والتطبيق بالتوجيه الصوتي.'],
          ['📘 المسار المعياري', 'أنشطة كتاب التلميذ وتمرين «تدرّب معي» كاملاً.'],
          ['🚀 الإثراء والتحدي', 'أسئلة التحدي، تأليف مسألة مشابهة، وشرح طريقة الحل شفوياً للزملاء.']
        ].map(([t, d]) => (
          <section key={t} className="avoid-break rounded-2xl border-2 border-oman-100 p-3">
            <h4 className="font-black text-oman-700">{t}</h4>
            <p className="text-sm">{d}</p>
          </section>
        ))}
      </div>

      <section className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm">
        <b>عبارات «أستطيع»: </b>
        {lesson.canDo.join(' · ')}
      </section>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm font-bold">
        <div>توقيع المعلمة: ..................</div>
        <div>المعلم الأول: ..................</div>
        <div>المشرف التربوي: ..................</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ أوراق العمل المتمايزة
const TRACKS = [
  { id: 'support', name: 'مسار الدعم الحسي', icon: '🤲', color: '#16a34a', note: 'استخدم المكعبات أو أصابعك للمساعدة.' },
  { id: 'standard', name: 'المسار المعياري', icon: '📘', color: '#0f4c5c', note: 'أجب عن الأسئلة بهدوء.' },
  { id: 'enrich', name: 'مسار الإثراء والتحدي', icon: '🚀', color: '#d97706', note: 'فكّر بعمق واشرح طريقتك.' }
];

function questionsFor(lesson, track) {
  const p = lesson.practice;
  if (track === 'support') return [...p.filter((q) => q.level === 'easy'), ...p.filter((q) => q.level === 'medium').slice(0, 1)];
  if (track === 'standard') return [...p.filter((q) => q.level !== 'challenge'), lesson.exitTicket.items[lesson.exitTicket.items.length - 1]];
  return [...p.filter((q) => q.level === 'challenge'), ...lesson.exitTicket.items.filter((q) => q.points === 2)];
}

function AnswerArea({ q }) {
  if (q.type === 'choice')
    return (
      <div className="flex flex-wrap gap-3">
        {q.options.map((o) => (
          <span key={String(o)} className="flex min-h-12 min-w-16 items-center justify-center rounded-full border-2 border-slate-400 px-3 text-xl font-bold">
            {typeof o === 'number' ? toAr(o) : o}
          </span>
        ))}
        <span className="self-center text-xs text-slate-500">(ضع دائرة حول الإجابة)</span>
      </div>
    );
  if (q.type === 'order')
    return (
      <div>
        <div className="mb-1 text-lg font-bold">{q.items.map((v) => (typeof v === 'number' ? toAr(v) : v)).join(' ، ')}</div>
        <div className="flex gap-2">
          {q.items.map((_, i) => (
            <span key={i} className="h-12 w-20 rounded-lg border-2 border-dashed border-slate-400" />
          ))}
        </div>
      </div>
    );
  return <span className="inline-block h-14 w-24 rounded-xl border-2 border-slate-500" />;
}

function Worksheet({ lesson, track, settings, breakBefore }) {
  const t = TRACKS.find((x) => x.id === track);
  const qs = questionsFor(lesson, track);
  return (
    <div className={`print-area card mb-4 ${breakBefore ? 'print-break' : ''}`}>
      <div className="mb-2 flex items-center justify-between border-b-4 pb-2" style={{ borderColor: t.color }}>
        <div>
          <div className="text-xs font-bold text-slate-500">{settings.school} · {settings.className}</div>
          <h3 className="text-xl font-black" style={{ color: t.color }}>
            {t.icon} ورقة عمل: {lesson.title}
          </h3>
          <div className="text-sm font-bold">{t.name}</div>
        </div>
        <div className="text-sm font-bold leading-8">
          الاسم: ............................
          <br />
          التاريخ: ......................
        </div>
      </div>
      <p className="mb-3 rounded-xl bg-slate-50 p-2 text-sm font-bold">💡 {t.note}</p>
      <ol className="space-y-4">
        {qs.map((q, i) => (
          <li key={q.id} className="avoid-break rounded-2xl border border-slate-200 p-3">
            <div className="mb-2 text-lg font-black">
              {toAr(i + 1)}) {q.prompt}
            </div>
            {q.visual && (
              <div className="mb-2">
                <Visual v={q.visual} compact />
              </div>
            )}
            <AnswerArea q={q} />
          </li>
        ))}
        {track === 'enrich' && (
          <li className="avoid-break rounded-2xl border border-slate-200 p-3">
            <div className="mb-2 text-lg font-black">{toAr(qs.length + 1)}) ✍️ ألّف مسألة مشابهة وحلّها، ثم اشرحها لزميلك:</div>
            <div className="h-24 rounded-xl border-2 border-dashed border-slate-300" />
          </li>
        )}
      </ol>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
        <span className="font-bold">كيف أشعر بعد حل الورقة؟</span>
        <span className="text-3xl tracking-widest">😀 😐 🙁</span>
      </div>
    </div>
  );
}

export default function Planner() {
  const { state } = useApp();
  const loc = useLocation();
  const initial = Number(new URLSearchParams(loc.search).get('lesson')) || 1;
  const [lessonId, setLessonId] = useState(getLesson(initial) ? initial : 1);
  const [view, setView] = useState('plan');
  const [tracks, setTracks] = useState(['support', 'standard', 'enrich']);
  const lesson = useMemo(() => getLesson(lessonId), [lessonId]);

  return (
    <div className="flex flex-col gap-4 print:block">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <h1 className="me-auto text-2xl font-black text-oman-800">محرك التحضير الآلي ومولد أوراق العمل</h1>
        <select className="rounded-xl border-2 border-oman-100 p-2 font-bold" value={lessonId} onChange={(e) => setLessonId(Number(e.target.value))}>
          {LESSONS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.id}. {l.title} (ص {l.pages[0]}–{l.pages[1]})
            </option>
          ))}
        </select>
        <button className={view === 'plan' ? 'btn-primary' : 'btn-ghost'} onClick={() => setView('plan')}>📝 خطة الدرس</button>
        <button className={view === 'sheets' ? 'btn-primary' : 'btn-ghost'} onClick={() => setView('sheets')}>📄 أوراق العمل</button>
      </div>

      {view === 'plan' ? (
        <LessonPlan key={lesson.id} lesson={lesson} settings={state.settings} />
      ) : (
        <>
          <div className="card flex flex-wrap items-center gap-3 no-print">
            {TRACKS.map((t) => (
              <label key={t.id} className="flex items-center gap-2 font-bold">
                <input type="checkbox" className="h-5 w-5" checked={tracks.includes(t.id)} onChange={(e) => setTracks((x) => (e.target.checked ? [...x, t.id] : x.filter((y) => y !== t.id)))} />
                {t.icon} {t.name}
              </label>
            ))}
            <button className="btn-primary ms-auto" onClick={() => window.print()}>🖨️ طباعة الأوراق</button>
          </div>
          {TRACKS.filter((t) => tracks.includes(t.id)).map((t, i) => (
            <Worksheet key={t.id} lesson={lesson} track={t.id} settings={state.settings} breakBefore={i > 0} />
          ))}
        </>
      )}
    </div>
  );
}
