"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { TIER_LABEL, TIERS } from "../../domain/tiers";
import type { SubscriberFilter } from "../../server/store/subscribers";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import styles from "./subscribers.module.css";

/** Search and filters as a plain GET form: every view is a shareable URL. Selects apply at once. */
export function SubscriberFilters({ filter }: { filter: SubscriberFilter }) {
  const submit = (event: React.ChangeEvent<HTMLSelectElement>) => event.currentTarget.form?.requestSubmit();
  const active = Boolean(filter.q || filter.tier || filter.status || filter.sort);
  return (
    <form className={styles.filters} action="/newsletter-community/subscribers" role="search" aria-label="구독자 찾기">
      <div className={styles.searchField}>
        <label htmlFor="subscriber-q" className={ui.srOnly}>
          이름이나 이메일
        </label>
        <input
          id="subscriber-q"
          name="q"
          type="search"
          className={ui.input}
          defaultValue={filter.q}
          placeholder="이름이나 이메일로 찾기"
          maxLength={60}
        />
        <button type="submit" className={buttonClass("secondary")} aria-label="찾기">
          <Search size={16} aria-hidden />
        </button>
      </div>
      <label className={styles.inlineSelect}>
        <span>등급</span>
        <select name="tier" className={ui.select} defaultValue={filter.tier ?? ""} onChange={submit}>
          <option value="">전체</option>
          {TIERS.map((tier) => (
            <option key={tier} value={tier}>
              {TIER_LABEL[tier]}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.inlineSelect}>
        <span>상태</span>
        <select name="status" className={ui.select} defaultValue={filter.status ?? ""} onChange={submit}>
          <option value="">전체</option>
          <option value="active">구독 중</option>
          <option value="unsubscribed">해지</option>
        </select>
      </label>
      <label className={styles.inlineSelect}>
        <span>정렬</span>
        <select name="sort" className={ui.select} defaultValue={filter.sort ?? "recent"} onChange={submit}>
          <option value="recent">최근 가입순</option>
          <option value="name">이름순</option>
          <option value="opened">최근 열람순</option>
        </select>
      </label>
      {active && (
        <Link href="/newsletter-community/subscribers" className={buttonClass("quiet", "sm")}>
          조건 지우기
        </Link>
      )}
    </form>
  );
}
