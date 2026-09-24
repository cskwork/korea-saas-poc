"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatWon } from "@/core/format";
import { monthLabel, weekdayLabel } from "../../domain/dates";
import { formatDuration, LEVEL_LEGEND, type CalendarDay, type WorkCalendar as Calendar } from "../../domain/time";
import styles from "./WorkCalendar.module.css";

interface WorkCalendarProps {
  calendar: Calendar;
  /** `link`: each day opens the time log for that day. `public`: levels only, no hours or money. */
  mode: "link" | "public";
  /** Currently selected day (time page filter). */
  selected?: string | null;
  label: string;
  /** Narrow containers drop the oldest weeks beyond this many. */
  compactWeeks?: number;
}

const TIP_HALF_WIDTH = 110;
const LEVEL_TEXT = new Map(LEVEL_LEGEND.map((entry) => [entry.level, entry.label]));

function dayLabel(day: CalendarDay, mode: WorkCalendarProps["mode"]) {
  const date = `${Number(day.key.slice(5, 7))}월 ${Number(day.key.slice(8, 10))}일 (${weekdayLabel(day.key)})`;
  if (day.future) return `${date} · 아직 오지 않은 날`;
  if (mode === "public") return `${date} · ${LEVEL_TEXT.get(day.level)}`;
  const work = day.minutes > 0 ? formatDuration(day.minutes) : "기록 없음";
  return day.deposit > 0 ? `${date} · ${work} · 입금 ${formatWon(day.deposit)}` : `${date} · ${work}`;
}

/**
 * The work calendar: one square per day, Monday-first weeks as columns, intensity from hours logged.
 * When a day's level rises (the timer stopped, hours were logged), that square fills from the bottom.
 * Keyboard: one square is tabbable; arrow keys move by day (↑↓) and week (←→), Enter opens the day.
 */
export function WorkCalendar({ calendar, mode, selected, label, compactWeeks = 26 }: WorkCalendarProps) {
  const days = calendar.weeks.flatMap((week) => week.days);
  const signature = days.map((day) => day.level).join("");
  const [previous, setPrevious] = useState({ signature, levels: new Map(days.map((day) => [day.key, day.level])) });
  const [risen, setRisen] = useState<Map<string, number>>(new Map());
  if (previous.signature !== signature) {
    const next = new Map<string, number>();
    for (const day of days) {
      const before = previous.levels.get(day.key);
      if (before !== undefined && day.level > before) next.set(day.key, before);
    }
    setRisen(next);
    setPrevious({ signature, levels: new Map(days.map((day) => [day.key, day.level])) });
  }

  const todayKey = days.find((day) => day.today)?.key ?? days.at(-1)?.key;
  const [focusKey, setFocusKey] = useState<string | undefined>(selected ?? todayKey);
  const [tip, setTip] = useState<{ key: string; text: string; left: number; top: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const showTip = (day: CalendarDay, element: HTMLElement) => {
    const grid = gridRef.current;
    if (!grid) return;
    const box = grid.getBoundingClientRect();
    const cell = element.getBoundingClientRect();
    const center = cell.left - box.left + cell.width / 2;
    // Keep the tip inside the calendar so it never widens the page.
    const left = Math.min(Math.max(center, TIP_HALF_WIDTH), Math.max(TIP_HALF_WIDTH, box.width - TIP_HALF_WIDTH));
    setTip({ key: day.key, text: dayLabel(day, mode), left, top: cell.top - box.top });
  };

  const move = (event: KeyboardEvent<HTMLElement>, day: CalendarDay) => {
    const steps: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const target = days[days.findIndex((d) => d.key === day.key) + step];
    if (!target || target.future) return;
    const element = gridRef.current?.querySelector<HTMLElement>(`[data-day="${target.key}"]`);
    if (!element || element.offsetParent === null) return;
    setFocusKey(target.key);
    element.focus();
  };

  const legend = (
    <div className={styles.legend} aria-hidden="true">
      <span>적음</span>
      {LEVEL_LEGEND.map((entry) => (
        <span key={entry.level} className={styles.legendCell} data-level={entry.level} title={entry.label} />
      ))}
      <span>많음</span>
    </div>
  );

  const hiddenBefore = Math.max(0, calendar.weeks.length - compactWeeks);

  return (
    <figure
      className={styles.figure}
      style={{ "--weeks": calendar.weeks.length, "--weeks-compact": Math.min(compactWeeks, calendar.weeks.length) } as CSSProperties}
    >
      <div className={styles.grid} ref={gridRef} role="group" aria-label={label} onMouseLeave={() => setTip(null)}>
        <div className={styles.weekdays} aria-hidden="true">
          <span />
          {["월", "", "수", "", "금", "", ""].map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
        {calendar.weeks.map((week, w) => (
          <div key={week.start} className={clsx(styles.week, w < hiddenBefore && styles.older)}>
            <span className={styles.month} aria-hidden="true">
              {week.monthStart ? monthLabel(week.monthStart) : ""}
            </span>
            {week.days.map((day) => {
              const from = risen.get(day.key);
              const common = {
                "data-day": day.key,
                "data-level": day.future ? undefined : day.level,
                "data-rise": from !== undefined ? "" : undefined,
                "data-today": day.today ? "" : undefined,
                "data-selected": selected === day.key ? "" : undefined,
                style: from !== undefined ? ({ "--from": `var(--c${from})` } as CSSProperties) : undefined,
                className: clsx(styles.day, day.future && styles.future),
                onMouseEnter: (event: React.MouseEvent<HTMLElement>) => showTip(day, event.currentTarget),
                onFocus: (event: React.FocusEvent<HTMLElement>) => showTip(day, event.currentTarget),
                onBlur: () => setTip(null),
              };
              if (mode === "public" || day.future) {
                return <span key={day.key} {...common} aria-hidden="true" />;
              }
              return (
                <Link
                  key={day.key}
                  {...common}
                  href={`/dev-freelancing/time?day=${day.key}`}
                  scroll={false}
                  tabIndex={day.key === focusKey ? 0 : -1}
                  aria-label={dayLabel(day, mode)}
                  aria-current={selected === day.key ? "date" : undefined}
                  onKeyDown={(event) => move(event, day)}
                />
              );
            })}
            {mode === "link" ? (
              <span
                className={styles.deposit}
                data-on={week.days.some((day) => day.deposit > 0) ? "" : undefined}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
        {tip ? (
          <span className={styles.tip} style={{ left: tip.left, top: tip.top }} aria-hidden="true">
            {tip.text}
          </span>
        ) : null}
      </div>
      <figcaption className={styles.caption}>
        {legend}
        {mode === "link" ? (
          <span className={styles.depositKey} aria-hidden="true">
            <span className={styles.deposit} data-on="" /> 입금이 있던 주
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
