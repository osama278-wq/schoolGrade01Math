import { useEffect, useMemo, useState } from 'react';
import Visual from './Visual.jsx';
import { SpeakButton, FeedbackFace, NumberPad } from '../ui/index.jsx';
import { speak, sfx, praise, retry } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';
import { shuffle } from '../../utils/random.js';

const LEVEL_LABEL = { easy: { t: 'سهل', c: 'bg-green-100 text-green-800' }, medium: { t: 'متوسط', c: 'bg-amber-100 text-amber-800' }, challenge: { t: 'تحدٍّ', c: 'bg-rose-100 text-rose-800' } };

const show = (v) => (typeof v === 'number' ? toAr(v) : v);
const same = (a, b) => String(a) === String(b);

/**
 * بطاقة سؤال واحدة.
 * mode: practice (تلميح ثم إظهار الحل) | exit/homework (محاولة ثانية بدرجة جزئية دون كشف الحل)
 * onResult({ correct, firstTry, points })
 */
export default function QuestionCard({ q, mode = 'practice', onResult, autoSpeak = true }) {
  const [attempt, setAttempt] = useState(0);
  const [feedback, setFeedback] = useState(null); // good | bad
  const [done, setDone] = useState(false);
  const [num, setNum] = useState('');
  const [picked, setPicked] = useState(null);
  const [order, setOrder] = useState([]);
  const pool = useMemo(() => (q.type === 'order' ? shuffle(q.items.map((v, i) => ({ v, i }))) : []), [q]);

  const maxAttempts = mode === 'practice' ? 2 : (q.points || 1) > 1 ? 2 : 1;

  useEffect(() => {
    setAttempt(0);
    setFeedback(null);
    setDone(false);
    setNum('');
    setPicked(null);
    setOrder([]);
  }, [q]);

  const finish = (correct, attemptNo) => {
    setDone(true);
    const pts = q.points || 1;
    const points = correct ? (attemptNo === 1 ? pts : Math.max(0, pts - 1)) : 0;
    setTimeout(() => onResult?.({ correct, firstTry: correct && attemptNo === 1, points }), correct ? 1100 : 1600);
  };

  const evaluate = (value) => {
    if (done) return;
    const ok = q.type === 'order' ? value.length === q.answer.length && value.every((v, i) => same(v, q.answer[i])) : same(value, q.answer);
    const n = attempt + 1;
    setAttempt(n);
    if (ok) {
      sfx('success');
      setFeedback('good');
      speak(praise());
      finish(true, n);
    } else {
      sfx('error');
      setFeedback('bad');
      if (n >= maxAttempts) {
        if (mode === 'practice') speak(`الإجابة الصحيحة هي ${Array.isArray(q.answer) ? q.answer.join('، ') : q.answer}`);
        else speak('شكراً لك، لننتقل إلى السؤال التالي');
        finish(false, n);
      } else {
        speak(q.hint && mode === 'practice' ? `${retry()}. ${q.hint}` : retry());
        setTimeout(() => {
          setFeedback(null);
          setNum('');
          setPicked(null);
          setOrder([]);
        }, 1200);
      }
    }
  };

  const level = LEVEL_LABEL[q.level];
  const revealed = done && feedback === 'bad' && mode === 'practice';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <SpeakButton text={q.say || q.prompt} auto={autoSpeak} />
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap gap-2">
            {level && <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${level.c}`}>{level.t}</span>}
            {q.points && mode !== 'practice' && <span className="rounded-full bg-oman-100 px-3 py-0.5 text-sm font-bold text-oman-700">{toAr(q.points)} {q.points === 1 ? 'درجة' : 'درجتان'}</span>}
          </div>
          <h3 className="text-2xl font-extrabold leading-relaxed text-oman-900 sm:text-3xl">{q.prompt}</h3>
        </div>
      </div>

      {q.visual && (
        <div className="rounded-3xl bg-oman-50 p-4">
          <Visual v={q.visual} />
        </div>
      )}

      {q.type === 'choice' && (
        <div className="flex flex-wrap justify-center gap-3">
          {q.options.map((o) => {
            const isPicked = same(picked, o);
            const isAnswer = revealed && same(o, q.answer);
            return (
              <button
                key={String(o)}
                type="button"
                disabled={done}
                onClick={() => {
                  setPicked(o);
                  evaluate(o);
                }}
                className={`btn min-h-20 min-w-24 border-4 px-6 text-3xl shadow-md ${
                  isAnswer ? 'border-green-600 bg-green-100' : isPicked ? (feedback === 'good' ? 'border-green-600 bg-green-100' : feedback === 'bad' ? 'border-rose-400 bg-rose-50' : 'border-amber-brand bg-amber-50') : 'border-oman-100 bg-white hover:border-oman-300'
                }`}
              >
                {show(o)}
              </button>
            );
          })}
        </div>
      )}

      {q.type === 'number' && (
        <div>
          <NumberPad value={num} onChange={setNum} onSubmit={() => evaluate(Number(num))} disabled={done} />
          {revealed && <p className="mt-2 text-center text-2xl font-black text-green-700">الإجابة: {toAr(q.answer)}</p>}
        </div>
      )}

      {q.type === 'order' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex min-h-20 w-full flex-wrap items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-oman-300 bg-white p-3">
            {order.length === 0 && <span className="font-bold text-oman-300">المس الأعداد بالترتيب...</span>}
            {order.map((it, k) => (
              <span key={it.i} className="animate-pop rounded-2xl bg-oman-700 px-4 py-3 text-2xl font-black text-white">
                {show(it.v)}
                {k < order.length - 1 && <span className="mr-2 text-amber-300">←</span>}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {pool
              .filter((it) => !order.find((o) => o.i === it.i))
              .map((it) => (
                <button
                  key={it.i}
                  type="button"
                  disabled={done}
                  onClick={() => {
                    sfx('tap');
                    const next = [...order, it];
                    setOrder(next);
                    if (next.length === q.items.length) evaluate(next.map((x) => x.v));
                  }}
                  className="btn min-h-16 border-4 border-oman-100 bg-white px-5 text-2xl shadow"
                >
                  {show(it.v)}
                </button>
              ))}
          </div>
          {order.length > 0 && !done && (
            <button className="btn-ghost" onClick={() => setOrder((o) => o.slice(0, -1))}>
              ↩ تراجع
            </button>
          )}
          {revealed && <p className="text-center text-xl font-black text-green-700">الترتيب الصحيح: {q.answer.map(show).join(' ← ')}</p>}
        </div>
      )}

      <div className="flex min-h-20 items-center justify-center">
        {feedback && <FeedbackFace kind={feedback} />}
        {feedback === 'bad' && !done && q.hint && mode === 'practice' && <p className="mr-3 text-lg font-bold text-amber-800">💡 {q.hint}</p>}
      </div>
    </div>
  );
}
