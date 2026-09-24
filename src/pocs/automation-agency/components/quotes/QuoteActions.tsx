"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRightLeft, Check, Pencil, Printer, RotateCcw, Send, X } from "lucide-react";
import clsx from "clsx";
import { idleState } from "@/core/actions";
import type { QuoteStatus } from "../../db/schema";
import { convertQuoteAction, deleteQuoteAction, setQuoteStatusAction } from "../../server/actions";
import { BASE_PATH } from "../shell/stations";
import { ConfirmSubmit } from "../ui/ConfirmSubmit";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { QuoteStatusTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./quotes.module.css";

function StatusButton({
  id,
  to,
  label,
  icon,
  variant = "secondary",
}: {
  id: string;
  to: QuoteStatus;
  label: string;
  icon: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <SubmitButton name="status" value={to} variant={variant} small icon={icon} pendingLabel="바꾸는 중…">
        {label}
      </SubmitButton>
    </>
  );
}

/** Status workflow (작성 중 → 발송 → 수락/거절), conversion, print, edit and delete. */
export function QuoteActions({ id, status, projectId }: { id: string; status: QuoteStatus; projectId: string | null }) {
  const [statusState, setStatus] = useActionState(setQuoteStatusAction, idleState);
  const [convertState, convert] = useActionState(convertQuoteAction, idleState);
  const [deleteState, remove] = useActionState(deleteQuoteAction, idleState);

  return (
    <div className={styles.actions}>
      <div className={styles.actionRow}>
        <span className={styles.statusNow}>
          현재 상태 <QuoteStatusTag status={status} />
        </span>
        <form action={setStatus} className={styles.inlineForm}>
          {status === "draft" ? (
            <StatusButton
              id={id}
              to="sent"
              label="발송 처리"
              variant="primary"
              icon={<Send size={15} aria-hidden="true" />}
            />
          ) : null}
          {status === "sent" ? (
            <>
              <StatusButton
                id={id}
                to="accepted"
                label="수락"
                variant="primary"
                icon={<Check size={15} aria-hidden="true" />}
              />
              <SubmitButton
                name="status"
                value="declined"
                variant="secondary"
                small
                icon={<X size={15} aria-hidden="true" />}
              >
                거절
              </SubmitButton>
              <SubmitButton
                name="status"
                value="draft"
                variant="ghost"
                small
                icon={<RotateCcw size={15} aria-hidden="true" />}
              >
                작성 중으로
              </SubmitButton>
            </>
          ) : null}
          {status === "declined" ? (
            <StatusButton id={id} to="sent" label="다시 발송" icon={<Send size={15} aria-hidden="true" />} />
          ) : null}
          {status === "accepted" && !projectId ? (
            <StatusButton
              id={id}
              to="sent"
              label="수락 취소"
              variant="ghost"
              icon={<RotateCcw size={15} aria-hidden="true" />}
            />
          ) : null}
        </form>
        {status === "accepted" ? (
          projectId ? (
            <Link href={`${BASE_PATH}/projects/${projectId}`} className={clsx(ui.btn, ui.secondary, ui.small)}>
              <ArrowRightLeft size={15} aria-hidden="true" />
              전환된 프로젝트 보기
            </Link>
          ) : (
            <form action={convert}>
              <input type="hidden" name="id" value={id} />
              <SubmitButton
                small
                variant="primary"
                icon={<ArrowRightLeft size={15} aria-hidden="true" />}
                pendingLabel="전환 중…"
              >
                프로젝트로 전환
              </SubmitButton>
            </form>
          )
        ) : null}
      </div>
      <div className={styles.actionRow}>
        <button type="button" className={clsx(ui.btn, ui.secondary, ui.small)} onClick={() => window.print()}>
          <Printer size={15} aria-hidden="true" />
          인쇄 · PDF 저장
        </button>
        <Link href={`${BASE_PATH}/quotes/${id}/edit`} className={clsx(ui.btn, ui.ghost, ui.small)}>
          <Pencil size={15} aria-hidden="true" />
          수정
        </Link>
        <form action={remove}>
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmit small label="삭제" question="이 견적서를 지울까요?" />
        </form>
      </div>
      <ActionNotice
        state={
          statusState.status !== "idle" ? statusState : convertState.status !== "idle" ? convertState : deleteState
        }
      />
    </div>
  );
}
