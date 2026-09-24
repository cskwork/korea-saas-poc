"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import { formatRelative } from "@/core/format";
import { CHANNEL_ICONS, LIMITS, type ChannelIconKey } from "../domain/inputs";
import { createChannelAction, deleteChannelAction, moveChannelAction, updateChannelAction } from "../server/actions";
import type { ChannelSummary } from "../server/types";
import { ActionButton, ConfirmButton } from "./ActionButtons";
import { CHANNEL_ICON_LABELS, ChannelIcon } from "./ChannelIcon";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./admin.module.css";
import ui from "./ui.module.css";

interface ChannelDraft {
  id?: string;
  name: string;
  description: string;
  access: "open" | "premium";
  icon: ChannelIconKey;
}

function ChannelForm({ draft, onDone }: { draft: ChannelDraft; onDone?: () => void }) {
  const editing = Boolean(draft.id);
  const [saved, setSaved] = useState(0);
  const [state, submit, pending] = useActionState(async (_previous: ActionState, formData: FormData) => {
    const result = editing ? await updateChannelAction(idleState, formData) : await createChannelAction(idleState, formData);
    if (result.status === "success") {
      setSaved((count) => count + 1);
      onDone?.();
    }
    return result;
  }, idleState);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const id = (name: string) => `channel-${draft.id ?? "new"}-${name}`;

  return (
    <form action={submit} className={styles.channelForm} noValidate key={editing ? "edit" : saved}>
      {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
      <div className={ui.field}>
        <label htmlFor={`nc-${id("name")}`} className={ui.label}>
          채널 이름
        </label>
        <input
          id={`nc-${id("name")}`}
          name="name"
          className={ui.input}
          defaultValue={draft.name}
          maxLength={LIMITS.channelName}
          placeholder="예: 채용과 팀빌딩"
          required
          {...fieldProps(id("name"), errors?.name)}
        />
        <FieldError id={id("name")} messages={errors?.name} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`nc-${id("description")}`} className={ui.label}>
          설명
        </label>
        <input
          id={`nc-${id("description")}`}
          name="description"
          className={ui.input}
          defaultValue={draft.description}
          maxLength={LIMITS.channelDescription}
          placeholder="어떤 이야기를 나누는 채널인가요?"
          {...fieldProps(id("description"), errors?.description)}
        />
        <FieldError id={id("description")} messages={errors?.description} />
      </div>
      <fieldset className={`${styles.iconPicker} ${styles.channelFormWide}`}>
        <legend className={ui.label}>아이콘</legend>
        {CHANNEL_ICONS.map((icon) => (
          <label key={icon} className={styles.iconOption}>
            <input type="radio" name="icon" value={icon} defaultChecked={draft.icon === icon} aria-label={CHANNEL_ICON_LABELS[icon]} />
            <span>
              <ChannelIcon icon={icon} size={18} />
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className={`${styles.iconPicker} ${styles.channelFormWide}`}>
        <legend className={ui.label}>공개 범위</legend>
        <label className={ui.check}>
          <input type="radio" name="access" value="open" defaultChecked={draft.access === "open"} />
          모든 멤버
        </label>
        <label className={ui.check}>
          <input type="radio" name="access" value="premium" defaultChecked={draft.access === "premium"} />
          대외비 (프리미엄 멤버만 읽고 쓰기)
        </label>
      </fieldset>
      <div className={`${styles.formFoot} ${styles.channelFormWide}`}>
        <p role={state.status === "error" ? "alert" : "status"} className={`${ui.status} ${state.status === "error" ? ui.statusError : ui.statusSuccess}`}>
          {state.status === "error" && !errors ? state.message : state.status === "success" ? state.message : null}
        </p>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장하는 중…" : editing ? "채널 저장" : "채널 열기"}
        </button>
      </div>
    </form>
  );
}

/** The agenda editor: order, rename, open or close to premium, delete (with its posts). */
export function ChannelManager({ channels, now }: { channels: ChannelSummary[]; now: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const reference = new Date(now);

  return (
    <div className={styles.page}>
      <details className={`${ui.slide} ${styles.createChannel}`}>
        <summary className={styles.createSummary}>
          <Plus size={18} aria-hidden="true" />
          새 채널 열기
        </summary>
        <ChannelForm draft={{ name: "", description: "", access: "open", icon: "message" }} />
      </details>
      <ol className={`${ui.slide} ${styles.channelsSlide}`}>
        {channels.map((channel, index) => (
          <li key={channel.id} className={styles.channelRow}>
            <div className={styles.order}>
              <ActionButton
                run={() => moveChannelAction({ id: channel.id, direction: "up" })}
                className={`${ui.button} ${ui.iconOnly} ${ui.quiet}`}
                pendingLabel="…"
                showFeedback={false}
              >
                <ArrowUp aria-label={`${channel.name} 위로`} />
              </ActionButton>
              <ActionButton
                run={() => moveChannelAction({ id: channel.id, direction: "down" })}
                className={`${ui.button} ${ui.iconOnly} ${ui.quiet}`}
                pendingLabel="…"
                showFeedback={false}
              >
                <ArrowDown aria-label={`${channel.name} 아래로`} />
              </ActionButton>
            </div>
            <div className={styles.channelInfo}>
              <p className={styles.channelTitle}>
                <ChannelIcon icon={channel.icon} size={18} />
                {channel.name}
                {channel.access === "premium" ? (
                  <span className={`${ui.tag} ${ui.secret}`}>
                    <Lock aria-hidden="true" />
                    대외비
                  </span>
                ) : null}
              </p>
              <p className={styles.channelDesc}>{channel.description || "설명 없음"}</p>
              <p className={styles.channelStats}>
                {index + 1}번째 · 글 {channel.postCount}개
                {channel.lastPostAt ? ` · 마지막 글 ${formatRelative(channel.lastPostAt, reference)}` : ""}
              </p>
            </div>
            <div className={styles.channelTools}>
              <button
                type="button"
                className={`${ui.button} ${ui.small}`}
                onClick={() => setEditing(editing === channel.id ? null : channel.id)}
                aria-expanded={editing === channel.id}
              >
                <Pencil aria-hidden="true" />
                {editing === channel.id ? "닫기" : "수정"}
              </button>
              <ConfirmButton
                run={() => deleteChannelAction({ id: channel.id })}
                question={
                  channel.postCount
                    ? `‘${channel.name}’ 채널과 글 ${channel.postCount}개가 모두 삭제돼요. 되돌릴 수 없어요.`
                    : `‘${channel.name}’ 채널을 삭제할까요?`
                }
                confirmLabel="채널 삭제"
                className={`${ui.button} ${ui.small} ${ui.danger}`}
              >
                <Trash2 aria-hidden="true" />
                삭제
              </ConfirmButton>
            </div>
            {editing === channel.id ? (
              <div className={styles.channelEditor}>
                <ChannelForm
                  draft={{ id: channel.id, name: channel.name, description: channel.description, access: channel.access, icon: channel.icon }}
                  onDone={() => setEditing(null)}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
