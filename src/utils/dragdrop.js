// سحب وإفلات موحّد يعمل باللمس والفأرة والقلم (Pointer Events) – مناسب للسبورات الذكية
// الاستخدام: onPointerDown={(e) => startDrag(e, { payload, ghost: '🔴', onDrop: (zoneId, payload) => ..., onTap })}
// مناطق الإفلات: أي عنصر يحمل data-drop="معرّف"

import { sfx } from './speech.js';

export function startDrag(e, { payload, ghost = '●', ghostStyle = '', onDrop, onTap }) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  let moved = false;
  let ghostEl = null;
  let hoverEl = null;

  const makeGhost = () => {
    ghostEl = document.createElement('div');
    ghostEl.className = 'drag-ghost';
    ghostEl.style.cssText = `font-size:44px;line-height:1;${ghostStyle}`;
    ghostEl.innerHTML = ghost;
    document.body.appendChild(ghostEl);
  };

  const zoneAt = (x, y) => {
    if (ghostEl) ghostEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (ghostEl) ghostEl.style.display = '';
    return el?.closest?.('[data-drop]') || null;
  };

  const move = (ev) => {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!moved && Math.hypot(dx, dy) > 6) {
      moved = true;
      makeGhost();
    }
    if (!moved) return;
    ghostEl.style.left = `${ev.clientX}px`;
    ghostEl.style.top = `${ev.clientY}px`;
    const z = zoneAt(ev.clientX, ev.clientY);
    if (z !== hoverEl) {
      hoverEl?.classList.remove('drop-target');
      z?.classList.add('drop-target');
      hoverEl = z;
    }
  };

  const up = (ev) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    hoverEl?.classList.remove('drop-target');
    if (!moved) {
      onTap?.(payload);
      return;
    }
    const z = zoneAt(ev.clientX, ev.clientY);
    ghostEl?.remove();
    if (z) {
      sfx('pop');
      onDrop?.(z.dataset.drop, payload);
    }
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}
