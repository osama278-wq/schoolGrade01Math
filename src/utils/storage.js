// =====================================================================
// طبقة التخزين المحلي (Offline-First)
// - IndexedDB عبر مكتبة idb (مخزن مفتاح/قيمة + طابور مزامنة)
// - احتياطي تلقائي إلى localStorage إذا لم يتوفر IndexedDB (وضع التصفح الخاص مثلاً)
// - طابور مزامنة (syncQueue) جاهز للربط بخادم المدرسة لاحقاً
// =====================================================================
import { openDB } from 'idb';

const DB_NAME = 'oman-g1-math';
const DB_VERSION = 1;
const KV = 'kv';
const QUEUE = 'syncQueue';
const LS_PREFIX = 'g1math:';

let dbPromise = null;
let useLocal = false;

function getDB() {
  if (useLocal) return null;
  if (!dbPromise) {
    if (typeof indexedDB === 'undefined') {
      useLocal = true;
      return null;
    }
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
        if (!db.objectStoreNames.contains(QUEUE)) db.createObjectStore(QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    }).catch(() => {
      useLocal = true;
      return null;
    });
  }
  return dbPromise;
}

export async function getItem(key, fallback = null) {
  try {
    const db = await getDB();
    if (db) {
      const v = await db.get(KV, key);
      return v === undefined ? fallback : v;
    }
  } catch {
    useLocal = true;
  }
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function setItem(key, value) {
  try {
    const db = await getDB();
    if (db) {
      await db.put(KV, value, key);
      return;
    }
  } catch {
    useLocal = true;
  }
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    /* المساحة ممتلئة */
  }
}

export async function removeItem(key) {
  try {
    const db = await getDB();
    if (db) await db.delete(KV, key);
  } catch {
    /* تجاهل */
  }
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch {
    /* تجاهل */
  }
}

// ------------------------- طابور المزامنة -------------------------

/** إضافة حدث (درجة، تذكرة خروج...) إلى طابور المزامنة لإرساله عند توفر الاتصال */
export async function enqueueSync(type, payload) {
  const item = { type, payload, ts: Date.now() };
  try {
    const db = await getDB();
    if (db) {
      await db.add(QUEUE, item);
      return;
    }
  } catch {
    /* تجاهل */
  }
  const list = (await getItem('__queue', [])) || [];
  list.push(item);
  await setItem('__queue', list);
}

export async function pendingSyncCount() {
  try {
    const db = await getDB();
    if (db) return await db.count(QUEUE);
  } catch {
    /* تجاهل */
  }
  return ((await getItem('__queue', [])) || []).length;
}

/**
 * نقطة الربط مع الخادم: مرّر دالة sender(items) تعيد true عند النجاح.
 * افتراضياً لا يوجد خادم، فتبقى العناصر محفوظة محلياً.
 */
export async function flushSync(sender) {
  if (typeof sender !== 'function' || !navigator.onLine) return 0;
  try {
    const db = await getDB();
    const items = db ? await db.getAll(QUEUE) : (await getItem('__queue', [])) || [];
    if (!items.length) return 0;
    const ok = await sender(items);
    if (ok) {
      if (db) await db.clear(QUEUE);
      else await setItem('__queue', []);
      return items.length;
    }
  } catch {
    /* تجاهل */
  }
  return 0;
}

/** تنزيل نسخة احتياطية JSON (لنقل البيانات بين الأجهزة أو أرشفتها) */
export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** تنزيل CSV متوافق مع Excel العربي (BOM + UTF-8) */
export function downloadCSV(filename, rows) {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
