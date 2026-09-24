"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { switchPersonaAction } from "../server/actions";
import type { PersonRef } from "../server/types";
import { Avatar } from "./Avatar";
import { personaLabel } from "./labels";
import styles from "./persona.module.css";

const POPOVER_ID = "nc-persona-switch";

/**
 * The visitor's 명찰 (name tag). There is no login in the demo: switching the tag
 * changes whose side of the community you see — the operator or a sample member.
 */
export function PersonaSwitch({ viewer, personas }: { viewer: PersonRef; personas: PersonRef[] }) {
  const popover = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = (memberId: string) => {
    setPendingId(memberId);
    setError(null);
    startTransition(async () => {
      const result = await switchPersonaAction({ memberId });
      if (result.status === "error") setError(result.message);
      else popover.current?.hidePopover();
      setPendingId(null);
    });
  };

  const groups = [
    { title: "운영자", people: personas.filter((person) => person.role === "operator") },
    { title: "프리미엄 멤버", people: personas.filter((person) => person.role === "member" && person.tier === "premium") },
    { title: "무료 멤버", people: personas.filter((person) => person.role === "member" && person.tier === "free") },
  ];

  return (
    <>
      <button
        type="button"
        className={styles.tag}
        popoverTarget={POPOVER_ID}
        aria-label={`지금 ${viewer.nickname} ${personaLabel(viewer)} 명찰로 보는 중. 명찰 바꾸기`}
      >
        <Avatar id={viewer.id} nickname={viewer.nickname} size="sm" operator={viewer.role === "operator"} />
        <span className={styles.tagName}>{viewer.nickname}</span>
        <span className={styles.tagRole}>{personaLabel(viewer)}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      <div ref={popover} id={POPOVER_ID} popover="auto" className={styles.popover} aria-labelledby={`${POPOVER_ID}-title`}>
        <h2 id={`${POPOVER_ID}-title`} className={styles.title}>
          명찰 바꾸기
        </h2>
        <p className={styles.note}>
          데모에는 로그인이 없어요. 명찰을 바꿔 달면 운영자와 멤버가 보는 화면을 모두 볼 수 있어요. 모두 샘플 멤버입니다.
        </p>
        {groups.map((group) =>
          group.people.length ? (
            <section key={group.title} className={styles.group} aria-label={group.title}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul role="list">
                {group.people.map((person) => {
                  const current = person.id === viewer.id;
                  return (
                    <li key={person.id}>
                      <button
                        type="button"
                        className={styles.option}
                        onClick={() => choose(person.id)}
                        disabled={pending || current}
                        aria-current={current ? "true" : undefined}
                      >
                        <Avatar id={person.id} nickname={person.nickname} size="md" operator={person.role === "operator"} />
                        <span className={styles.optionText}>
                          <span className={styles.optionName}>{person.nickname}</span>
                          <span className={styles.optionHeadline}>{person.headline}</span>
                        </span>
                        {current ? <Check size={16} aria-label="지금 명찰" /> : null}
                        {pendingId === person.id ? <span className={styles.pending}>바꾸는 중…</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null,
        )}
        {error ? (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        ) : null}
        <Link href="/niche-community/members" className={styles.more} onClick={() => popover.current?.hidePopover()}>
          멤버 전체에서 명찰 고르기
        </Link>
      </div>
    </>
  );
}
