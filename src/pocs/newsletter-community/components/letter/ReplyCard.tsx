"use client";

import clsx from "clsx";
import { Scissors } from "lucide-react";
import { formatNumber } from "@/core/format";
import type { Tier } from "../../domain/tiers";
import { subscribe } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { FormMessage } from "../ui/FormMessage";
import { useFormSubmit } from "../ui/useFormSubmit";
import ui from "../ui/ui.module.css";
import styles from "./letter.module.css";

export interface ReplyCardPlan {
  tier: Tier;
  name: string;
  price: number;
  summary: string;
}

/**
 * The bound-in 정기구독 신청서: tear along the line, tick a plan, write your
 * name and email. Submitting creates (or upgrades) a subscriber row.
 */
export function ReplyCard({
  plans,
  publicationName,
  defaultTier = "free",
  returnTo,
  title = "정기구독 신청서",
  defaults,
  id,
}: {
  plans: ReplyCardPlan[];
  publicationName: string;
  defaultTier?: Tier;
  returnTo?: string;
  title?: string;
  defaults?: { name: string; email: string };
  id?: string;
}) {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(subscribe, { toast: true });
  const headingId = `${id ?? "reply"}-title`;
  return (
    <section className={styles.replyCard} id={id} aria-labelledby={headingId}>
      <p className={styles.perforation} aria-hidden>
        <Scissors size={16} />
        <span>자르는 선</span>
      </p>
      <div className={styles.cardInner}>
        <div className={styles.cardHead}>
          <h2 id={headingId} className={styles.cardTitle}>
            {title}
          </h2>
          <p className={styles.cardAddress}>
            받는 곳
            <strong>{publicationName} 편집실</strong>
          </p>
        </div>
        <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.cardForm}>
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
          <fieldset className={styles.planChoices}>
            <legend className={styles.cardLabel}>구독 종류</legend>
            {plans.map((plan) => (
              <label key={plan.tier} className={styles.planChoice}>
                <input type="radio" name="tier" value={plan.tier} defaultChecked={plan.tier === defaultTier} />
                <span className={styles.box} aria-hidden />
                <span className={styles.planName}>{plan.name}</span>
                <span className={styles.planPrice}>{plan.price === 0 ? "0원" : `월 ${formatNumber(plan.price)}원`}</span>
                <span className={styles.planSummary}>{plan.summary}</span>
              </label>
            ))}
          </fieldset>
          <div className={styles.cardFields}>
            <label className={styles.lineField}>
              <span className={styles.cardLabel}>이름</span>
              <input
                name="name"
                required
                maxLength={40}
                autoComplete="name"
                defaultValue={defaults?.name}
                aria-invalid={fieldError("name") ? true : undefined}
                aria-describedby={fieldError("name") ? `${headingId}-name-error` : undefined}
              />
            </label>
            {fieldError("name") && (
              <p id={`${headingId}-name-error`} className={ui.error}>
                {fieldError("name")}
              </p>
            )}
            <label className={styles.lineField}>
              <span className={styles.cardLabel}>이메일</span>
              <input
                name="email"
                type="email"
                required
                maxLength={120}
                autoComplete="email"
                defaultValue={defaults?.email}
                aria-invalid={fieldError("email") ? true : undefined}
                aria-describedby={fieldError("email") ? `${headingId}-email-error` : undefined}
              />
            </label>
            {fieldError("email") && (
              <p id={`${headingId}-email-error`} className={ui.error}>
                {fieldError("email")}
              </p>
            )}
          </div>
          <button type="submit" className={clsx(buttonClass("primary"), styles.cardSubmit)} disabled={pending}>
            {pending ? "보내는 중…" : "신청서 보내기"}
          </button>
          <FormMessage state={state} showSuccess={false} />
          <p className={styles.cardNote}>
            데모라 결제는 연동되어 있지 않아요. 유료 플랜을 고르면 바로 유료 독자로 기록되고, 이 브라우저가 구독자로 기억해요.
          </p>
        </form>
      </div>
    </section>
  );
}
