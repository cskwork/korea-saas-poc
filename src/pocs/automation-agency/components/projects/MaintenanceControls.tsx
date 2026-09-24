"use client";

import { useActionState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { idleState } from "@/core/actions";
import type { MaintenanceStatus } from "../../db/schema";
import { setMaintenanceAction } from "../../server/actions";
import { ConfirmSubmit } from "../ui/ConfirmSubmit";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";

/** Start, pause, resume or end the maintenance subscription. Ending asks first. */
export function MaintenanceControls({ id, status }: { id: string; status: MaintenanceStatus }) {
  const [state, action] = useActionState(setMaintenanceAction, idleState);
  return (
    <div className={ui.form}>
      <div className={ui.formFoot}>
        {status !== "active" ? (
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="maintenanceStatus" value="active" />
            <SubmitButton small variant="primary" icon={<Play size={15} aria-hidden="true" />} pendingLabel="처리 중…">
              {status === "paused" ? "운행 재개" : "유지보수 시작"}
            </SubmitButton>
          </form>
        ) : (
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="maintenanceStatus" value="paused" />
            <SubmitButton
              small
              variant="secondary"
              icon={<Pause size={15} aria-hidden="true" />}
              pendingLabel="처리 중…"
            >
              일시 정지
            </SubmitButton>
          </form>
        )}
        {status === "active" || status === "paused" ? (
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="maintenanceStatus" value="ended" />
            <ConfirmSubmit
              small
              label="계약 종료"
              confirmLabel="종료"
              icon={<Square size={14} aria-hidden="true" />}
              question="이번 달부터 정기 수익에서 빠져요."
            />
          </form>
        ) : null}
      </div>
      <ActionNotice state={state} />
    </div>
  );
}
