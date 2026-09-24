"use client";

import { useActionState, useState } from "react";
import { RotateCcw } from "lucide-react";
import { idleState } from "@/core/actions";
import { resetDemoAction } from "../../server/actions";
import styles from "./reset.module.css";

/** "데모 데이터 초기화" with an inline confirmation step. */
export function ResetDemo() {
  const [state, submit, pending] = useActionState(resetDemoAction, idleState);
  const [confirming, setConfirming] = useState(false);

  return (
    <form
      action={(formData) => {
        setConfirming(false);
        submit(formData);
      }}
      className={styles.reset}
    >
      {confirming ? (
        <>
          <span className={styles.question}>지금까지 바꾼 내용이 모두 사라져요.</span>
          <button type="submit" className={styles.confirm} disabled={pending}>
            초기화
          </button>
          <button type="button" className={styles.cancel} onClick={() => setConfirming(false)}>
            취소
          </button>
        </>
      ) : (
        <button type="button" className={styles.trigger} onClick={() => setConfirming(true)} disabled={pending}>
          <RotateCcw size={14} aria-hidden="true" className={pending ? styles.spin : undefined} />
          {pending ? "초기화 중…" : "데모 데이터 초기화"}
        </button>
      )}
      <span role="status" className={styles.status}>
        {state.status === "success" && !confirming ? state.message : state.status === "error" ? state.message : ""}
      </span>
    </form>
  );
}
