// =====================================================================
// مخطط سجل التقويم المستمر – الرياضيات للصفين (١–٢)
// المرجع: وثيقة تقويم تعلم التلاميذ في مواد المجال الثاني (2026م)
// المعرفة والفهم ٧٠ + حل المشكلات ٣٠ = ١٠٠ درجة (لا توجد اختبارات قصيرة للصفين ١–٢)
// =====================================================================

export const DOMAINS = {
  K: { label: 'المعرفة والفهم', total: 70 },
  PS: { label: 'حل المشكلات', total: 30 }
};

export const ASSESSMENT_TOOLS = [
  {
    key: 'dialogue',
    title: 'الحوار الشفوي',
    total: 25,
    note: '٩ درجات للحساب الذهني (1Nc1–1Nc7) تُرصد ٣ مرات × ٣ درجات، و١١ درجة حواران (٥ و٦)، و٥ درجات لحل المشكلات تُرصد مرة واحدة.',
    fields: [
      { id: 'dlgM1', label: 'حساب ذهني ١', short: 'ذهني ١', max: 3, domain: 'K', mental: true },
      { id: 'dlgM2', label: 'حساب ذهني ٢', short: 'ذهني ٢', max: 3, domain: 'K', mental: true },
      { id: 'dlgM3', label: 'حساب ذهني ٣', short: 'ذهني ٣', max: 3, domain: 'K', mental: true },
      { id: 'dlg5', label: 'حوار (٥ درجات)', short: 'حوار ٥', max: 5, domain: 'K' },
      { id: 'dlg6', label: 'حوار (٦ درجات)', short: 'حوار ٦', max: 6, domain: 'K' },
      { id: 'dlgPS', label: 'حوار حل المشكلات', short: 'حوار ح.م', max: 5, domain: 'PS' }
    ]
  },
  {
    key: 'presentation',
    title: 'العرض الشفوي',
    total: 5,
    note: 'عرض شفوي واحد خلال العام الدراسي (بحد أقصى ٥ دقائق) في موضوع سبق تدريسه، وفق ٥ معايير أداء.',
    fields: [{ id: 'pres', label: 'العرض الشفوي', short: 'العرض', max: 5, domain: 'K' }]
  },
  {
    key: 'homework',
    title: 'الواجبات المنزلية',
    total: 25,
    note: '٤ مرات × ٥ درجات (معرفة وفهم) + مرة واحدة × ٥ درجات (حل المشكلات).',
    fields: [
      { id: 'hwK1', label: 'واجب ١', short: 'و١', max: 5, domain: 'K', auto: 'homework' },
      { id: 'hwK2', label: 'واجب ٢', short: 'و٢', max: 5, domain: 'K', auto: 'homework' },
      { id: 'hwK3', label: 'واجب ٣', short: 'و٣', max: 5, domain: 'K', auto: 'homework' },
      { id: 'hwK4', label: 'واجب ٤', short: 'و٤', max: 5, domain: 'K', auto: 'homework' },
      { id: 'hwPS', label: 'واجب حل المشكلات', short: 'و ح.م', max: 5, domain: 'PS', auto: 'homework' }
    ]
  },
  {
    key: 'shortq',
    title: 'الأسئلة القصيرة',
    total: 30,
    note: '٤ مرات × ٥ (معرفة وفهم) + مرتان × ٥ (حل المشكلات). ٣–٤ مفردات، ١٠ دقائق كحد أقصى، درجات المفردة (٠، ١، ٢) بدون أنصاف.',
    fields: [
      { id: 'sqK1', label: 'سؤال قصير ١', short: 'س١', max: 5, domain: 'K', auto: 'exit' },
      { id: 'sqK2', label: 'سؤال قصير ٢', short: 'س٢', max: 5, domain: 'K', auto: 'exit' },
      { id: 'sqK3', label: 'سؤال قصير ٣', short: 'س٣', max: 5, domain: 'K', auto: 'exit' },
      { id: 'sqK4', label: 'سؤال قصير ٤', short: 'س٤', max: 5, domain: 'K', auto: 'exit' },
      { id: 'sqPS1', label: 'سؤال قصير ح.م ١', short: 'س ح.م١', max: 5, domain: 'PS', auto: 'exit' },
      { id: 'sqPS2', label: 'سؤال قصير ح.م ٢', short: 'س ح.م٢', max: 5, domain: 'PS', auto: 'exit' }
    ]
  },
  {
    key: 'project',
    title: 'المشروع',
    total: 15,
    note: 'مرة واحدة سنوياً: التخطيط (٥) والتنفيذ (٥) في عمود حل المشكلات، والتقرير والعرض (٥) في عمود المعرفة والفهم.',
    fields: [
      { id: 'projPlan', label: 'التخطيط', short: 'تخطيط', max: 5, domain: 'PS' },
      { id: 'projExec', label: 'التنفيذ', short: 'تنفيذ', max: 5, domain: 'PS' },
      { id: 'projReport', label: 'التقرير والعرض', short: 'تقرير', max: 5, domain: 'K' }
    ]
  }
];

export const ALL_FIELDS = ASSESSMENT_TOOLS.flatMap((t) => t.fields.map((f) => ({ ...f, tool: t.key, toolTitle: t.title })));
export const FIELD_BY_ID = Object.fromEntries(ALL_FIELDS.map((f) => [f.id, f]));

// تحقق داخلي من مطابقة المجاميع للوثيقة
const sum = (d) => ALL_FIELDS.filter((f) => f.domain === d).reduce((a, f) => a + f.max, 0);
if (sum('K') !== 70 || sum('PS') !== 30) {
  // eslint-disable-next-line no-console
  console.error('مخطط التقويم لا يطابق توزيع الوثيقة (70/30)');
}

/**
 * قواعد الوثيقة الإلزامية:
 * 1) لا أنصاف درجات (أعداد صحيحة فقط)
 * 2) لا يُمنح التلميذ درجة صفر في حالة تنفيذ الأداة (الحد الأدنى ١)
 * 3) لا تتجاوز الدرجة العظمى للبند
 * الحقل الفارغ = الأداة لم تُنفّذ بعد.
 */
export function validateScore(raw, max) {
  if (raw === '' || raw === null || raw === undefined) return { ok: true, value: null };
  const str = String(raw).trim().replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/[.,،٫]/.test(str)) return { ok: false, error: 'لا يُسمح بأنصاف الدرجات' };
  if (!/^\d+$/.test(str)) return { ok: false, error: 'أدخل عدداً صحيحاً' };
  const n = Number(str);
  if (n === 0) return { ok: false, error: 'لا يُمنح التلميذ صفراً عند تنفيذ الأداة (الحد الأدنى ١)' };
  if (n > max) return { ok: false, error: `الدرجة العظمى لهذا البند ${max}` };
  return { ok: true, value: n };
}

/** تحويل درجة أداة مُنفّذة إلى عدد صحيح بحد أدنى ١ (تذاكر الخروج والواجبات الإلكترونية) */
export function toolScore(score, max) {
  return Math.min(max, Math.max(1, Math.round(Number(score) || 0)));
}

export function computeTotals(record = {}) {
  let K = 0;
  let PS = 0;
  let filled = 0;
  let maxFilled = 0;
  for (const f of ALL_FIELDS) {
    const v = record[f.id];
    if (typeof v === 'number') {
      filled++;
      maxFilled += f.max;
      if (f.domain === 'K') K += v;
      else PS += v;
    }
  }
  const complete = filled === ALL_FIELDS.length;
  // مؤشر مبدئي: نسبة ما حصل عليه من مجموع الخانات المرصودة فقط (حتى اكتمال الرصد)
  const percent = maxFilled ? Math.round(((K + PS) / maxFilled) * 100) : 0;
  return { K, PS, total: K + PS, filled, count: ALL_FIELDS.length, maxFilled, percent, complete };
}

export function toolTotal(record, toolKey) {
  const tool = ASSESSMENT_TOOLS.find((t) => t.key === toolKey);
  return tool.fields.reduce((a, f) => a + (typeof record?.[f.id] === 'number' ? record[f.id] : 0), 0);
}

// مستويات التحصيل (قابلة للتعديل وفق تعميم المديرية)
export const LEVELS = [
  { min: 90, letter: 'أ', label: 'ممتاز', color: '#15803d' },
  { min: 80, letter: 'ب', label: 'جيد جداً', color: '#4d7c0f' },
  { min: 65, letter: 'ج', label: 'جيد', color: '#ca8a04' },
  { min: 50, letter: 'د', label: 'مقبول', color: '#ea580c' },
  { min: 0, letter: 'هـ', label: 'يحتاج إلى مساعدة', color: '#dc2626' }
];

export function levelFor(total) {
  return LEVELS.find((l) => total >= l.min) || LEVELS[LEVELS.length - 1];
}

/** المستوى النهائي عند اكتمال الرصد، أو مؤشر مبدئي (≈) من الخانات المرصودة */
export function levelLabel(t) {
  if (!t.filled) return { text: '—', color: '#94a3b8', title: 'لم يُرصد بعد' };
  if (t.complete) {
    const l = levelFor(t.total);
    return { text: l.letter, color: l.color, title: `${l.label} (${t.total}/100)` };
  }
  const l = levelFor(t.percent);
  return { text: `≈${l.letter}`, color: l.color, title: `مؤشر مبدئي: ${t.percent}% من ${t.maxFilled} درجة مرصودة` };
}

// معايير الحوار (المعرفة والفهم أو حل المشكلات) – تدرّج ١–٥
export const DIALOGUE_RUBRIC = {
  scale: [
    { score: 5, label: 'دائماً' },
    { score: 4, label: 'غالباً' },
    { score: 3, label: 'أحياناً' },
    { score: 2, label: 'قليلاً' },
    { score: 1, label: 'نادراً' }
  ],
  criteria: [
    'يستخدم الرموز والمصطلحات الرياضية للتعبير عن أفكاره وتكون مشاركاته وإجاباته دقيقة',
    'يعرض أفكاراً مترابطة وواضحة لزملائه ومعلمه',
    'يتتبع أفكار وطرق حل ومناقشات زملائه ويقوّمها',
    'يعطي إجابات صحيحة على الأسئلة بمستوياتها المختلفة'
  ]
};

// معايير العرض الشفوي – تدرّج ١–٥
export const PRESENTATION_RUBRIC = {
  scale: [
    { score: 5, label: 'يتقن معايير العرض' },
    { score: 4, label: 'يحقق معايير العرض' },
    { score: 3, label: 'يقترب من تحقيق معايير العرض' },
    { score: 2, label: 'بحاجة إلى تطوير' },
    { score: 1, label: 'لا يحقق معايير العرض' }
  ],
  criteria: [
    'التحدث بصوت واضح ومسموع',
    'شرح الأفكار الرياضية بطريقة مترابطة وسهلة الفهم',
    'تقديم حلول صحيحة ودقيقة',
    'توضيح خطوات الحل أو استخدام أمثلة داعمة',
    'استخدام وسائل مثل الرسوم أو الجداول أو الأدوات التوضيحية لدعم العرض'
  ]
};

// بنود تصحيح المشروع للصفين (١–٢)
export const PROJECT_RUBRIC = [
  { id: 'projPlan', title: 'التخطيط (٥ درجات) – حل المشكلات', items: ['تحديد الهدف من المشروع', 'تحديد أدوات المشروع', 'تحديد الطريقة المناسبة لجمع البيانات وعرضها'] },
  { id: 'projExec', title: 'التنفيذ (٥ درجات) – حل المشكلات', items: ['تنظيم البيانات', 'تنفيذ المشروع بجودة وبالأدوات المناسبة', 'الإجابة عن الأسئلة بطرق صحيحة ومتسلسلة وواضحة'] },
  { id: 'projReport', title: 'التقرير والعرض (٥ درجات) – المعرفة والفهم', items: ['دقة ووضوح الأدلة', 'وضوح التقرير والعرض', 'التواصل بلغة واضحة ومنطقية'] }
];

export const PROJECT_IDEAS = [
  { id: 'canteen', title: 'مشروع مطعم المدرسة', desc: 'تصميم قائمة طعام داخل أشكال هندسية، وتحديد الأسعار، وملصق أوقات العمل بالساعة الكاملة.', lessons: [6, 9] },
  { id: 'solids', title: 'مشروع تصنيف المجسمات', desc: 'جمع مجسمات من البيت (علب، كرات، أقماع) وتصنيفها وتصويرها مع أسمائها.', lessons: [6] },
  { id: 'measure', title: 'مشروع بصمة القدم', desc: 'قياس أقدام أفراد الأسرة بالمكعبات أو الأقلام وترتيبها من الأقصر إلى الأطول.', lessons: [3] }
];
