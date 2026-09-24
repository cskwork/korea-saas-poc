"use client";

import { useActionState, useState } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { LIMITS } from "../domain/inputs";
import { createMeetupAction, updateMeetupAction } from "../server/actions";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./meetups.module.css";
import ui from "./ui.module.css";

export interface MeetupDraft {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  location: string;
  format: "offline" | "online";
  capacity: number;
  access: "open" | "premium";
}

/** Opening or editing a meetup (operator). */
export function MeetupForm({ draft, onDone }: { draft: MeetupDraft; onDone?: () => void }) {
  const editing = Boolean(draft.id);
  const [saved, setSaved] = useState(0);
  const [state, submit, pending] = useActionState(
    async (_previous: ActionState<unknown>, formData: FormData): Promise<ActionState<unknown>> => {
      // The previous state is not used by these actions, so both start from idle.
      const result = editing ? await updateMeetupAction(idleState, formData) : await createMeetupAction(idleState, formData);
      if (result.status === "success") {
        setSaved((count) => count + 1);
        onDone?.();
      }
      return result;
    },
    idleState,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const field = (name: string) => `meetup-${draft.id ?? "new"}-${name}`;

  return (
    <form action={submit} className={styles.form} noValidate key={editing ? "edit" : saved}>
      {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
      <div className={`${ui.field} ${styles.wide}`}>
        <label htmlFor={`nc-${field("title")}`} className={ui.label}>
          모임 이름
        </label>
        <input
          id={`nc-${field("title")}`}
          name="title"
          className={ui.input}
          defaultValue={draft.title}
          maxLength={LIMITS.meetupTitle}
          placeholder="예: 월간 데모데이"
          required
          {...fieldProps(field("title"), errors?.title)}
        />
        <FieldError id={field("title")} messages={errors?.title} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`nc-${field("date")}`} className={ui.label}>
          날짜
        </label>
        <input id={`nc-${field("date")}`} name="date" type="date" className={ui.input} defaultValue={draft.date} required {...fieldProps(field("date"), errors?.date)} />
        <FieldError id={field("date")} messages={errors?.date} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`nc-${field("time")}`} className={ui.label}>
          시작 시간
        </label>
        <input id={`nc-${field("time")}`} name="time" type="time" className={ui.input} defaultValue={draft.time} required {...fieldProps(field("time"), errors?.time)} />
        <FieldError id={field("time")} messages={errors?.time} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`nc-${field("duration")}`} className={ui.label}>
          진행 시간 (분)
        </label>
        <input
          id={`nc-${field("duration")}`}
          name="durationMinutes"
          type="number"
          inputMode="numeric"
          min={30}
          max={600}
          step={10}
          className={ui.input}
          defaultValue={draft.durationMinutes}
          {...fieldProps(field("duration"), errors?.durationMinutes)}
        />
        <FieldError id={field("duration")} messages={errors?.durationMinutes} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`nc-${field("capacity")}`} className={ui.label}>
          정원
        </label>
        <input
          id={`nc-${field("capacity")}`}
          name="capacity"
          type="number"
          inputMode="numeric"
          min={2}
          max={500}
          className={ui.input}
          defaultValue={draft.capacity}
          {...fieldProps(field("capacity"), errors?.capacity)}
        />
        <FieldError id={field("capacity")} messages={errors?.capacity} />
      </div>
      <div className={`${ui.field} ${styles.wide}`}>
        <label htmlFor={`nc-${field("location")}`} className={ui.label}>
          장소
        </label>
        <input
          id={`nc-${field("location")}`}
          name="location"
          className={ui.input}
          defaultValue={draft.location}
          maxLength={LIMITS.meetupLocation}
          placeholder="예: 성수동 공유오피스 라운지, 또는 온라인"
          required
          {...fieldProps(field("location"), errors?.location)}
        />
        <FieldError id={field("location")} messages={errors?.location} />
      </div>
      <fieldset className={styles.choice}>
        <legend className={ui.label}>진행 방식</legend>
        <label className={ui.check}>
          <input type="radio" name="format" value="offline" defaultChecked={draft.format === "offline"} />
          오프라인
        </label>
        <label className={ui.check}>
          <input type="radio" name="format" value="online" defaultChecked={draft.format === "online"} />
          온라인
        </label>
      </fieldset>
      <fieldset className={styles.choice}>
        <legend className={ui.label}>참석 대상</legend>
        <label className={ui.check}>
          <input type="radio" name="access" value="open" defaultChecked={draft.access === "open"} />
          모든 멤버
        </label>
        <label className={ui.check}>
          <input type="radio" name="access" value="premium" defaultChecked={draft.access === "premium"} />
          프리미엄 멤버만
        </label>
      </fieldset>
      <div className={`${ui.field} ${styles.wide}`}>
        <label htmlFor={`nc-${field("description")}`} className={ui.label}>
          소개
        </label>
        <textarea
          id={`nc-${field("description")}`}
          name="description"
          className={ui.textarea}
          defaultValue={draft.description}
          maxLength={LIMITS.meetupDescription}
          rows={3}
          placeholder="무엇을 하는 모임인지, 무엇을 준비하면 좋은지"
          {...fieldProps(field("description"), errors?.description)}
        />
        <FieldError id={field("description")} messages={errors?.description} />
      </div>
      <div className={`${styles.formFoot} ${styles.wide}`}>
        <p role={state.status === "error" ? "alert" : "status"} className={`${ui.status} ${state.status === "error" ? ui.statusError : ui.statusSuccess}`}>
          {state.status === "error" && !errors ? state.message : state.status === "success" ? state.message : null}
        </p>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장하는 중…" : editing ? "모임 정보 저장" : "모임 열기"}
        </button>
      </div>
    </form>
  );
}
