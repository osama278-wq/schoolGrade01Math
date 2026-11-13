import { useState } from 'react';
import { useApp, useStudent } from '../../context/AppContext.jsx';
import { BubblePairsGame, OasisRaceGame, OddEvenCatcherGame, ShapePuzzleGame } from '../../components/games/Games.jsx';
import { SpeakButton } from '../../components/ui/index.jsx';
import { toAr } from '../../utils/arabic.js';
import { sfx } from '../../utils/speech.js';

const GAMES = [
  { id: 'bubbles', icon: '🫧', name: 'فرقعة فقاعات أزواج العدد ١٠', time: '٦٠ ث', codes: '1Nc1 · 1Nc2', C: BubblePairsGame, bg: 'from-sky-300 to-cyan-600' },
  { id: 'race', icon: '🐪', name: 'سباق واحات الجمع والطرح', time: '٩٠ ث', codes: '1Nc1 · 1Nc4 · 1Nc5 · 1Nc6', C: OasisRaceGame, bg: 'from-amber-300 to-orange-600' },
  { id: 'catcher', icon: '🥅', name: 'صائد الأعداد الزوجية والفردية', time: '٦٠ ث', codes: '1Nc7', C: OddEvenCatcherGame, bg: 'from-emerald-300 to-green-700' },
  { id: 'shapes', icon: '🧩', name: 'بازل تكوين الأشكال والمجسمات', time: '٩٠ ث', codes: '1Gs1 · 1Gs2', C: ShapePuzzleGame, bg: 'from-violet-300 to-purple-700' }
];

export default function Arcade() {
  const { recordArcade } = useApp();
  const { sid, progress } = useStudent();
  const [game, setGame] = useState(null);

  if (game) {
    const G = game.C;
    return (
      <div className="flex flex-col gap-3">
        <button className="btn-ghost self-start" onClick={() => setGame(null)}>
          → كل الألعاب
        </button>
        <G best={progress.arcadeBest?.[game.id] || 0} onEnd={(score) => recordArcade(sid, game.id, score)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <SpeakButton text="ساحة الألعاب! اختر لعبة سريعة لتقوي الحساب الذهني." auto />
        <h1 className="text-2xl font-black text-oman-700 sm:text-3xl">ساحة الألعاب والطلاقة الذهنية</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              sfx('tap');
              setGame(g);
            }}
            className={`flex min-h-48 flex-col items-start justify-between rounded-[2rem] bg-gradient-to-br ${g.bg} p-5 text-start text-white shadow-xl transition hover:-translate-y-1`}
          >
            <span className="text-7xl drop-shadow">{g.icon}</span>
            <div>
              <div className="text-2xl font-black">{g.name}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-sm font-bold">
                <span className="rounded-full bg-white/25 px-2">⏱️ {g.time}</span>
                <span className="rounded-full bg-white/25 px-2" dir="ltr">
                  {g.codes}
                </span>
                <span className="rounded-full bg-white/25 px-2">🏆 {toAr(progress.arcadeBest?.[g.id] || 0)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
