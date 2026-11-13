import { useState } from 'react';
import TenFrame from '../../components/manipulatives/TenFrame.jsx';
import LinkingCubes from '../../components/manipulatives/LinkingCubes.jsx';
import NumberLine from '../../components/manipulatives/NumberLine.jsx';
import HundredBoard from '../../components/manipulatives/HundredBoard.jsx';
import BalanceScale from '../../components/manipulatives/BalanceScale.jsx';
import ClockMoney from '../../components/manipulatives/ClockMoney.jsx';
import { SpeakButton } from '../../components/ui/index.jsx';
import { sfx } from '../../utils/speech.js';

const TOOLS = [
  { id: 'tenframe', icon: '🔟', name: 'إطار العشرة المزدوج', desc: 'أقراص حمراء وصفراء وزرقاء بالسحب والإفلات', C: () => <TenFrame frames={2} colors={['red', 'yellow', 'blue']} /> },
  { id: 'cubes', icon: '🧱', name: 'المكعبات المتداخلة وأعمدة العشرات', desc: 'بناء الأعداد والأبراج الزوجية والفردية', C: LinkingCubes },
  { id: 'line', icon: '📏', name: 'خط الأعداد الديناميكي', desc: '٠–٢٠ و٠–٣٠ مع أقواس القفز للأمام والخلف', C: NumberLine },
  { id: 'hundred', icon: '💯', name: 'لوحة المائة التفاعلية', desc: 'التظليل واكتشاف الأنماط (من اليمين إلى اليسار)', C: HundredBoard },
  { id: 'balance', icon: '⚖️', name: 'الميزان ذو الكفتين', desc: 'محاكاة ميلان الكفتين بأوزان افتراضية', C: BalanceScale },
  { id: 'clockmoney', icon: '🕘', name: 'الوقت والنقود العمانية', desc: 'ساعة عقارب + أوراق ١ و٥ و١٠ ريالات', C: ClockMoney }
];

export default function Lab() {
  const [tool, setTool] = useState(TOOLS[0]);
  const [board, setBoard] = useState(false);
  const Comp = tool.C;

  const toggleBoard = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen?.();
        setBoard(true);
      } else {
        await document.exitFullscreen?.();
        setBoard(false);
      }
    } catch {
      setBoard((b) => !b);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SpeakButton text="مرحباً بك في مختبر الرياضيات الحسي. اختر أداة وجرّب بحرية." auto />
        <h1 className="flex-1 text-2xl font-black text-oman-700 sm:text-3xl">مختبر الرياضيات الحسي</h1>
        <button className="btn-ghost" onClick={toggleBoard}>🖥️ {board ? 'إنهاء وضع السبورة' : 'وضع السبورة الذكية'}</button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sfx('tap');
              setTool(t);
            }}
            className={`flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl p-2 text-center transition ${tool.id === t.id ? 'bg-oman-700 text-white shadow-lg' : 'bg-white text-oman-800 ring-2 ring-oman-100 hover:ring-oman-300'}`}
          >
            <span className="text-4xl">{t.icon}</span>
            <span className="text-sm font-black leading-tight">{t.name}</span>
          </button>
        ))}
      </div>

      <section className="rounded-[2rem] bg-white p-3 shadow-inner ring-4 ring-oman-100 sm:p-6">
        <div className="mb-3 text-center">
          <h2 className="text-2xl font-black text-oman-700">
            {tool.icon} {tool.name}
          </h2>
          <p className="font-bold text-oman-500">{tool.desc}</p>
        </div>
        <Comp key={tool.id} />
      </section>
    </div>
  );
}
