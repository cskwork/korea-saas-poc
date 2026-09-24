"use client";

import { useState, useTransition } from "react";
import type { PlanId } from "../../domain/plans";
import { selectPlanAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { PendingLabel } from "../ui/PendingLabel";
import styles from "./pricing.module.css";

/** Records the plan choice for this workspace (no payment in the demo). */
export function PlanChoice({ plan, name }: { plan: PlanId; name: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const choose = () =>
    startTransition(async () => {
      setError(null);
      const result = await selectPlanAction({ plan });
      if (result.status === "error") setError(result.message);
    });
  return (
    <div className={styles.choose}>
      <button type="button" className={buttonClass("primary")} onClick={choose} disabled={pending} data-pending={pending}>
        <PendingLabel pending={pending} idle={`${name}로 바꾸기`} busy="바꾸는 중…" />
      </button>
      {error ? (
        <p className={styles.chooseError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
