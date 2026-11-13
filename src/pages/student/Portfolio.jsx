import { useRef, useState } from 'react';
import { useApp, useStudent } from '../../context/AppContext.jsx';
import { BADGES, LESSONS, earnedBadges } from '../../data/index.js';
import { PROJECT_IDEAS } from '../../data/assessment.js';
import { SpeakButton, SectionTitle, Modal } from '../../components/ui/index.jsx';
import { speak, sfx } from '../../utils/speech.js';
import { toAr } from '../../utils/arabic.js';

/** تصغير صورة إلى Data URL (لحفظها محلياً دون تضخيم التخزين) */
function resizeImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AudioRecorder({ onSave }) {
  const [rec, setRec] = useState(null);
  const [secs, setSecs] = useState(0);
  const timer = useRef(null);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        const fr = new FileReader();
        fr.onload = () => onSave(fr.result);
        fr.readAsDataURL(blob);
      };
      mr.start();
      setRec(mr);
      setSecs(0);
      timer.current = setInterval(() => {
        setSecs((s) => {
          if (s >= 119) {
            mr.stop();
            clearInterval(timer.current);
            setRec(null);
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      speak('لا يمكن الوصول إلى الميكروفون على هذا الجهاز');
    }
  };
  const stop = () => {
    rec?.stop();
    clearInterval(timer.current);
    setRec(null);
  };
  return rec ? (
    <button className="btn bg-rose-600 text-white" onClick={stop}>
      ⏹️ إيقاف التسجيل ({toAr(secs)} ث)
    </button>
  ) : (
    <button className="btn-ghost" onClick={start}>
      🎙️ سجّل عرضاً شفوياً قصيراً
    </button>
  );
}

export default function Portfolio() {
  const { addPortfolio, removePortfolio } = useApp();
  const { sid, progress } = useStudent();
  const earned = earnedBadges(progress);
  const fileRef = useRef(null);
  const [draft, setDraft] = useState(null);

  const canDo = LESSONS.map((l) => ({ lesson: l, achieved: (progress.lessons?.[l.id]?.stars || 0) >= 2 }));
  const achievedCount = canDo.filter((c) => c.achieved).reduce((a, c) => a + c.lesson.canDo.length, 0);
  const totalCanDo = LESSONS.reduce((a, l) => a + l.canDo.length, 0);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await resizeImage(f);
      setDraft((d) => ({ ...(d || { type: 'work', title: 'عمل من أعمالي' }), image: data }));
    } catch {
      speak('تعذّر فتح الصورة');
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <SpeakButton text={`هذا ملف إنجازك. حصلت على ${earned.length} أوسمة، وحققت ${achievedCount} من عبارات أستطيع.`} auto />
        <h1 className="text-2xl font-black text-oman-700 sm:text-3xl">ملف أعمالي وأوسمتي</h1>
      </div>

      <section className="card">
        <SectionTitle icon="🏅">الأوسمة العمانية</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => {
            const has = earned.includes(b.id);
            return (
              <button key={b.id} onClick={() => speak(`${b.title}. ${b.desc}`)} className={`flex flex-col items-center gap-1 rounded-3xl p-3 text-center ${has ? 'bg-amber-50 ring-4 ring-amber-brand' : 'bg-slate-100 opacity-50 grayscale'}`}>
                <span className="text-5xl">{b.icon}</span>
                <span className="font-black text-oman-800">{b.title}</span>
                <span className="text-xs font-bold text-oman-600">{b.desc}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <SectionTitle icon="✅" action={<span className="chip">{toAr(achievedCount)} / {toAr(totalCanDo)}</span>}>
          عبارات «أستطيع»
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {canDo.map(({ lesson, achieved }) => (
            <div key={lesson.id} className={`rounded-2xl p-3 ${achieved ? 'bg-green-50' : 'bg-slate-50'}`}>
              <div className="mb-1 text-sm font-black text-oman-600">
                {lesson.icon} المحطة {toAr(lesson.id)}: {lesson.title}
              </div>
              <ul className="space-y-1">
                {lesson.canDo.map((c) => (
                  <li key={c}>
                    <button className="flex items-center gap-2 text-start font-bold" onClick={() => speak(c)}>
                      <span className="text-xl">{achieved ? '⭐' : '☆'}</span>
                      <span className={achieved ? 'text-green-800' : 'text-slate-500'}>{c}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <SectionTitle
          icon="🗂️"
          action={
            <div className="flex flex-wrap gap-2">
              <button className="btn-amber" onClick={() => setDraft({ type: 'work', title: 'عمل من أعمالي' })}>
                ➕ أضف عملاً
              </button>
            </div>
          }
        >
          أعمالي ومشاريعي
        </SectionTitle>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {PROJECT_IDEAS.map((p) => (
            <button key={p.id} onClick={() => setDraft({ type: 'project', title: p.title, note: p.desc })} className="rounded-2xl border-2 border-dashed border-oman-300 p-3 text-start hover:bg-oman-50">
              <div className="font-black text-oman-700">📁 {p.title}</div>
              <div className="text-sm text-oman-600">{p.desc}</div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(progress.portfolio || []).length === 0 && <p className="col-span-full text-center font-bold text-oman-300">لا توجد أعمال بعد. أضف صورة لعملك أو مشروعك!</p>}
          {(progress.portfolio || []).map((it) => (
            <figure key={it.id} className="relative overflow-hidden rounded-2xl bg-oman-50 ring-2 ring-oman-100">
              {it.image ? <img src={it.image} alt={it.title} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center text-6xl">{it.type === 'project' ? '📁' : it.audio ? '🎙️' : '📝'}</div>}
              <figcaption className="p-2">
                <div className="text-sm font-black text-oman-800">{it.title}</div>
                {it.note && <div className="line-clamp-2 text-xs text-oman-600">{it.note}</div>}
                {it.audio && <audio controls src={it.audio} className="mt-1 w-full" />}
                <div className="text-[11px] text-slate-500">{new Date(it.ts).toLocaleDateString('ar-OM')}</div>
              </figcaption>
              <button className="absolute left-1 top-1 h-9 w-9 rounded-full bg-white/90 text-sm shadow" onClick={() => removePortfolio(sid, it.id)} aria-label="حذف">
                🗑️
              </button>
            </figure>
          ))}
        </div>
      </section>

      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} title="إضافة إلى ملف الإنجاز">
        {draft && (
          <div className="flex flex-col gap-3">
            <label className="font-bold">
              العنوان
              <input className="mt-1 w-full rounded-xl border-2 border-oman-100 p-3" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label className="font-bold">
              ملاحظة
              <textarea className="mt-1 w-full rounded-xl border-2 border-oman-100 p-3" rows={2} value={draft.note || ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
            </label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
                📷 صورة / كاميرا
              </button>
              <AudioRecorder onSave={(audio) => setDraft((d) => ({ ...d, audio, type: d.type === 'work' ? 'presentation' : d.type }))} />
            </div>
            {draft.image && <img src={draft.image} alt="" className="max-h-48 rounded-xl object-contain" />}
            {draft.audio && <audio controls src={draft.audio} />}
            <button
              className="btn-primary text-lg"
              onClick={() => {
                addPortfolio(sid, draft);
                sfx('star');
                speak('أُضيف عملك إلى ملف الإنجاز');
                setDraft(null);
              }}
            >
              💾 احفظ في ملفي
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
