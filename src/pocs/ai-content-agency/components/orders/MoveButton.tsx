"use client";

import { ArrowRight, Undo2 } from "lucide-react";
import { useState, useTransition } from "react";
import type { OrderStatus } from "../../domain/pipeline";
import { moveOrderAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { PendingLabel } from "../ui/PendingLabel";
import styles from "./orders.module.css";

/** Moves an order one step (forward or back). Errors stay beside the button. */
export function MoveButton({
  orderId,
  to,
  label,
  draftId,
  back = false,
  variant,
  size = "small",
}: {
  orderId: string;
  to: OrderStatus;
  label: string;
  draftId?: string;
  back?: boolean;
  variant?: "primary" | "secondary" | "quiet";
  size?: "small" | "regular";
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const move = () =>
    startTransition(async () => {
      setError(null);
      const result = await moveOrderAction({ orderId, to, draftId });
      if (result.status === "error") setError(result.message);
    });

  return (
    <div className={styles.move}>
      <button
        type="button"
        className={buttonClass(variant ?? (back ? "quiet" : "primary"), size)}
        onClick={move}
        disabled={pending}
        data-pending={pending}
      >
        <PendingLabel
          pending={pending}
          idle={label}
          busy="옮기는 중…"
          icon={back ? <Undo2 size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
        />
      </button>
      {error ? (
        <p className={styles.moveError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
