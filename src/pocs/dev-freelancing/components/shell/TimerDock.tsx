"use client";

import clsx from "clsx";
import { Play, Square } from "lucide-react";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import type { ActionState } from "@/core/actions";
import { clockLabel, formatDuration, LONG_TIMER_MINUTES } from "../../domain/time";
import { discardTimer, startTimer, stopTimer } from "../../server/actions";
import type { PickerProject, RunningTimer } from "../../server/data/time";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import styles from "./shell.module.css";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 1000);
  return () => window.clearInterval(timer);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);
const noSeconds = () => null;

/** Seconds since epoch, ticking once a second on the client and absent during SSR (no hydration drift). */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, nowSeconds, noSeconds);
}

interface TimerDockProps {
  timer: RunningTimer | null;
  projects: PickerProject[];
  todayMinutes: number;
}

/**
 * The timer lives in a dock on every workspace page: pick a project, start, and stop when done.
 * Stopping logs the time server-side to the day the timer started, and today's calendar square fills.
 */
export function TimerDock({ timer, projects, todayMinutes }: TimerDockProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [confirmLong, setConfirmLong] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const open = projects.filter((p) => !p.done);
  const [projectId, setProjectId] = useState(open[0]?.id ?? projects[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState("");
  const [note, setNote] = useState("");
  const now = useNowSeconds();

  useEffect(() => {
    if (message?.tone !== "success") return;
    const id = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(id);
  }, [message]);

  const run = (call: () => Promise<ActionState<unknown>>, after?: () => void) =>
    startTransition(async () => {
      const result = await call();
      if (result.status === "error") setMessage({ tone: "error", text: result.message });
      else {
        setMessage(result.status === "success" && result.message ? { tone: "success", text: result.message } : null);
        after?.();
      }
    });

  const selected = projects.find((p) => p.id === projectId);
  const milestones = selected?.milestones.filter((m) => !m.done) ?? [];
  const elapsed = timer && now !== null ? Math.max(0, now - Math.floor(new Date(timer.startedAt).getTime() / 1000)) : null;
  const long = elapsed !== null && elapsed / 60 >= LONG_TIMER_MINUTES;

  const stop = () => {
    if (long && !confirmLong) {
      setConfirmLong(true);
      return;
    }
    run(() => stopTimer({}), () => setConfirmLong(false));
  };

  return (
    <section className={clsx(styles.dock, timer && styles.dockRunning)} aria-label="작업 타이머">
      <span className={ui.cell} data-state={timer ? "bright" : "hollow"} style={{ "--size": "12px" } as React.CSSProperties} aria-hidden="true" />
      {timer ? (
        <>
          <div className={styles.dockWhat}>
            <span className={styles.dockProject}>{timer.projectTitle}</span>
            <span className={styles.dockSub}>
              {[timer.milestoneTitle, timer.note].filter(Boolean).join(" · ") || "작업 중"}
            </span>
          </div>
          <output className={clsx(ui.measure, styles.clock)} aria-label="경과 시간">
            {elapsed === null ? "--:--:--" : clockLabel(elapsed)}
          </output>
          {confirmLong ? (
            <div className={styles.dockConfirm} role="group" aria-label="오래 돌아간 타이머">
              <span>{Math.floor((elapsed ?? 0) / 3600)}시간 넘게 돌아갔어요. 그대로 기록할까요?</span>
              <button type="button" className={buttonClass("primary", { small: true })} onClick={stop} disabled={pending}>
                그대로 기록
              </button>
              <button type="button" className={buttonClass("ghost", { small: true })} onClick={() => run(() => discardTimer({}), () => setConfirmLong(false))} disabled={pending}>
                기록 없이 멈춤
              </button>
            </div>
          ) : confirmDiscard ? (
            <div className={styles.dockConfirm} role="group" aria-label="타이머 취소 확인">
              <span>기록하지 않고 멈출까요?</span>
              <button type="button" className={buttonClass("danger", { small: true })} onClick={() => run(() => discardTimer({}), () => setConfirmDiscard(false))} disabled={pending} autoFocus>
                기록 없이 멈춤
              </button>
              <button type="button" className={buttonClass("ghost", { small: true })} onClick={() => setConfirmDiscard(false)}>
                계속하기
              </button>
            </div>
          ) : (
            <div className={styles.dockActions}>
              <button type="button" className={clsx(buttonClass("ghost", { small: true }), styles.dockCancel)} onClick={() => setConfirmDiscard(true)} disabled={pending}>
                취소
              </button>
              <button type="button" className={buttonClass("primary")} onClick={stop} disabled={pending}>
                <Square size={13} fill="currentColor" aria-hidden="true" />
                {pending ? "기록 중…" : "정지하고 기록"}
              </button>
            </div>
          )}
        </>
      ) : projects.length === 0 ? (
        <p className={styles.dockSub}>프로젝트를 만들면 여기서 타이머를 켤 수 있어요.</p>
      ) : (
        <form
          className={styles.dockForm}
          onSubmit={(event) => {
            event.preventDefault();
            run(() => startTimer({ projectId, milestoneId, note }), () => setNote(""));
          }}
        >
          <label className={styles.srOnly} htmlFor="dock-project">
            프로젝트
          </label>
          <select
            id="dock-project"
            className={clsx(ui.select, styles.dockSelect)}
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setMilestoneId("");
            }}
          >
            <optgroup label="진행 중인 프로젝트">
              {open.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </optgroup>
            {projects.some((p) => p.done) ? (
              <optgroup label="완료한 프로젝트">
                {projects
                  .filter((p) => p.done)
                  .map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
              </optgroup>
            ) : null}
          </select>
          {milestones.length > 0 ? (
            <>
              <label className={styles.srOnly} htmlFor="dock-milestone">
                마일스톤
              </label>
              <select id="dock-milestone" className={clsx(ui.select, styles.dockMilestone)} value={milestoneId} onChange={(event) => setMilestoneId(event.target.value)}>
                <option value="">마일스톤 없이</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <label className={styles.srOnly} htmlFor="dock-note">
            메모
          </label>
          <input
            id="dock-note"
            className={clsx(ui.input, styles.dockNote)}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="무엇을 하나요? (선택)"
            maxLength={200}
          />
          <button type="submit" className={buttonClass("primary")} disabled={pending || !projectId}>
            <Play size={13} fill="currentColor" aria-hidden="true" />
            {pending ? "시작 중…" : "타이머 시작"}
          </button>
        </form>
      )}
      <p className={styles.dockToday}>
        오늘 <span className={ui.measure}>{formatDuration(todayMinutes)}</span>
      </p>
      <p className={styles.dockMessage} role={message?.tone === "error" ? "alert" : "status"} data-tone={message?.tone}>
        {message?.text}
      </p>
    </section>
  );
}
