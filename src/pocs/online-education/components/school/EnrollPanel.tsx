"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { CalendarCheck, Check, RotateCcw } from "lucide-react";
import { formatWon } from "@/core/format";
import type { ActionState } from "@/core/actions";
import { dayLabel, WEEKDAYS, weekLabel } from "../../domain/calendar";
import {
  buildStudyPlan,
  DEFAULT_PACE,
  MINUTES_PER_SESSION,
  sessionsLabel,
  SESSIONS_PER_WEEK,
  studyWeek,
  type MinutesPerSession,
  type PlanLesson,
  type SessionsPerWeek,
} from "../../domain/study-plan";
import { enrollAction, type EnrollResult } from "../../server/actions";
import { FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import { useFlip } from "../ui/useFlip";
import ui from "../ui/ui.module.css";
import styles from "./school.module.css";

/**
 * "내 시간표 짜기": pick a weekly pace and watch the course's lessons settle
 * into your week; the pace rides into the registration.
 */
export function EnrollPanel({
  courseId,
  color,
  price,
  listPrice,
  discount,
  lessons,
  today,
  open,
}: {
  courseId: string;
  color: string;
  price: number;
  listPrice: number;
  discount: number;
  lessons: PlanLesson[];
  /** Seoul day key from the server, so server and client plan the same week. */
  today: string;
  /** False for a draft preview: the planner works, registration does not. */
  open: boolean;
}) {
  const [sessions, setSessions] = useState<SessionsPerWeek>(DEFAULT_PACE.sessionsPerWeek);
  const [minutes, setMinutes] = useState<MinutesPerSession>(DEFAULT_PACE.minutesPerSession);
  const plan = useMemo(
    () => buildStudyPlan(lessons, { sessionsPerWeek: sessions, minutesPerSession: minutes }, today),
    [lessons, sessions, minutes, today],
  );
  const week = studyWeek(plan);
  const weekRef = useRef<HTMLOListElement>(null);
  useFlip(weekRef, plan);

  const { state, pending, formProps } = useFormAction<EnrollResult>(enrollAction);
  const [dismissed, setDismissed] = useState<ActionState<EnrollResult> | null>(null);
  const done = state.status === "success" && state !== dismissed ? state : null;
  const maxMinutes = Math.max(minutes, ...plan.sessions.map((s) => s.minutes));

  return (
    <div className={styles.enroll} id="enroll" data-color={color}>
      <p className={styles.price}>
        <strong className={ui.num}>{price === 0 ? "무료" : formatWon(price)}</strong>
        {discount > 0 ? (
          <>
            <s className={ui.num}>{formatWon(listPrice)}</s>
            <span className={styles.discount}>{discount}% 할인</span>
          </>
        ) : null}
      </p>

      {done?.data ? (
        <div className={styles.receipt} role="status">
          <p className={styles.receiptTitle}>
            <Check size={18} aria-hidden />
            {done.message}
          </p>
          <dl className={styles.receiptFacts}>
            <div>
              <dt>강의</dt>
              <dd>{done.data.courseTitle}</dd>
            </div>
            <div>
              <dt>내 시간표</dt>
              <dd>
                {sessionsLabel(sessions)} · {minutes}분 · 총 {done.data.sessions}회
              </dd>
            </div>
            <div>
              <dt>완주 목표</dt>
              <dd>{done.data.finishLabel ?? "레슨이 추가되면 알려 드려요"}</dd>
            </div>
            <div>
              <dt>결제</dt>
              <dd>{done.data.amount === 0 ? "무료" : `${formatWon(done.data.amount)} (데모 기록)`}</dd>
            </div>
          </dl>
          <button type="button" className={clsx(ui.button, ui.small)} onClick={() => setDismissed(state)}>
            <RotateCcw size={14} aria-hidden />
            다른 이메일로 신청하기
          </button>
        </div>
      ) : (
        <>
          <h2 className={styles.plannerTitle}>
            <CalendarCheck size={18} aria-hidden />내 시간표 짜기
          </h2>
          <fieldset className={styles.paceGroup}>
            <legend>공부할 요일</legend>
            <div className={ui.choices}>
              {SESSIONS_PER_WEEK.map((value) => (
                <label key={value} className={ui.choice}>
                  <input type="radio" name="pace-sessions" checked={sessions === value} onChange={() => setSessions(value)} />
                  <span>{sessionsLabel(value)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.paceGroup}>
            <legend>하루 공부 시간</legend>
            <div className={ui.choices}>
              {MINUTES_PER_SESSION.map((value) => (
                <label key={value} className={ui.choice}>
                  <input type="radio" name="pace-minutes" checked={minutes === value} onChange={() => setMinutes(value)} />
                  <span>{value}분</span>
                </label>
              ))}
            </div>
          </fieldset>

          {!week ? (
            <p className={clsx(ui.notice, ui.info)}>아직 레슨이 없어 시간표를 짤 수 없어요.</p>
          ) : (
            <>
              <p className={styles.weekCaption}>{weekLabel(week.monday)} 예시 · 블록 높이 = 그날 공부 시간</p>
              <ol ref={weekRef} role="list" className={styles.week} aria-label={`${weekLabel(week.monday)} 공부 시간표`}>
                {week.days.map((day) => (
                  <li key={day.day} className={styles.weekDay} data-rest={day.sessions.length === 0 || undefined}>
                    <span className={styles.weekDayName}>{WEEKDAYS[day.weekday - 1]}</span>
                    <span className={styles.weekSlot}>
                      {day.sessions.map((session) => (
                        <span
                          key={session.index}
                          data-flip={`session-${session.index}`}
                          className={styles.session}
                          data-over={session.over || undefined}
                          style={{ height: `${Math.max(26, (session.minutes / maxMinutes) * 100)}%` }}
                          title={session.lessons.map((l) => l.title).join(", ")}
                        >
                          <span className={styles.sessionMinutes}>{session.minutes}분</span>
                          <span className={ui.srOnly}>
                            {dayLabel(session.day)}: {session.lessons.map((l) => l.title).join(", ")}
                          </span>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ol>
              <p className={styles.planSummary} aria-live="polite">
                총 <strong className={ui.num}>{plan.sessions.length}회</strong> · 약 <strong className={ui.num}>{plan.weeks}주</strong>
                {plan.finishOn ? (
                  <>
                    {" "}
                    · <strong>{dayLabel(plan.finishOn)}</strong> 완주
                  </>
                ) : null}
              </p>
              <details className={styles.schedule}>
                <summary>회차별 일정 보기</summary>
                <ol role="list">
                  {plan.sessions.map((session) => (
                    <li key={session.index}>
                      <span className={styles.scheduleDay}>{dayLabel(session.day)}</span>
                      <span>{session.lessons.map((l) => l.title).join(" → ")}</span>
                      <span className={ui.num}>{session.minutes}분</span>
                    </li>
                  ))}
                </ol>
              </details>
            </>
          )}

          <form {...formProps} className={styles.enrollForm} noValidate>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="sessionsPerWeek" value={sessions} />
            <input type="hidden" name="minutesPerSession" value={minutes} />
            <div className={ui.field}>
              <label className={ui.label} htmlFor="enroll-name">
                이름
              </label>
              <input className={ui.input} {...fieldAttrs(state, "name", "enroll-name")} autoComplete="name" maxLength={30} disabled={!open} />
              <FieldMessage state={state} name="name" id="enroll-name" />
            </div>
            <div className={ui.field}>
              <label className={ui.label} htmlFor="enroll-email">
                이메일
              </label>
              <input
                className={ui.input}
                {...fieldAttrs(state, "email", "enroll-email")}
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={120}
                disabled={!open}
              />
              <FieldMessage state={state} name="email" id="enroll-email" />
            </div>
            <FormNotice state={state.status === "error" ? state : { status: "idle" }} />
            {open ? (
              <SubmitButton pending={pending} pendingLabel="신청하는 중" className={clsx(ui.large, ui.block)}>
                {price === 0 ? "무료로 수강 신청" : `${formatWon(price)}에 수강 신청`}
              </SubmitButton>
            ) : (
              <button type="button" className={clsx(ui.button, ui.large, ui.block)} disabled>
                게시 후 신청할 수 있어요
              </button>
            )}
            <p className={styles.fine}>데모 스쿨이라 결제는 기록만 되고 실제로 청구되지 않아요.</p>
          </form>
        </>
      )}
    </div>
  );
}
