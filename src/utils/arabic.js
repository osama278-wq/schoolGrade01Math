// أدوات العرض العربي: الأرقام المشرقية (كما في كتاب التلميذ) وصياغة الأعداد بالكلمات

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** تحويل أي رقم/نص يحوي أرقاماً لاتينية إلى أرقام عربية مشرقية */
export function toAr(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/** تحويل الأرقام المشرقية إلى لاتينية (لإدخال المعلمة) */
export function fromAr(value) {
  return String(value ?? '').replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

const ONES = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
const TEENS = {
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر'
};
const TENS = { 20: 'عشرون', 30: 'ثلاثون', 40: 'أربعون', 50: 'خمسون', 60: 'ستون', 70: 'سبعون', 80: 'ثمانون', 90: 'تسعون' };

/** العدد بالكلمات (0–100) للنطق الواضح للطفل */
export function numberToWords(n) {
  n = Number(n);
  if (!Number.isFinite(n)) return '';
  if (n <= 10) return ONES[n] ?? String(n);
  if (n < 20) return TEENS[n];
  if (n === 100) return 'مئة';
  if (n % 10 === 0) return TENS[n];
  if (n < 100) return `${ONES[n % 10]} و${TENS[n - (n % 10)]}`;
  return String(n);
}

const ORDINALS = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
export function ordinal(n) {
  return ORDINALS[n] || `رقم ${n}`;
}

export const HOUR_WORDS = {
  1: 'الواحدة',
  2: 'الثانية',
  3: 'الثالثة',
  4: 'الرابعة',
  5: 'الخامسة',
  6: 'السادسة',
  7: 'السابعة',
  8: 'الثامنة',
  9: 'التاسعة',
  10: 'العاشرة',
  11: 'الحادية عشرة',
  12: 'الثانية عشرة'
};

export function hourText(h) {
  return `الساعة ${HOUR_WORDS[h] || h}`;
}

/** صيغة الريال حسب العدد */
export function riyals(n) {
  if (n === 1) return 'ريال واحد';
  if (n === 2) return 'ريالان';
  if (n >= 3 && n <= 10) return `${toAr(n)} ريالات`;
  return `${toAr(n)} ريالاً`;
}
