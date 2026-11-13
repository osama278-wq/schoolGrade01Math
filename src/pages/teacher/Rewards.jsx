import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { earnedBadges, BADGES } from '../../data/index.js';
import Avatar from '../../components/ui/Avatar.jsx';

const TEMPLATES = [
  { id: 'excellence', title: 'شهادة تميّز', color: '#0f4c5c', accent: '#d97706', icon: '🏆' },
  { id: 'thanks', title: 'بطاقة شكر وتقدير', color: '#065f46', accent: '#ca8a04', icon: '💐' },
  { id: 'badge', title: 'وسام الإنجاز العماني', color: '#7c2d12', accent: '#0f4c5c', icon: '🏅' }
];

const REASONS = [
  'لإتقانه أزواج العدد ١٠ بطلاقة',
  'لتميّزه في الحساب الذهني',
  'لإكماله محطات الوحدة الأولى بنجاح',
  'لمشاركته الفاعلة في الحوار الشفوي',
  'لإبداعه في مشروع مطعم المدرسة',
  'لاجتهاده وتحسّن مستواه في الرياضيات',
  'لحصوله على الدرجة الكاملة في تذاكر الخروج'
];

/** تطبيع رقم الهاتف العماني إلى الصيغة الدولية لرابط واتساب */
function normalizePhone(p) {
  const d = String(p || '').replace(/[^\d]/g, '');
  if (!d) return '';
  if (d.length === 8) return `968${d}`;
  if (d.startsWith('00')) return d.slice(2);
  return d;
}

function OmaniBorder({ color, accent }) {
  // إطار زخرفي هندسي مستوحى من النقوش العمانية (رسم أصلي)
  const stars = Array.from({ length: 18 }, (_, i) => i);
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden="true">
      <rect x="10" y="10" width="780" height="540" rx="18" fill="none" stroke={color} strokeWidth="10" />
      <rect x="26" y="26" width="748" height="508" rx="12" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="10 6" />
      {stars.map((i) => (
        <g key={i}>
          <rect x={60 + i * 38} y="16" width="10" height="10" transform={`rotate(45 ${65 + i * 38} 21)`} fill={accent} />
          <rect x={60 + i * 38} y="534" width="10" height="10" transform={`rotate(45 ${65 + i * 38} 539)`} fill={accent} />
        </g>
      ))}
      {/* قلاع مبسطة في الزوايا */}
      {[
        [40, 40],
        [720, 40],
        [40, 480],
        [720, 480]
      ].map(([x, y], k) => (
        <path key={k} d={`M${x} ${y + 40} V${y + 14} h8 v-8 h8 v8 h8 V${y} h16 v14 h8 v-8 h8 v8 h8 v26Z`} fill={color} opacity="0.85" />
      ))}
    </svg>
  );
}

export default function Rewards() {
  const { state } = useApp();
  const [sid, setSid] = useState(state.roster[0]?.id);
  const [tpl, setTpl] = useState(TEMPLATES[0]);
  const [reason, setReason] = useState(REASONS[0]);
  const [custom, setCustom] = useState('');
  const [phone, setPhone] = useState('');
  const student = state.roster.find((s) => s.id === sid);
  const girl = student?.gender === 'f';
  const badges = useMemo(() => earnedBadges(state.progress[sid]), [state.progress, sid]);
  const finalReason = custom.trim() || (girl ? reason.replace('لإتقانه', 'لإتقانها').replace('لتميّزه', 'لتميّزها').replace('لإكماله', 'لإكمالها').replace('لمشاركته', 'لمشاركتها').replace('لإبداعه', 'لإبداعها').replace('لاجتهاده وتحسّن مستواه', 'لاجتهادها وتحسّن مستواها').replace('لحصوله', 'لحصولها') : reason);
  const date = new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });

  const message = `السلام عليكم ورحمة الله،
وليّ أمر ${girl ? 'التلميذة' : 'التلميذ'} ${student?.name} المحترم،
يسعدنا في ${state.settings.school} أن نهنئكم بحصول ${girl ? 'ابنتكم' : 'ابنكم'} على «${tpl.title}» في مادة الرياضيات ${finalReason}.
نشكر لكم متابعتكم وشراكتكم الإيجابية 🌟
${state.settings.teacherName} – ${state.settings.className}`;

  const waLink = `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black text-oman-800 no-print">مركز التكريم والتواصل عبر واتساب</h1>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="card flex flex-col gap-3 no-print">
          <label className="font-bold">
            التلميذ
            <select className="mt-1 w-full rounded-xl border-2 border-oman-100 p-2" value={sid} onChange={(e) => setSid(e.target.value)}>
              {state.roster.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="font-bold">
            القالب
            <div className="mt-1 grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTpl(t)} className={`rounded-2xl p-2 text-xs font-bold ${tpl.id === t.id ? 'text-white' : 'bg-white ring-2 ring-oman-100'}`} style={tpl.id === t.id ? { background: t.color } : {}}>
                  <div className="text-2xl">{t.icon}</div>
                  {t.title}
                </button>
              ))}
            </div>
          </div>
          <label className="font-bold">
            سبب التكريم
            <select className="mt-1 w-full rounded-xl border-2 border-oman-100 p-2" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="font-bold">
            أو عبارة مخصصة
            <input className="mt-1 w-full rounded-xl border-2 border-oman-100 p-2" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="مثال: لمساعدته زملاءه في المجموعة" />
          </label>
          <label className="font-bold">
            رقم هاتف ولي الأمر (اختياري)
            <input className="mt-1 w-full rounded-xl border-2 border-oman-100 p-2" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9xxxxxxx" />
          </label>
          <p className="text-xs text-slate-500">بدون رقم: يفتح واتساب لتختاري جهة الاتصال. لا يُحفظ الرقم.</p>
          <div className="flex flex-wrap gap-2">
            <a className="btn flex-1 bg-[#25D366] text-white" href={waLink} target="_blank" rel="noreferrer">
              🟢 مشاركة عبر واتساب
            </a>
            <button className="btn-primary flex-1" onClick={() => window.print()}>
              🖨️ طباعة
            </button>
          </div>
          {badges.length > 0 && (
            <div className="rounded-2xl bg-amber-50 p-2 text-sm">
              <b>أوسمة {student?.name}: </b>
              {badges.map((b) => BADGES.find((x) => x.id === b)?.icon).join(' ')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="print-area relative mx-auto aspect-[800/560] w-full max-w-3xl overflow-hidden rounded-3xl bg-[#fffdf7] shadow-xl">
            <OmaniBorder color={tpl.color} accent={tpl.accent} />
            <div className="relative flex h-full flex-col items-center justify-center gap-2 px-16 py-10 text-center">
              <div className="text-sm font-bold text-slate-600">
                {state.settings.school} · {state.settings.className}
              </div>
              <div className="text-5xl">{tpl.icon}</div>
              <h2 className="text-4xl font-black" style={{ color: tpl.color }}>
                {tpl.title}
              </h2>
              <p className="text-lg font-bold text-slate-700">{girl ? 'تُمنح للتلميذة المتميزة' : 'تُمنح للتلميذ المتميز'}</p>
              <div className="flex items-center gap-3">
                <Avatar student={student} size={64} />
                <span className="border-b-4 pb-1 text-4xl font-black" style={{ borderColor: tpl.accent, color: tpl.color }}>
                  {student?.name}
                </span>
              </div>
              <p className="max-w-lg text-xl font-bold text-slate-800">{finalReason} في مادة الرياضيات، متمنين {girl ? 'لها' : 'له'} دوام التفوق والنجاح.</p>
              <div className="mt-3 flex w-full justify-between px-6 text-sm font-bold text-slate-600">
                <span>التاريخ: {date}</span>
                <span>المعلمة: {state.settings.teacherName}</span>
              </div>
            </div>
          </div>
          <div className="card no-print">
            <div className="mb-1 text-sm font-bold text-oman-600">نص رسالة واتساب:</div>
            <pre className="whitespace-pre-wrap font-sans text-sm">{message}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
