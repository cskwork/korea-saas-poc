"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { draftToHtml, draftToText } from "../../domain/draft-format";
import { deleteArticleAction, updateArticleAction } from "../../server/actions";
import { ActionNotice, ConfirmAction, CopyButton, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { Section } from "../ui/primitives";
import { useActionForm } from "../ui/useActionForm";
import { DraftPreview } from "./DraftPreview";
import styles from "./content.module.css";

/** Edit a saved draft with a live blog preview; copy as HTML (blog editors) or plain text. */
export function DraftWorkbench({ id, title: initialTitle, body: initialBody }: { id: string; title: string; body: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const { state, pending, onSubmit, errors } = useActionForm(updateArticleAction);
  const dirty = title !== initialTitle || body !== initialBody;

  return (
    <div className={styles.bench}>
      <Section id="preview" title="미리보기" actions={<CopyButtons title={title} body={body} />}>
        <div className={styles.paper}>
          <DraftPreview title={title} body={body} />
        </div>
      </Section>
      <Section id="edit" title="초안 고치기" note="## 소제목, - 목록, | 표 |, **굵게** 를 쓸 수 있어요.">
        <form onSubmit={onSubmit} className={`${formStyles.form} ${styles.editor}`} noValidate>
          <input type="hidden" name="id" value={id} />
          <Field label="제목" error={errors.title}>
            <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} autoComplete="off" />
          </Field>
          <Field label="본문" error={errors.body}>
            <textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} spellCheck={false} />
          </Field>
          <div className={formStyles.actions}>
            <SubmitButton pending={pending} disabled={!dirty} tone={dirty ? "primary" : "base"} pendingLabel="저장 중…" icon={<Check aria-hidden />}>
              {dirty ? "변경 내용 저장" : "저장됨"}
            </SubmitButton>
            <ConfirmAction
              small={false}
              label={
                <>
                  <Trash2 aria-hidden />
                  초안 삭제
                </>
              }
              question="이 초안을 보관함에서 삭제할까요?"
              confirmLabel="삭제"
              onConfirm={() => deleteArticleAction({ id })}
            />
          </div>
          <ActionNotice state={state} />
        </form>
      </Section>
    </div>
  );
}

function CopyButtons({ title, body }: { title: string; body: string }) {
  return (
    <span className={styles.benchTools}>
      <CopyButton text={`<h1>${title.replace(/[<>&]/g, "")}</h1>\n${draftToHtml(body)}`} label="HTML 복사" />
      <CopyButton text={`${title}\n\n${draftToText(body)}`} label="텍스트 복사" />
    </span>
  );
}
