"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { rsvpAction } from "../server/actions";
import ui from "./ui.module.css";
import styles from "./rsvp.module.css";

interface RsvpButtonProps {
  meetupId: string;
  going: boolean;
  /** Why the viewer cannot join (premium only, full, started), or null. */
  blockedReason: string | null;
  /** The reason is fixable by upgrading. */
  needsPremium?: boolean;
  tone?: "light" | "stage";
}

/** 참석 신청 / 신청 취소, with the reason spelled out when joining is not possible. */
export function RsvpButton({ meetupId, going, blockedReason, needsPremium = false, tone = "light" }: RsvpButtonProps) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const submit = (next: boolean) =>
    startTransition(async () => {
      const result = await rsvpAction({ id: meetupId, going: next });
      setFeedback(result.status === "error" ? { ok: false, message: result.message } : { ok: true, message: result.status === "success" ? (result.message ?? "") : "" });
    });

  const stage = tone === "stage";
  return (
    <div className={`${styles.rsvp} ${stage ? styles.onStage : ""}`}>
      {going ? (
        <button type="button" className={`${ui.button} ${stage ? styles.stageGhost : ""}`} onClick={() => submit(false)} disabled={pending} aria-busy={pending}>
          {pending ? "취소하는 중…" : "신청 취소"}
        </button>
      ) : blockedReason ? (
        needsPremium ? (
          <Link href="/niche-community/membership" className={`${ui.button} ${stage ? styles.stageGhost : ""}`}>
            프리미엄으로 신청하기
          </Link>
        ) : (
          <button type="button" className={`${ui.button} ${stage ? styles.stageGhost : ""}`} disabled>
            신청 불가
          </button>
        )
      ) : (
        <button type="button" className={`${ui.button} ${ui.accent}`} onClick={() => submit(true)} disabled={pending} aria-busy={pending}>
          {pending ? "신청하는 중…" : "참석 신청"}
        </button>
      )}
      <p role={feedback?.ok === false ? "alert" : "status"} className={`${styles.note} ${feedback?.ok === false ? styles.error : ""}`}>
        {feedback?.message || (going ? "참석 신청했어요." : blockedReason ?? "")}
      </p>
    </div>
  );
}
