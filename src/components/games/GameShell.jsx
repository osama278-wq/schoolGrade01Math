import { useEffect, useRef, useState } from 'react';
import { SpeakButton, Confetti } from '../ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

/**
 * إطار موحّد لألعاب الطلاقة الذهنية (٦٠–٩٠ ثانية)
 * children: ({ addScore, playing }) => JSX
 */
export default function GameShell({ title, icon, codes = [], instructions, seconds = 60, onEnd, best = 0, children }) {
  const [phase, setPhase] = useState('ready'); // ready | play | over
  const [left, setLeft] = useState(seconds);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPhase('over');
          sfx('alarm');
          speak(`انتهى الوقت! نقاطك ${scoreRef.current}`);
          onEnd?.(scoreRef.current);
          return 0;
        }
        if (s <= 6) sfx('tick');
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const addScore = (n) => {
    scoreRef.current = Math.max(0, scoreRef.current + n);
    setScore(scoreRef.current);
  };

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setLeft(seconds);
    setPhase('play');
    sfx('whoosh');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3 shadow">
        <span className="text-4xl">{icon}</span>
        <div className="flex-1">
          <h2 className="text-xl font-black text-oman-800">{title}</h2>
          <div className="flex flex-wrap gap-1">
            {codes.map((c) => (
              <span key={c} className="chip !py-0 !text-xs" dir="ltr">
                {c}
              </span>
            ))}
          </div>
        </div>
        <span className="chip !text-xl">⏱️ {toAr(left)}</span>
        <span className="chip !bg-amber-100 !text-xl !text-amber-800">💎 {toAr(score)}</span>
      </div>

      {phase === 'ready' && (
        <div className="card flex flex-col items-center gap-4 py-8 text-center">
          <SpeakButton text={instructions} auto />
          <p className="max-w-lg text-xl font-bold text-oman-700">{instructions}</p>
          <p className="text-sm font-bold text-oman-500">أفضل نتيجة لك: {toAr(best)}</p>
          <button className="btn-amber text-2xl" onClick={start}>
            ابدأ اللعب ▶
          </button>
        </div>
      )}
      {phase === 'play' && children({ addScore, playing: true })}
      {phase === 'over' && (
        <div className="card flex flex-col items-center gap-3 py-8 text-center">
          <Confetti show={score > best} />
          <span className="text-7xl">{score > best ? '🏆' : '🌟'}</span>
          <h3 className="text-3xl font-black text-oman-700">نقاطك: {toAr(score)}</h3>
          {score > best && <p className="font-bold text-green-700">رقم قياسي جديد!</p>}
          <button className="btn-primary text-xl" onClick={start}>
            ↺ العب مرة أخرى
          </button>
        </div>
      )}
    </div>
  );
}
