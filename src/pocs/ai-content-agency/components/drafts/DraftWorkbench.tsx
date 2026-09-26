"use client";

import { Lock, PencilLine, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import type { ActionState } from "@/core/actions";
import { formatNumber } from "@/core/format";
import type { DraftSource } from "../../db/schema";
import { LENGTHS, LENGTH_LABEL, LENGTH_TARGET, TONES, TONE_LABEL, composeCopy, type ContentKind, type Length, type Tone } from "../../domain/content";
import { editDraftAction, regenerateDraftAction } from "../../server/actions";
import { BannerProof } from "../proof/BannerProof";
import { buttonClass } from "../ui/buttons";
import { CopyButton } from "../ui/CopyButton";
import { Field, Segmented, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import { focusFirstInvalid } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";
import { DraftBody } from "./DraftBody";
import styles from "./drafts.module.css";

type Mode = "view" | "edit" | "rewrite";
type Success<T> = Extract<ActionState<T>, { status: "success" }>;

export interface WorkbenchDraft {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  keywords: string[];
  tone: Tone;
  length: Length;
  version: number;
  source: DraftSource;
  byline: string;
}

/** Runs a form action in a transition and hands back its state; the caller decides what success means. */
function useSubmit<T>(action: (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>, onSuccess: (state: Success<T>) => void) {
  const [state, setState] = useState<ActionState<T>>({ status: "idle" });
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);
  useEffect(() => {
    if (state.status === "error") focusFirstInvalid(formRef.current);
  }, [state]);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formRef.current = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const next = await action({ status: "idle" }, formData);
      setState(next);
      if (next.status === "success") onSuccess(next);
    });
  };
  const errorFor = (name: string) => (state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined);
  return { state, pending, onSubmit, errorFor };
}

/**
 * The draft as a proof and its copy, with the two ways to change it: edit by hand, or
 * have it rewritten. Each save is a new version; a rewrite unrolls the new proof.
 */
export function DraftWorkbench({
  draft,
  fresh,
  meta,
  deliveredIn,
}: {
  draft: WorkbenchDraft;
  fresh: boolean;
  meta: React.ReactNode;
  /** The delivered order this draft was handed over in; the copy is locked while it stands. */
  deliveredIn?: { id: string; code: string } | null;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [unfurlVersion, setUnfurlVersion] = useState<number | null>(fresh ? draft.version : null);
  const [message, setMessage] = useState<{ tone: "success" | "info"; text: string } | null>(null);

  const edit = useSubmit(editDraftAction, (state) => {
    setMode("view");
    setMessage({ tone: "success", text: state.message ?? "저장했어요." });
  });
  const rewrite = useSubmit(regenerateDraftAction, (state) => {
    setMode("view");
    if (state.data) setUnfurlVersion(state.data.version);
    setMessage(state.data?.notice ? { tone: "info", text: state.data.notice } : { tone: "success", text: state.message ?? "다시 썼어요." });
  });

  const toggle = (next: Mode) => {
    setMessage(null);
    setMode((current) => (current === next ? "view" : next));
  };

  return (
    <>
      <BannerProof
        key={draft.version}
        title={draft.title}
        kind={draft.kind}
        keywords={draft.keywords}
        byline={draft.byline}
        unfurl={unfurlVersion === draft.version}
        headingLevel={1}
      />
      {meta}
      <div className={styles.toolbar} role="toolbar" aria-label="원고 도구">
        <CopyButton text={composeCopy(draft.title, draft.body)} label="제목과 본문 복사" variant="primary" />
        {deliveredIn ? null : (
          <>
            <button type="button" className={buttonClass("secondary")} aria-pressed={mode === "edit"} onClick={() => toggle("edit")}>
              <PencilLine size={16} aria-hidden="true" />
              고치기
            </button>
            <button type="button" className={buttonClass("secondary")} aria-pressed={mode === "rewrite"} onClick={() => toggle("rewrite")}>
              <RefreshCw size={16} aria-hidden="true" />
              다시 쓰기
            </button>
          </>
        )}
      </div>
      {deliveredIn ? (
        <p className={styles.lockNote}>
          <Lock size={16} aria-hidden="true" />
          <span>
            {deliveredIn.code} 의뢰로 납품한 원고예요. 고객이 받은 그대로 남도록 잠가 뒀어요. 고치려면{" "}
            <Link href={`/ai-content-agency/orders/${deliveredIn.id}`}>의뢰에서 검수로 되돌려</Link> 주세요.
          </span>
        </p>
      ) : null}
      <div aria-live="polite">{message ? <Notice tone={message.tone}>{message.text}</Notice> : null}</div>

      {mode === "edit" && !deliveredIn ? (
        <form className={styles.editor} onSubmit={edit.onSubmit} noValidate aria-label="원고 고치기">
          <input type="hidden" name="draftId" value={draft.id} />
          <Field id="edit-title" label="제목" error={edit.errorFor("title")}>
            <input
              id="edit-title"
              name="title"
              className={ui.input}
              defaultValue={draft.title}
              maxLength={120}
              aria-invalid={edit.errorFor("title") ? true : undefined}
              aria-describedby={describedBy("edit-title", { error: edit.errorFor("title") })}
            />
          </Field>
          <Field id="edit-body" label="본문" hint="## 로 시작하면 소제목, - 로 시작하면 목록이 돼요." error={edit.errorFor("body")}>
            <textarea
              id="edit-body"
              name="body"
              className={ui.textarea}
              defaultValue={draft.body}
              aria-invalid={edit.errorFor("body") ? true : undefined}
              aria-describedby={describedBy("edit-body", { hint: true, error: edit.errorFor("body") })}
            />
          </Field>
          <Field id="edit-note" label="수정 메모" optional hint="버전 기록에 남아요. 예: 영업시간 채움" error={edit.errorFor("note")}>
            <input id="edit-note" name="note" className={ui.input} maxLength={80} aria-describedby={describedBy("edit-note", { hint: true, error: edit.errorFor("note") })} />
          </Field>
          {edit.state.status === "error" ? <Notice tone="error">{edit.state.message}</Notice> : null}
          <div className={styles.formActions}>
            <button type="submit" className={buttonClass("primary")} disabled={edit.pending} data-pending={edit.pending}>
              <PendingLabel pending={edit.pending} idle={`v${draft.version + 1}로 저장`} busy="저장하는 중…" />
            </button>
            <button type="button" className={buttonClass("secondary")} onClick={() => setMode("view")} disabled={edit.pending}>
              취소
            </button>
          </div>
        </form>
      ) : null}

      {mode === "rewrite" && !deliveredIn ? (
        <form className={styles.editor} onSubmit={rewrite.onSubmit} noValidate aria-label="다시 쓰기 조건">
          <input type="hidden" name="draftId" value={draft.id} />
          <Segmented name="tone" legend="말투" options={TONES} defaultValue={draft.tone} renderOption={(t) => TONE_LABEL[t]} />
          <Segmented
            name="length"
            legend="분량"
            options={LENGTHS}
            defaultValue={draft.length}
            renderOption={(l) => `${LENGTH_LABEL[l]} · ${formatNumber(LENGTH_TARGET[draft.kind][l])}자`}
          />
          <Field id="rewrite-keywords" label="키워드" optional error={rewrite.errorFor("keywords")}>
            <input id="rewrite-keywords" name="keywords" className={ui.input} defaultValue={draft.keywords.join(", ")} />
          </Field>
          <Field id="rewrite-notes" label="이번에 바꿀 점" optional hint="예: 더 짧고 담백하게, 마지막에 예약 안내" error={rewrite.errorFor("notes")}>
            <textarea
              id="rewrite-notes"
              name="notes"
              className={ui.textarea}
              rows={3}
              maxLength={500}
              aria-describedby={describedBy("rewrite-notes", { hint: true, error: rewrite.errorFor("notes") })}
            />
          </Field>
          {rewrite.state.status === "error" ? <Notice tone="error">{rewrite.state.message}</Notice> : null}
          <div className={styles.formActions}>
            <button type="submit" className={buttonClass("primary")} disabled={rewrite.pending} data-pending={rewrite.pending}>
              <PendingLabel pending={rewrite.pending} idle={`v${draft.version + 1}로 다시 쓰기`} busy="다시 쓰는 중…" icon={<RefreshCw size={16} aria-hidden="true" />} />
            </button>
            <span className={styles.composerNote}>지금 버전은 기록에 그대로 남아요.</span>
          </div>
        </form>
      ) : null}

      {mode !== "edit" ? (
        <div className={styles.document}>
          <DraftBody body={draft.body} />
        </div>
      ) : null}
    </>
  );
}
