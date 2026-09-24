import { ShieldCheck } from "lucide-react";
import { switchPersonaAction } from "../server/actions";
import type { PersonRef } from "../server/types";
import { ActionButton } from "./ActionButtons";
import ui from "./ui.module.css";

/** Shown on operator screens while the visitor wears a member's tag: say so, and offer the operator's tag. */
export function OperatorGate({ viewer, operator }: { viewer: PersonRef; operator: PersonRef | null }) {
  return (
    <div className={`${ui.page} ${ui.pageNarrow}`}>
      <section className={ui.stageSlide} aria-labelledby="nc-gate-title">
        <ShieldCheck size={28} aria-hidden="true" />
        <h1 id="nc-gate-title" className={ui.stageSlideTitle}>
          운영자 명찰이 필요한 화면이에요
        </h1>
        <p className={ui.stageSlideText}>
          지금은 {viewer.nickname} 님({viewer.tier === "premium" ? "프리미엄" : "무료"} 멤버) 명찰로 보고 있어요. 멤버에게는 운영
          대시보드와 채널 관리가 보이지 않아요.
        </p>
        {operator ? (
          <ActionButton
            run={switchPersonaAction.bind(null, { memberId: operator.id })}
            className={`${ui.button} ${ui.stageSlidePrimary}`}
            pendingLabel="바꾸는 중…"
          >
            운영자 {operator.nickname} 명찰로 바꾸기
          </ActionButton>
        ) : null}
      </section>
    </div>
  );
}
