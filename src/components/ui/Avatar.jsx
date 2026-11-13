// أفاتار مبسّط بالزي العماني: الدشداشة والكمّة للأولاد، والحجاب والزي المدرسي للبنات (رسم أصلي SVG)
const BG = ['#fde68a', '#bae6fd', '#bbf7d0', '#fecaca', '#ddd6fe', '#fed7aa', '#a5f3fc', '#fbcfe8', '#d9f99d'];
const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#f5d0a9', '#d4a373'];
const CAP = ['#0f4c5c', '#7c2d12', '#1e3a8a', '#065f46', '#6b21a8'];
const SCARF = ['#ffffff', '#f5f5f4', '#e0f2fe', '#fce7f3', '#ecfccb'];
const DRESS = ['#0f766e', '#be123c', '#1d4ed8', '#7e22ce', '#b45309'];

function hash(id = '') {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export default function Avatar({ student, size = 72, ring = false, className = '' }) {
  const h = hash(student?.id);
  const bg = BG[h % BG.length];
  const skin = SKIN[(h >> 3) % SKIN.length];
  const girl = student?.gender === 'f';
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 rounded-full ${ring ? 'ring-4 ring-amber-brand' : ''} ${className}`}
      role="img"
      aria-label={student?.name || 'أفاتار'}
    >
      <circle cx="50" cy="50" r="50" fill={bg} />
      {girl ? (
        <>
          {/* الزي المدرسي */}
          <path d="M18 100 C20 78 34 70 50 70 C66 70 80 78 82 100Z" fill={DRESS[(h >> 5) % DRESS.length]} />
          {/* الحجاب */}
          <path d="M26 52 C24 26 40 16 50 16 C60 16 76 26 74 52 C76 66 68 76 50 78 C32 76 24 66 26 52Z" fill={SCARF[(h >> 2) % SCARF.length]} stroke="#cbd5e1" strokeWidth="1.5" />
          <ellipse cx="50" cy="48" rx="17" ry="19" fill={skin} />
        </>
      ) : (
        <>
          {/* الدشداشة البيضاء والفراخة */}
          <path d="M16 100 C18 76 32 68 50 68 C68 68 82 76 84 100Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M50 70 L50 92" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="50" cy="94" r="2.6" fill="#94a3b8" />
          <ellipse cx="50" cy="48" rx="18" ry="20" fill={skin} />
          {/* الكمّة العمانية المطرّزة */}
          <path d="M31 38 C31 22 69 22 69 38 L69 40 L31 40Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <g fill={CAP[(h >> 4) % CAP.length]}>
            {[35, 41, 47, 53, 59, 65].map((x) => (
              <circle key={x} cx={x} cy="35" r="1.6" />
            ))}
            {[38, 44, 50, 56, 62].map((x) => (
              <circle key={x} cx={x} cy="29.5" r="1.3" />
            ))}
          </g>
          <path d="M31 39.5 L69 39.5" stroke={CAP[(h >> 4) % CAP.length]} strokeWidth="2" />
        </>
      )}
      {/* الوجه */}
      <circle cx="43" cy="49" r="2.4" fill="#1f2937" />
      <circle cx="57" cy="49" r="2.4" fill="#1f2937" />
      <path d="M43 57 Q50 63 57 57" stroke="#7c2d12" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="39" cy="55" r="2.6" fill="#f87171" opacity="0.35" />
      <circle cx="61" cy="55" r="2.6" fill="#f87171" opacity="0.35" />
    </svg>
  );
}
