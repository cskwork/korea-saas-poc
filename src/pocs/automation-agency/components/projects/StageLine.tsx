"use client";

import { useActionState, useOptimistic, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { idleState } from "@/core/actions";
import type { Stage } from "../../db/schema";
import { nextStage, STAGE_LABEL, STAGES, stageIndex } from "../../domain/stages";
import { advanceProjectAction } from "../../server/actions";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import styles from "./projects.module.css";

/**
 * The project's route: six stations with a marker at the current one.
 * "다음 역으로" moves the marker immediately (optimistic) while the server confirms.
 */
export function StageLine({ id, stage }: { id: string; stage: Stage }) {
  const [optimistic, setOptimistic] = useOptimistic(stage);
  const [state, advance] = useActionState(advanceProjectAction, idleState);
  const current = stageIndex(optimistic);
  const next = nextStage(optimistic);

  return (
    <div className={styles.route}>
      <ol className={styles.routeLine} style={{ "--at": current } as CSSProperties} aria-label="프로젝트 노선">
        {STAGES.map((s, index) => (
          <li
            key={s}
            className={clsx(
              styles.routeStop,
              index < current && styles.passed,
              index === current && styles.here,
              s === "maintenance" && styles.loopStop,
            )}
            aria-current={index === current ? "step" : undefined}
          >
            <span className={styles.routeDisc} aria-hidden="true" />
            <span className={styles.routeName}>{STAGE_LABEL[s]}</span>
          </li>
        ))}
        <span className={styles.marker} aria-hidden="true">
          현재
        </span>
      </ol>
      <form
        className={styles.advance}
        action={(formData) => {
          if (next) setOptimistic(next);
          advance(formData);
        }}
      >
        <input type="hidden" name="id" value={id} />
        {next ? (
          <SubmitButton pendingLabel="이동 중…" icon={<ArrowRight size={16} aria-hidden="true" />}>
            다음 역으로 · {STAGE_LABEL[next]}
          </SubmitButton>
        ) : (
          <p className={styles.terminal}>유지보수 순환선을 운행 중이에요.</p>
        )}
        <ActionNotice state={state} />
      </form>
    </div>
  );
}
