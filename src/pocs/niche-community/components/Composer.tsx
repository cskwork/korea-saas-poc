"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { idleState, type ActionState } from "@/core/actions";
import { LIMITS } from "../domain/inputs";
import type { PostingAllowance } from "../domain/rules";
import { createPostAction } from "../server/actions";
import type { ChannelRef } from "../server/types";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./composer.module.css";
import ui from "./ui.module.css";

interface ComposerProps {
  channels: (ChannelRef & { writable: boolean })[];
  defaultChannelId: string | null;
  allowance: PostingAllowance;
  canPublishPremium: boolean;
}

/** A blank slide with PowerPoint's placeholders: the feed's primary action. */
export function Composer({ channels, defaultChannelId, allowance, canPublishPremium }: ComposerProps) {
  const writable = channels.filter((channel) => channel.writable);
  const initialChannel = writable.find((channel) => channel.id === defaultChannelId)?.id ?? writable[0]?.id ?? "";
  const [open, setOpen] = useState(false);
  const [channelId, setChannelId] = useState(initialChannel);
  const [state, submit, pending] = useActionState(
    async (previous: ActionState<{ id: string }>, formData: FormData) => {
      const result = await createPostAction(previous, formData);
      if (result.status === "success") setOpen(false);
      return result;
    },
    idleState,
  );
  const selected = channels.find((channel) => channel.id === channelId);
  const forcedPremium = selected?.access === "premium";
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (!allowance.allowed) {
    return (
      <section className={`${ui.slide} ${styles.blocked}`} aria-label="새 글">
        <p className={styles.blockedTitle}>오늘 쓸 수 있는 글 {allowance.limit}개를 모두 썼어요.</p>
        <p className={styles.blockedText}>
          무료 멤버는 하루 {allowance.limit}개까지 쓸 수 있어요. 내일 다시 쓰거나{" "}
          <Link href="/niche-community/membership" className={ui.link}>
            프리미엄으로 바꾸면
          </Link>{" "}
          제한 없이 쓸 수 있어요.
        </p>
      </section>
    );
  }

  return (
    <section className={`${ui.slide} ${styles.composer}`} aria-label="새 글 쓰기">
      <form
        key={state.status === "success" ? state.data?.id : "draft"}
        action={submit}
        className={styles.form}
        noValidate
      >
        <label htmlFor="nc-compose-title" className={ui.srOnly}>
          제목
        </label>
        <input
          id="nc-compose-title"
          name="title"
          className={styles.titleInput}
          placeholder="제목을 입력하십시오"
          maxLength={LIMITS.postTitle}
          autoComplete="off"
          required
          onFocus={() => setOpen(true)}
          {...fieldProps("compose-title", errors?.title)}
        />
        <FieldError id="compose-title" messages={errors?.title} />
        <div className={styles.more} data-open={open || Boolean(errors)}>
          <label htmlFor="nc-compose-body" className={ui.srOnly}>
            본문
          </label>
          <textarea
            id="nc-compose-body"
            name="body"
            className={styles.bodyInput}
            placeholder="텍스트를 입력하십시오"
            rows={5}
            maxLength={LIMITS.postBody}
            required
            {...fieldProps("compose-body", errors?.body)}
          />
          <FieldError id="compose-body" messages={errors?.body} />
          <div className={styles.options}>
            <div className={ui.field}>
              <label htmlFor="nc-compose-channel" className={ui.label}>
                채널
              </label>
              <select
                id="nc-compose-channel"
                name="channelId"
                className={ui.select}
                value={channelId}
                onChange={(event) => setChannelId(event.target.value)}
                {...fieldProps("compose-channel", errors?.channelId)}
              >
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id} disabled={!channel.writable}>
                    {channel.name}
                    {channel.access === "premium" ? (channel.writable ? " (대외비)" : " (프리미엄 전용)") : ""}
                  </option>
                ))}
              </select>
              <FieldError id="compose-channel" messages={errors?.channelId} />
            </div>
            {canPublishPremium ? (
              <label className={ui.check}>
                <input
                  type="checkbox"
                  name="premiumOnly"
                  defaultChecked={forcedPremium}
                  key={forcedPremium ? "forced" : "free"}
                  disabled={forcedPremium}
                />
                대외비로 올리기 (프리미엄 멤버만 읽기)
              </label>
            ) : null}
            {forcedPremium ? <input type="hidden" name="premiumOnly" value="on" /> : null}
          </div>
        </div>
        <div className={styles.footer}>
          <p className={styles.allowance}>
            {allowance.limit === null ? "프리미엄 · 하루 작성 제한 없음" : `오늘 ${allowance.limit}개 중 ${allowance.left}개 남음`}
          </p>
          <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
            {pending ? "게시하는 중…" : "게시"}
          </button>
        </div>
        <p role={state.status === "error" ? "alert" : "status"} className={styles.message}>
          {state.status === "error" && !state.fieldErrors ? state.message : null}
          {state.status === "success" && state.data ? (
            <>
              {state.message}{" "}
              <Link href={`/niche-community/posts/${state.data.id}`} className={ui.link}>
                바로 보기
              </Link>
            </>
          ) : null}
        </p>
      </form>
    </section>
  );
}
