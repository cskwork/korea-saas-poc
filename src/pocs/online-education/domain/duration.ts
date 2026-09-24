/** Lesson running times are stored in seconds and edited as "mm:ss" (or "h:mm:ss", or whole minutes). */

export const MAX_LESSON_SECONDS = 5 * 60 * 60;

/**
 * "12:30" → 750, "1:05:00" → 3900, "15" → 900 (minutes). Returns null when the
 * text is not a running time or is outside 1 second – 5 hours.
 */
export function parseDuration(input: string): number | null {
  const text = input.trim();
  let seconds: number;
  if (/^\d{1,3}$/.test(text)) {
    seconds = Number(text) * 60;
  } else if (/^\d{1,3}:[0-5]\d$/.test(text)) {
    const [m, s] = text.split(":").map(Number);
    seconds = m * 60 + s;
  } else if (/^\d:[0-5]\d:[0-5]\d$/.test(text)) {
    const [h, m, s] = text.split(":").map(Number);
    seconds = h * 3600 + m * 60 + s;
  } else {
    return null;
  }
  return seconds >= 1 && seconds <= MAX_LESSON_SECONDS ? seconds : null;
}

/** 750 → "12:30", 3900 → "1:05:00" */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** 5100 → "1시간 25분", 2700 → "45분", 20 → "1분 미만" (minutes rounded). */
export function formatRuntime(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  if (totalSeconds > 0 && minutes === 0) return "1분 미만";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** Whole minutes, never below 1 for a non-empty duration (block sizing, plans). */
export function toMinutes(totalSeconds: number): number {
  return totalSeconds <= 0 ? 0 : Math.max(1, Math.round(totalSeconds / 60));
}
