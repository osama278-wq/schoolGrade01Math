import curriculum from './curriculum.json';
import classroom from './classroom.json';
import { ALL_FIELDS, toolScore } from './assessment.js';
import { seeded } from '../utils/random.js';

export { curriculum, classroom };

export const LESSONS = curriculum.lessons;
export const UNITS = curriculum.units;
export const SKILLS = curriculum.skills;
export const HOMEWORK = curriculum.homework;
export const BADGES = curriculum.badges;
export const MENTAL = curriculum.mentalStrategies;

const byId = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const getLesson = (id) => byId[Number(id)];
export const getUnit = (id) => UNITS.find((u) => u.id === Number(id));
export const lessonsOfUnit = (unitId) => LESSONS.filter((l) => l.unit === Number(unitId));

/** خريطة: رمز خانة السجل ← الدرس الذي تُستورد منه تذكرة الخروج */
export const EXIT_SLOTS = Object.fromEntries(LESSONS.filter((l) => l.exitTicket.slot).map((l) => [l.exitTicket.slot, l.id]));

export function starsFromAccuracy(correct, total) {
  if (!total) return 0;
  const p = correct / total;
  if (p >= 0.9) return 3;
  if (p >= 0.65) return 2;
  return 1;
}

// ------------------------- بيانات تجريبية للشعبة -------------------------
// صعوبة نسبية لكل محطة (لإظهار فجوات واقعية في الخريطة الحرارية: أزواج العشرة وخط الأعداد)
const DIFFICULTY = { 1: 0.05, 2: 0.32, 3: 0.12, 4: 0.38, 5: 0.2, 6: 0.15, 7: 0.28, 8: 0.1, 9: 0.25, 10: 0.08, 11: 0.18, 12: 0.22, 13: 0.42, 14: 0.3 };

export function emptyStudentProgress() {
  return { lessons: {}, points: 0, arcadeBest: {}, skillErrors: {}, portfolio: [], homework: {} };
}

export function buildDemoState() {
  const rnd = seeded(2026);
  const progress = {};
  const assessment = {};
  const exitLog = [];
  const now = Date.now();

  classroom.students.forEach((s, idx) => {
    const ability = 0.74 + rnd() * 0.28; // 0.74–1.02
    const reached = 6 + Math.floor(rnd() * 4); // آخر محطة مكتملة 6–9
    const p = emptyStudentProgress();
    const rec = {};

    for (const l of LESSONS) {
      if (l.id > reached) break;
      const chance = Math.max(0.2, Math.min(1, ability - DIFFICULTY[l.id] * 0.65 + (rnd() - 0.5) * 0.22));
      const total = 6;
      const correct = Math.max(1, Math.round(total * chance));
      const exitMax = 5;
      const exitScore = toolScore(Math.round(exitMax * Math.min(1, chance + 0.05)), exitMax);
      p.lessons[l.id] = {
        completed: true,
        stars: starsFromAccuracy(correct, total),
        practice: { correct, total },
        exit: { score: exitScore, max: exitMax, ts: now - (reached - l.id + 1) * 86400000 * 2 }
      };
      exitLog.push({ sid: s.id, lessonId: l.id, score: exitScore, max: exitMax, ts: p.lessons[l.id].exit.ts });
      if (chance < 0.6) {
        for (const sk of l.skills) p.skillErrors[sk] = (p.skillErrors[sk] || 0) + Math.ceil((0.6 - chance) * 10);
      }
      if (l.exitTicket.slot) rec[l.exitTicket.slot] = exitScore;
      p.points += correct * 10 + exitScore * 10;
    }

    // واجبات إلكترونية منجزة
    ['hw1', 'hw2'].forEach((hw, i) => {
      if (rnd() < 0.9) {
        const sc = toolScore(Math.round(5 * Math.min(1, ability + (rnd() - 0.4) * 0.3)), 5);
        p.homework[hw] = { score: sc, max: 5, ts: now - (10 - i * 4) * 86400000 };
        rec[i === 0 ? 'hwK1' : 'hwK2'] = sc;
      }
    });

    // حوار شفوي – أول رصد للحساب الذهني وحوار (٥)
    rec.dlgM1 = toolScore(Math.round(3 * ability), 3);
    if (rnd() < 0.7) rec.dlg5 = toolScore(Math.round(5 * ability), 5);

    p.arcadeBest = { bubbles: Math.round(ability * 120), race: Math.round(ability * 90) };
    p.points += p.arcadeBest.bubbles;
    if (idx % 4 === 0) {
      p.portfolio.push({ id: `pf-${s.id}`, type: 'project', title: 'ملصق أوقات عمل مطعم المدرسة', note: 'مشروع جماعي', ts: now - 5 * 86400000 });
    }

    progress[s.id] = p;
    assessment[s.id] = rec;
  });

  exitLog.sort((a, b) => b.ts - a.ts);

  return {
    version: 1,
    session: { role: null, studentId: null },
    settings: {
      unlockAll: false,
      school: classroom.school,
      className: classroom.className,
      teacherName: classroom.teacher,
      academicYear: classroom.academicYear
    },
    roster: classroom.students,
    progress,
    assessment,
    manual: {},
    exitLog: exitLog.slice(0, 400),
    mentalLog: []
  };
}

export function blankState(roster = classroom.students) {
  const progress = {};
  const assessment = {};
  roster.forEach((s) => {
    progress[s.id] = emptyStudentProgress();
    assessment[s.id] = {};
  });
  return {
    version: 1,
    session: { role: null, studentId: null },
    settings: {
      unlockAll: false,
      school: classroom.school,
      className: classroom.className,
      teacherName: classroom.teacher,
      academicYear: classroom.academicYear
    },
    roster,
    progress,
    assessment,
    manual: {},
    exitLog: [],
    mentalLog: []
  };
}

/** نسبة إتقان التلميذ لمحطة (0–1) أو null إن لم تبدأ */
export function lessonMastery(lp) {
  if (!lp) return null;
  const parts = [];
  if (lp.practice?.total) parts.push(lp.practice.correct / lp.practice.total);
  if (lp.exit?.max) parts.push(lp.exit.score / lp.exit.max);
  if (!parts.length) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

export function masteryColor(m) {
  if (m === null || m === undefined) return { bg: '#e5e7eb', fg: '#6b7280', label: 'لم يبدأ' };
  if (m >= 0.8) return { bg: '#22c55e', fg: '#fff', label: 'إتقان' };
  if (m >= 0.6) return { bg: '#facc15', fg: '#713f12', label: 'بحاجة لتدريب' };
  return { bg: '#ef4444', fg: '#fff', label: 'فجوة' };
}

/** الأوسمة المكتسبة (مشتقة من التقدم) */
export function earnedBadges(p) {
  if (!p) return [];
  const done = Object.entries(p.lessons || {}).filter(([, v]) => v.completed);
  const doneIds = done.map(([k]) => Number(k));
  const three = done.filter(([, v]) => v.stars === 3).length;
  const perfectExits = done.filter(([, v]) => v.exit && v.exit.score === v.exit.max).length;
  const arcade = Object.values(p.arcadeBest || {}).reduce((a, b) => a + b, 0);
  const res = [];
  if (doneIds.length >= 1) res.push('first-star');
  if (doneIds.filter((i) => i <= 10).length >= 5) res.push('hajar-climber');
  if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((i) => doneIds.includes(i))) res.push('muttrah-sailor');
  if (doneIds.some((i) => i >= 11)) res.push('sharqiya-explorer');
  if (doneIds.length === LESSONS.length) res.push('salalah-champion');
  if (three >= 5) res.push('three-stars');
  if (arcade >= 100) res.push('mental-math');
  if (perfectExits >= 3) res.push('frankincense');
  return res;
}

export { ALL_FIELDS };
