"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import { LIMITS } from "../domain/inputs";
import { deletePostAction, setPinnedAction, updatePostAction } from "../server/actions";
import type { ChannelRef } from "../server/types";
import { ActionButton, ConfirmButton } from "./ActionButtons";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./post.module.css";
import ui from "./ui.module.css";

interface EditablePostProps {
  post: { id: string; title: string; body: string; channelId: string; premiumOnly: boolean; pinned: boolean; commentCount: number };
  channels: (ChannelRef & { writable: boolean })[];
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  canPublishPremium: boolean;
  /** The read view (server-rendered). */
  children: ReactNode;
}

/** The slide plus its owner tools; "수정" swaps the slide for an inline editor. */
export function EditablePost({ post, channels, canEdit, canDelete, canPin, canPublishPremium, children }: EditablePostProps) {
  const [editing, setEditing] = useState(false);
  const [channelId, setChannelId] = useState(post.channelId);
  const [state, submit, pending] = useActionState(
    async (previous: ActionState, formData: FormData) => {
      const result = await updatePostAction(previous, formData);
      if (result.status === "success") setEditing(false);
      return result;
    },
    idleState,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const forcedPremium = channels.find((channel) => channel.id === channelId)?.access === "premium";

  const tools =
    canEdit || canDelete || canPin ? (
      <div className={styles.tools}>
        {canEdit ? (
          <button type="button" className={`${ui.button} ${ui.small}`} onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" />
            수정
          </button>
        ) : null}
        {canPin ? (
          <ActionButton
            run={setPinnedAction.bind(null, { id: post.id, pinned: !post.pinned })}
            className={`${ui.button} ${ui.small}`}
            pendingLabel="바꾸는 중…"
          >
            {post.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
            {post.pinned ? "공지 해제" : "공지로 고정"}
          </ActionButton>
        ) : null}
        {canDelete ? (
          <ConfirmButton
            run={deletePostAction.bind(null, { id: post.id })}
            question={`이 글을 삭제할까요? 댓글 ${post.commentCount}개도 함께 사라져요.`}
            confirmLabel="삭제할게요"
            className={`${ui.button} ${ui.small} ${ui.danger}`}
          >
            <Trash2 aria-hidden="true" />
            삭제
          </ConfirmButton>
        ) : null}
      </div>
    ) : null;

  if (!editing) {
    return (
      <>
        {children}
        {tools}
        {state.status === "success" && state.message ? (
          <p role="status" className={`${ui.status} ${ui.statusSuccess}`}>
            {state.message}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <form action={submit} className={styles.editor} noValidate>
      <input type="hidden" name="id" value={post.id} />
      <div className={ui.field}>
        <label htmlFor="nc-edit-title" className={ui.label}>
          제목
        </label>
        <input
          id="nc-edit-title"
          name="title"
          className={ui.input}
          defaultValue={post.title}
          maxLength={LIMITS.postTitle}
          required
          {...fieldProps("edit-title", errors?.title)}
        />
        <FieldError id="edit-title" messages={errors?.title} />
      </div>
      <div className={ui.field}>
        <label htmlFor="nc-edit-body" className={ui.label}>
          본문
        </label>
        <textarea
          id="nc-edit-body"
          name="body"
          className={ui.textarea}
          defaultValue={post.body}
          rows={12}
          maxLength={LIMITS.postBody}
          required
          {...fieldProps("edit-body", errors?.body)}
        />
        <FieldError id="edit-body" messages={errors?.body} />
      </div>
      <div className={styles.editorRow}>
        <div className={ui.field}>
          <label htmlFor="nc-edit-channel" className={ui.label}>
            채널
          </label>
          <select
            id="nc-edit-channel"
            name="channelId"
            className={ui.select}
            value={channelId}
            onChange={(event) => setChannelId(event.target.value)}
          >
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id} disabled={!channel.writable}>
                {channel.name}
                {channel.access === "premium" ? " (대외비)" : ""}
              </option>
            ))}
          </select>
        </div>
        {canPublishPremium ? (
          <label className={ui.check}>
            <input
              type="checkbox"
              name="premiumOnly"
              defaultChecked={post.premiumOnly || forcedPremium}
              key={forcedPremium ? "forced" : "free"}
              disabled={forcedPremium}
            />
            대외비로 올리기
          </label>
        ) : null}
        {forcedPremium ? <input type="hidden" name="premiumOnly" value="on" /> : null}
      </div>
      {state.status === "error" && !state.fieldErrors ? (
        <p role="alert" className={`${ui.status} ${ui.statusError}`}>
          {state.message}
        </p>
      ) : null}
      <div className={styles.tools}>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장하는 중…" : "저장"}
        </button>
        <button type="button" className={ui.button} onClick={() => setEditing(false)} disabled={pending}>
          취소
        </button>
      </div>
    </form>
  );
}
