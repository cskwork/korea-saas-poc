"use client";

import { useTransition } from "react";
import type { PlanTier } from "../../db/schema";
import { setPlanAction } from "../../server/actions";
import { Icon } from "../world/Icon";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";

/** Switches the demo shop's plan. No payment is taken; the page says so. */
export function PlanButton({ plan, name, current, featured }: { plan: PlanTier; name: string; current: boolean; featured: boolean }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  if (current) {
    return (
      <p className={`${ui.btn} ${ui.line} ${ui.block}`} aria-disabled="true">
        <Icon name="check" />
        <span>지금 쓰는 요금제</span>
      </p>
    );
  }
  return (
    <button
      type="button"
      className={`${ui.btn} ${featured ? ui.ink : ui.line} ${ui.block}`}
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setPlanAction({ plan });
          if (result.status === "error") toast(result.message, { tone: "error" });
          else if (result.status === "success") toast(result.message ?? `${name} 요금제로 바꿨어요.`);
        })
      }
    >
      {pending ? "바꾸는 중…" : plan === "free" ? "무료로 시작" : `${name} 시작하기`}
    </button>
  );
}
