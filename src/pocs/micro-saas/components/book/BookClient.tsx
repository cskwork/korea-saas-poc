"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { idleState } from "@/core/actions";
import { formatPhone } from "../../domain/phone";
import { bookOnlineAction } from "../../server/actions";
import { Field } from "../world/Field";
import { errorProps, fieldError } from "../world/forms";
import { Icon } from "../world/Icon";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";
import styles from "./book.module.css";

/** Step headings take focus when the slip moves to them, so screen readers follow the flow. */
export function StepTitle({ children, focus }: { children: string; focus: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
  }, [focus]);
  return (
    <h2 ref={ref} tabIndex={-1} className={styles.stepTitle}>
      {children}
    </h2>
  );
}

export function CopyLinkButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      className={`${ui.btn} ${ui.line} ${ui.small}`}
      onClick={async () => {
        const url = `${window.location.origin}/micro-saas/book`;
        try {
          await navigator.clipboard.writeText(url);
          toast("예약 링크를 복사했어요. 손님께 보내 주세요.");
        } catch {
          toast(`복사하지 못했어요. 주소: ${url}`, { tone: "error" });
        }
      }}
    >
      <Icon name="copy" />
      <span>예약 링크 복사</span>
    </button>
  );
}

/** Step 3: name and phone. The server re-checks the slot; a taken slot sends the guest back to pick again. */
export function GuestForm({
  serviceId,
  date,
  time,
  retryHref,
}: {
  serviceId: string;
  date: string;
  time: string;
  retryHref: string;
}) {
  const id = useId();
  const [state, dispatch, pending] = useActionState(bookOnlineAction, idleState);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const slotLost = state.status === "error" && !state.fieldErrors;

  return (
    <form action={dispatch} className={styles.guest} noValidate>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <Field id={`${id}-name`} label="이름" error={fieldError(state, "name")}>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          {...errorProps(state, "name", `${id}-name`)}
        />
      </Field>
      <Field id={`${id}-phone`} label="연락처" error={fieldError(state, "phone")}>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhone((v) => (v ? formatPhone(v) : v))}
          required
          {...errorProps(state, "phone", `${id}-phone`)}
        />
      </Field>
      <Field id={`${id}-memo`} label="요청사항" area error={fieldError(state, "memo")}>
        <textarea
          id={`${id}-memo`}
          name="memo"
          rows={3}
          maxLength={200}
          placeholder="요청사항 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Field>
      <p className={ui.hint}>연락처는 예약 확인과 알림톡 안내에만 쓰여요.</p>
      {slotLost ? (
        <div className={styles.lost} role="alert">
          <p className={ui.formError}>{state.message}</p>
          <Link className={`${ui.btn} ${ui.line} ${ui.block}`} href={retryHref} scroll={false}>
            다른 시간 고르기
          </Link>
        </div>
      ) : null}
      <button type="submit" className={`${ui.btn} ${ui.ink} ${ui.block} ${ui.large}`} disabled={pending} aria-busy={pending}>
        {pending ? "예약하는 중…" : "예약하기"}
      </button>
    </form>
  );
}
