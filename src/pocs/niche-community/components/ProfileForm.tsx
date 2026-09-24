"use client";

import { useActionState } from "react";
import { idleState } from "@/core/actions";
import { LIMITS } from "../domain/inputs";
import { updateProfileAction } from "../server/actions";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./members.module.css";
import ui from "./ui.module.css";

/** Editing your own name tag: nickname, one-line headline, short bio. */
export function ProfileForm({ nickname, headline, bio }: { nickname: string; headline: string; bio: string }) {
  const [state, submit, pending] = useActionState(updateProfileAction, idleState);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <form action={submit} className={styles.profileForm} noValidate>
      <div className={ui.field}>
        <label htmlFor="nc-profile-nickname" className={ui.label}>
          닉네임
        </label>
        <input
          id="nc-profile-nickname"
          name="nickname"
          className={ui.input}
          defaultValue={nickname}
          maxLength={LIMITS.nickname}
          required
          {...fieldProps("profile-nickname", errors?.nickname)}
        />
        <FieldError id="profile-nickname" messages={errors?.nickname} />
      </div>
      <div className={ui.field}>
        <label htmlFor="nc-profile-headline" className={ui.label}>
          한 줄 소개
        </label>
        <input
          id="nc-profile-headline"
          name="headline"
          className={ui.input}
          defaultValue={headline}
          maxLength={LIMITS.headline}
          placeholder="예: B2B SaaS 창업 2년 차"
          {...fieldProps("profile-headline", errors?.headline)}
        />
        <FieldError id="profile-headline" messages={errors?.headline} />
      </div>
      <div className={`${ui.field} ${styles.profileWide}`}>
        <label htmlFor="nc-profile-bio" className={ui.label}>
          소개
        </label>
        <textarea
          id="nc-profile-bio"
          name="bio"
          className={ui.textarea}
          defaultValue={bio}
          maxLength={LIMITS.bio}
          rows={3}
          {...fieldProps("profile-bio", errors?.bio)}
        />
        <FieldError id="profile-bio" messages={errors?.bio} />
      </div>
      <div className={`${styles.profileWide} ${styles.formFoot}`}>
        <p role={state.status === "error" ? "alert" : "status"} className={`${ui.status} ${state.status === "error" ? ui.statusError : ui.statusSuccess}`}>
          {state.status === "error" && !errors ? state.message : state.status === "success" ? state.message : null}
        </p>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장하는 중…" : "프로필 저장"}
        </button>
      </div>
    </form>
  );
}
