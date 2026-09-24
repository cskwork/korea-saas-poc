/**
 * Korean locale formatting. All dates render in Asia/Seoul regardless of the
 * server's time zone (Vercel runs in UTC).
 */
export const TIME_ZONE = "Asia/Seoul";
const LOCALE = "ko-KR";

const wonFormatter = new Intl.NumberFormat(LOCALE);
const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** 15000 → "15,000원" */
export function formatWon(amount: number): string {
  return `${wonFormatter.format(Math.round(amount))}원`;
}

/** 15000 → "₩15,000" (tables, dense UI) */
export function formatKrw(amount: number): string {
  return `₩${wonFormatter.format(Math.round(amount))}`;
}

/** 12345 → "12,345" */
export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: fractionDigits }).format(value);
}

/** 1520000 → "152만" */
export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

/** 0.1234 → "12.3%" */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}

type DateInput = Date | string | number;

const toDate = (input: DateInput) => (input instanceof Date ? input : new Date(input));

/** "2026. 9. 24." */
export function formatDate(input: DateInput, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options }).format(toDate(input));
}

/** "9월 24일 (목)" */
export function formatMonthDay(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, month: "long", day: "numeric", weekday: "short" }).format(
    toDate(input),
  );
}

/** "14:30" */
export function formatTime(input: DateInput): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    toDate(input),
  );
}

/** "3분 전", "2일 전", "방금" */
export function formatRelative(input: DateInput, now: Date = new Date()): string {
  const seconds = Math.round((toDate(input).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "방금";
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (abs >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/** Today's date in Seoul as "YYYY-MM-DD" (for `date` columns and day grouping). */
export function seoulDateKey(input: DateInput = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(toDate(input));
}
