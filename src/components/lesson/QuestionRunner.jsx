import { useRef, useState } from 'react';
import QuestionCard from './QuestionCard.jsx';
import { ProgressBar } from '../ui/index.jsx';
import { toAr } from '../../utils/arabic.js';

/**
 * يشغّل سلسلة أسئلة ويجمع النتائج.
 * onFinish({ correct, total, points, maxPoints, skillErrors, results })
 */
export default function QuestionRunner({ questions, mode = 'practice', onFinish, onProgress, header }) {
  const [idx, setIdx] = useState(0);
  const results = useRef([]);

  const q = questions[idx];
  const maxPoints = questions.reduce((a, x) => a + (x.points || 1), 0);

  const handle = (r) => {
    results.current[idx] = { ...r, id: q.id, skill: q.skill };
    onProgress?.({ points: results.current.reduce((a, x) => a + (x?.points || 0), 0), answered: idx + 1 });
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else {
      const res = results.current;
      const skillErrors = {};
      res.forEach((x) => {
        if (!x.correct && x.skill) skillErrors[x.skill] = (skillErrors[x.skill] || 0) + 1;
      });
      onFinish?.({
        correct: res.filter((x) => x.firstTry).length,
        solved: res.filter((x) => x.correct).length,
        total: questions.length,
        points: res.reduce((a, x) => a + x.points, 0),
        maxPoints,
        skillErrors,
        results: res
      });
    }
  };

  if (!q) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {header}
        <span className="chip shrink-0">
          السؤال {toAr(idx + 1)} من {toAr(questions.length)}
        </span>
        <ProgressBar value={idx} max={questions.length} />
      </div>
      <QuestionCard key={q.id} q={q} mode={mode} onResult={handle} />
    </div>
  );
}
