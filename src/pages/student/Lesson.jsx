import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp, useStudent, isUnlocked } from '../../context/AppContext.jsx';
import { getLesson, starsFromAccuracy, LESSONS } from '../../data/index.js';
import { EXPLORERS } from '../../components/explorers/index.js';
import QuestionRunner from '../../components/lesson/QuestionRunner.jsx';
import { SpeakButton, Stars, Confetti, FeedbackFace } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

const TABS = [
  { k: 'vocab', icon: '🗣️', t: 'مفردات الدرس', bruner: 'الرمزي اللفظي' },
  { k: 'explore', icon: '🧩', t: 'ساحة الاستكشاف', bruner: 'الحسي والأيقوني' },
  { k: 'practice', icon: '✏️', t: 'تدرّب معي', bruner: 'الأيقوني ← الرمزي' },
  { k: 'exit', icon: '🎟️', t: 'تذكرة الخروج', bruner: 'الرمزي والتقويم' }
];

// ------------------------------------------------------------ ١) المفردات
function VocabularyTab({ lesson }) {
  const [active, setActive] = useState(null);
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <SpeakButton text={`مفردات الدرس: ${lesson.vocabulary.map((v) => v.word).join('، ')}. المس البطاقة لتسمعها.`} auto />
        <p className="text-lg font-bold text-oman-700">المس كل بطاقة لتسمع الكلمة ومعناها</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {lesson.vocabulary.map((v) => (
          <button
            key={v.word}
            onClick={() => {
              setActive(v.word);
              sfx('tap');
              speak(`${v.word}. ${v.hint}`);
            }}
            className={`flex min-h-44 flex-col items-center justify-center gap-2 rounded-[1.75rem] bg-white p-4 shadow-md transition hover:-translate-y-1 ${active === v.word ? 'ring-4 ring-amber-brand' : 'ring-2 ring-oman-100'}`}
          >
            <span className="text-6xl">{v.icon}</span>
            <span className="text-2xl font-black text-oman-800">{v.word}</span>
            <span className="text-center text-sm font-bold text-oman-600">{v.hint}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white/70 p-3 text-sm text-oman-700">
        <span className="font-bold">من كتاب التلميذ: </span>
        {lesson.bookTitles.join(' · ')}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ ٢) الاستكشاف
function ExploreTab({ lesson }) {
  const Comp = EXPLORERS[lesson.explorer];
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <SpeakButton text={lesson.intro} auto />
        <p className="text-lg font-bold text-oman-700">{lesson.intro}</p>
      </div>
      <div className="rounded-[1.75rem] bg-white p-3 shadow-inner sm:p-5">{Comp ? <Comp /> : <p>لا توجد أداة لهذه المحطة.</p>}</div>
    </div>
  );
}

// ------------------------------------------------------------ ٣) تدرّب معي
function PracticeTab({ lesson, sid, onDone }) {
  const { recordPractice } = useApp();
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const ordered = ['easy', 'medium', 'challenge'].flatMap((lv) => lesson.practice.filter((q) => q.level === lv));

  if (result) {
    const stars = starsFromAccuracy(result.correct, result.total);
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Confetti show={stars === 3} />
        <FeedbackFace kind={stars >= 2 ? 'good' : 'bad'} />
        <h3 className="text-3xl font-black text-oman-700">{stars === 3 ? 'ممتاز يا بطل!' : stars === 2 ? 'أحسنت! عمل جميل' : 'محاولة جيدة! تدرّب مرة أخرى'}</h3>
        <Stars n={stars} size="text-5xl" />
        <p className="text-xl font-bold">
          أجبت عن {toAr(result.correct)} من {toAr(result.total)} من المحاولة الأولى
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button className="btn-ghost text-lg" onClick={() => { setResult(null); setRun((r) => r + 1); }}>↺ تدرّب مرة أخرى</button>
          <button className="btn-amber text-lg" onClick={onDone}>🎟️ إلى تذكرة الخروج</button>
        </div>
      </div>
    );
  }

  return (
    <QuestionRunner
      key={run}
      questions={ordered}
      mode="practice"
      onFinish={(r) => {
        recordPractice(sid, lesson.id, r);
        const stars = starsFromAccuracy(r.correct, r.total);
        sfx(stars === 3 ? 'celebrate' : 'star');
        speak(stars === 3 ? 'ممتاز! حصلت على ثلاث نجوم' : 'أحسنت! أكملت التدريب');
        setResult(r);
      }}
    />
  );
}

// ------------------------------------------------------------ ٤) تذكرة الخروج (السؤال القصير)
const EXIT_SECONDS = 10 * 60;

function ExitTicketTab({ lesson, sid }) {
  const { recordExit } = useApp();
  const [phase, setPhase] = useState('intro'); // intro | run | done
  const [left, setLeft] = useState(EXIT_SECONDS);
  const [final, setFinal] = useState(null);
  const partial = useRef({ points: 0 });
  const items = [...lesson.exitTicket.items].sort((a, b) => a.points - b.points); // ترتيب تصاعدي للصعوبة
  const max = items.reduce((a, q) => a + q.points, 0);

  useEffect(() => {
    if (phase !== 'run') return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'run' && left <= 0) {
      sfx('alarm');
      finish({ points: partial.current.points, skillErrors: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  const finish = (r) => {
    const score = recordExit(sid, lesson.id, { score: r.points, max, skillErrors: r.skillErrors });
    setFinal(score);
    setPhase('done');
    sfx(score === max ? 'celebrate' : 'success');
    speak(`انتهت تذكرة الخروج. حصلت على ${score} من ${max}`);
  };

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <SpeakButton text={`تذكرة الخروج: ${items.length} أسئلة قصيرة، لديك عشر دقائق. أجب بهدوء، وابدأ عندما تكون جاهزاً.`} auto />
        <span className="text-7xl">🎟️</span>
        <h3 className="text-3xl font-black text-oman-700">تذكرة الخروج</h3>
        <ul className="space-y-1 text-lg font-bold text-oman-700">
          <li>⏱️ ١٠ دقائق كحد أقصى</li>
          <li>📝 {toAr(items.length)} مفردات بترتيب تصاعدي للصعوبة</li>
          <li>⭐ الدرجة من {toAr(max)} – تُحفظ في سجل المعلمة</li>
        </ul>
        {lesson.exitTicket.slot && <span className="chip">تُرحَّل إلى خانة «الأسئلة القصيرة» في السجل الرسمي</span>}
        <button className="btn-amber text-2xl" onClick={() => { setLeft(EXIT_SECONDS); partial.current = { points: 0 }; setPhase('run'); }}>
          ابدأ ▶
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Confetti show={final === max} />
        <FeedbackFace kind={final >= max - 1 ? 'good' : 'bad'} />
        <h3 className="text-3xl font-black text-oman-700">درجتك: {toAr(final)} من {toAr(max)}</h3>
        <p className="font-bold text-green-700">✅ حُفظت الدرجة في سجل المعلمة</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to={`/student/unit/${lesson.unit}`} className="btn-ghost text-lg">محطات الوحدة</Link>
          {LESSONS.find((l) => l.id === lesson.id + 1) && (
            <Link to={`/student/lesson/${lesson.id + 1}`} className="btn-primary text-lg">المحطة التالية ←</Link>
          )}
        </div>
      </div>
    );
  }

  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = Math.max(0, left) % 60;
  return (
    <QuestionRunner
      questions={items}
      mode="exit"
      onProgress={(p) => (partial.current = p)}
      header={
        <span className={`chip shrink-0 !text-lg ${left < 60 ? '!bg-rose-100 !text-rose-700' : ''}`} aria-live="polite">
          ⏱️ {toAr(mm)}:{toAr(String(ss).padStart(2, '0'))}
        </span>
      }
      onFinish={finish}
    />
  );
}

// ------------------------------------------------------------ الشاشة الموحّدة
export default function LessonPage() {
  const { id } = useParams();
  const { state } = useApp();
  const { sid, progress } = useStudent();
  const lesson = getLesson(id);
  const [tab, setTab] = useState('vocab');

  useEffect(() => setTab('vocab'), [id]);

  if (!lesson) return <Navigate to="/student/map" replace />;
  if (!isUnlocked(state, progress, lesson.id)) return <Navigate to={`/student/unit/${lesson.unit}`} replace />;
  const lp = progress.lessons?.[lesson.id];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[2rem] bg-white p-4 shadow">
        <Link to={`/student/unit/${lesson.unit}`} className="btn-ghost">→ المحطات</Link>
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-brand text-3xl">{lesson.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-bold text-amber-brand">
            المحطة {toAr(lesson.id)} · {lesson.place} · الوحدة {lesson.strand} · ص {toAr(lesson.pages[0])}–{toAr(lesson.pages[1])}
          </div>
          <h1 className="text-xl font-black text-oman-800 sm:text-2xl">{lesson.title}</h1>
        </div>
        {lp?.completed && <Stars n={lp.stars} />}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.k}
            role="tab"
            aria-selected={tab === t.k}
            onClick={() => {
              sfx('tap');
              setTab(t.k);
            }}
            className={`flex min-h-20 flex-col items-center justify-center rounded-3xl px-2 py-2 font-black transition ${tab === t.k ? 'bg-oman-700 text-white shadow-lg' : 'bg-white text-oman-700 ring-2 ring-oman-100 hover:ring-oman-300'}`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className="text-base">
              {toAr(i + 1)}. {t.t}
            </span>
            <span className={`text-[11px] font-bold ${tab === t.k ? 'text-oman-100' : 'text-oman-300'}`}>برونر: {t.bruner}</span>
          </button>
        ))}
      </div>

      <section className="rounded-[2rem] bg-oman-50 p-3 ring-4 ring-white sm:p-5">
        {tab === 'vocab' && <VocabularyTab lesson={lesson} />}
        {tab === 'explore' && <ExploreTab lesson={lesson} />}
        {tab === 'practice' && <PracticeTab key={lesson.id} lesson={lesson} sid={sid} onDone={() => setTab('exit')} />}
        {tab === 'exit' && <ExitTicketTab key={lesson.id} lesson={lesson} sid={sid} />}
      </section>

      <div className="flex justify-between no-print">
        <button className="btn-ghost" disabled={tab === 'vocab'} onClick={() => setTab(TABS[TABS.findIndex((t) => t.k === tab) - 1].k)}>→ السابق</button>
        <button className="btn-primary" disabled={tab === 'exit'} onClick={() => setTab(TABS[TABS.findIndex((t) => t.k === tab) + 1].k)}>التالي ←</button>
      </div>
    </div>
  );
}
