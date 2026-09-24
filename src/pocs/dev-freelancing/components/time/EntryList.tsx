"use client";

import { Pencil, Timer, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatMonthDay } from "@/core/format";
import { formatDuration, hoursLabel } from "../../domain/time";
import { deleteEntry } from "../../server/actions";
import type { PickerProject } from "../../server/data/time";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import { EntryForm } from "./EntryForm";
import styles from "./EntryList.module.css";

export interface ListEntry {
  id: string;
  projectId: string;
  projectTitle?: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  workedOn: string;
  minutes: number;
  note: string;
  fromTimer?: boolean;
}

/** Time entries grouped by day, each editable in place and deletable with confirmation. */
export function EntryList({
  entries,
  projects,
  today,
  showProject = true,
}: {
  entries: ListEntry[];
  projects: PickerProject[];
  today: string;
  showProject?: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const days = new Map<string, ListEntry[]>();
  for (const entry of entries) days.set(entry.workedOn, [...(days.get(entry.workedOn) ?? []), entry]);

  return (
    <div className={styles.days}>
      {[...days.entries()].map(([day, list]) => (
        <section key={day} className={styles.day} aria-label={formatMonthDay(`${day}T12:00:00+09:00`)}>
          <header className={styles.dayHead}>
            <span>{day === today ? "오늘" : formatMonthDay(`${day}T12:00:00+09:00`)}</span>
            <span className={ui.measure}>{formatDuration(list.reduce((sum, e) => sum + e.minutes, 0))}</span>
          </header>
          <ul role="list" className={styles.entries}>
            {list.map((entry) =>
              editing === entry.id ? (
                <li key={entry.id} className={styles.editing}>
                  <EntryForm
                    projects={projects}
                    today={today}
                    entry={{ id: entry.id, projectId: entry.projectId, milestoneId: entry.milestoneId, workedOn: entry.workedOn, minutes: entry.minutes, note: entry.note }}
                    onDone={() => setEditing(null)}
                  />
                </li>
              ) : (
                <li key={entry.id} className={styles.entry}>
                  <span className={`${ui.measure} ${styles.hours}`}>{hoursLabel(entry.minutes)}h</span>
                  <div className={styles.what}>
                    <span className={styles.note}>{entry.note || "메모 없음"}</span>
                    <span className={styles.meta}>
                      {[showProject ? entry.projectTitle : null, entry.milestoneTitle].filter(Boolean).join(" · ")}
                      {entry.fromTimer ? (
                        <span className={styles.timer}>
                          <Timer size={11} aria-hidden="true" /> 타이머
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className={buttonClass("ghost", { small: true, iconOnly: true })} aria-label="기록 고치기" title="고치기" onClick={() => setEditing(entry.id)}>
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                    <ActionButton action={deleteEntry} payload={{ id: entry.id }} small iconOnly variant="danger" label="기록 삭제" confirm="지울까요?" confirmLabel="삭제">
                      <Trash2 size={14} aria-hidden="true" />
                    </ActionButton>
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
