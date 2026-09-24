import { addDays, daysBetween, mondayOf, weekdayOf } from "./calendar";

/**
 * "내 시간표 짜기": turns a course's lessons and a weekly pace into dated study
 * sessions. Lessons stay whole and in curriculum order; each session holds as
 * many as fit in the chosen minutes (a lesson longer than that gets its own).
 */

export const SESSIONS_PER_WEEK = [2, 3, 5, 7] as const;
export const MINUTES_PER_SESSION = [20, 30, 45, 60] as const;

export type SessionsPerWeek = (typeof SESSIONS_PER_WEEK)[number];
export type MinutesPerSession = (typeof MINUTES_PER_SESSION)[number];

export interface Pace {
  sessionsPerWeek: SessionsPerWeek;
  minutesPerSession: MinutesPerSession;
}

export const DEFAULT_PACE: Pace = { sessionsPerWeek: 3, minutesPerSession: 30 };

/** Study weekdays for each pace (1 = 월 … 7 = 일). */
const STUDY_DAYS: Record<SessionsPerWeek, readonly number[]> = {
  2: [2, 4],
  3: [1, 3, 5],
  5: [1, 2, 3, 4, 5],
  7: [1, 2, 3, 4, 5, 6, 7],
};

export function sessionsLabel(sessions: number): string {
  return sessions === 7 ? "매일" : `주 ${sessions}회`;
}

export function paceLabel(pace: { sessionsPerWeek: number; minutesPerSession: number }): string {
  return `${sessionsLabel(pace.sessionsPerWeek)} · ${pace.minutesPerSession}분`;
}

export function isPace(value: { sessionsPerWeek: number; minutesPerSession: number }): value is Pace {
  return (
    (SESSIONS_PER_WEEK as readonly number[]).includes(value.sessionsPerWeek) &&
    (MINUTES_PER_SESSION as readonly number[]).includes(value.minutesPerSession)
  );
}

export interface PlanLesson {
  id: string;
  title: string;
  minutes: number;
}

export interface PlanSession {
  /** 0-based session number. */
  index: number;
  day: string;
  weekday: number;
  lessons: PlanLesson[];
  minutes: number;
  /** A single lesson longer than the session budget. */
  over: boolean;
}

export interface StudyPlan {
  sessions: PlanSession[];
  /** Last study day, or null for a course with no lessons. */
  finishOn: string | null;
  /** Calendar weeks (월–일) the plan spans. */
  weeks: number;
  totalMinutes: number;
}

/** Groups lessons, in order, into sessions of at most `budget` minutes. */
export function packSessions(lessons: readonly PlanLesson[], budget: number): PlanLesson[][] {
  const sessions: PlanLesson[][] = [];
  let current: PlanLesson[] = [];
  let used = 0;
  for (const lesson of lessons) {
    if (current.length > 0 && used + lesson.minutes > budget) {
      sessions.push(current);
      current = [];
      used = 0;
    }
    current.push(lesson);
    used += lesson.minutes;
  }
  if (current.length > 0) sessions.push(current);
  return sessions;
}

/** Schedules the packed sessions on the pace's study days, starting on or after `startDay`. */
export function buildStudyPlan(lessons: readonly PlanLesson[], pace: Pace, startDay: string): StudyPlan {
  const studyDays = STUDY_DAYS[pace.sessionsPerWeek];
  const groups = packSessions(lessons, pace.minutesPerSession);
  const sessions: PlanSession[] = [];
  let day = startDay;
  for (const group of groups) {
    while (!studyDays.includes(weekdayOf(day))) day = addDays(day, 1);
    const minutes = group.reduce((sum, lesson) => sum + lesson.minutes, 0);
    sessions.push({
      index: sessions.length,
      day,
      weekday: weekdayOf(day),
      lessons: group,
      minutes,
      over: group.length === 1 && minutes > pace.minutesPerSession,
    });
    day = addDays(day, 1);
  }
  const first = sessions[0];
  const last = sessions.at(-1);
  return {
    sessions,
    finishOn: last?.day ?? null,
    weeks: first && last ? daysBetween(mondayOf(first.day), mondayOf(last.day)) / 7 + 1 : 0,
    totalMinutes: lessons.reduce((sum, lesson) => sum + lesson.minutes, 0),
  };
}

/**
 * The first full study week (월–일) of the plan, each day with its sessions: the
 * first calendar week holding as many sessions as any week does. A plan that
 * starts late in the week would otherwise show one lonely block.
 */
export function studyWeek(plan: StudyPlan) {
  if (plan.sessions.length === 0) return null;
  const byWeek = new Map<string, number>();
  for (const session of plan.sessions) {
    const monday = mondayOf(session.day);
    byWeek.set(monday, (byWeek.get(monday) ?? 0) + 1);
  }
  const fullest = Math.max(...byWeek.values());
  const monday = [...byWeek.entries()].find(([, count]) => count === fullest)?.[0] ?? mondayOf(plan.sessions[0].day);
  return {
    monday,
    days: Array.from({ length: 7 }, (_, offset) => {
      const key = addDays(monday, offset);
      return { day: key, weekday: offset + 1, sessions: plan.sessions.filter((session) => session.day === key) };
    }),
  };
}

/** Share of the plan that should be done by `today` (0–1), linear between registration and finish. */
export function expectedProgress(enrolledOn: string, finishOn: string, today: string): number {
  const span = Math.max(1, daysBetween(enrolledOn, finishOn));
  const elapsed = Math.min(span, Math.max(0, daysBetween(enrolledOn, today)));
  return elapsed / span;
}

export type PaceStatus = "completed" | "refunded" | "behind" | "on_track";

/** How far a learner may trail the plan (percentage points) before counting as behind. */
export const BEHIND_TOLERANCE = 15;

export function paceStatus(input: {
  status: "active" | "completed" | "refunded";
  progress: number;
  expected: number;
}): PaceStatus {
  if (input.status === "refunded") return "refunded";
  if (input.status === "completed" || input.progress >= 100) return "completed";
  return input.progress + BEHIND_TOLERANCE < Math.round(input.expected * 100) ? "behind" : "on_track";
}

export const PACE_STATUS_LABEL: Record<PaceStatus, string> = {
  completed: "수료",
  refunded: "환불",
  behind: "뒤처짐",
  on_track: "순조로움",
};
