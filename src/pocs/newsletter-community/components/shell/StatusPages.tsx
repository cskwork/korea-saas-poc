"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { buttonClass } from "../ui/button";
import styles from "./status.module.css";

/** 404 inside the module: the page asked for is not in this publication. */
export function NotFoundPage() {
  return (
    <section className={styles.status} aria-labelledby="nc-status-title">
      <p className={styles.code}>404</p>
      <h1 id="nc-status-title" className={styles.title}>
        이 지면은 비어 있어요
      </h1>
      <p className={styles.text}>
        지워졌거나 아직 발행되지 않은 호, 또는 다른 편집실의 글일 수 있어요. 주소를 확인하거나 목차에서 다시 찾아 주세요.
      </p>
      <div className={styles.actions}>
        <Link href="/newsletter-community" className={buttonClass("primary")}>
          편집실로
        </Link>
        <Link href="/newsletter-community/letter" className={buttonClass("secondary")}>
          지난 호 목차
        </Link>
      </div>
    </section>
  );
}

/** Unexpected failure: say so plainly and offer a retry. */
export function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section className={styles.status} aria-labelledby="nc-status-title" role="alert">
      <p className={styles.code}>잠시 멈춤</p>
      <h1 id="nc-status-title" className={styles.title}>
        이 지면을 불러오지 못했어요
      </h1>
      <p className={styles.text}>
        데이터베이스 연결이 잠깐 끊겼거나 서버에 문제가 생겼어요. 다시 시도해도 안 되면 잠시 후에 들러 주세요.
        {error.digest && <span className={styles.digest}>오류 번호 {error.digest}</span>}
      </p>
      <div className={styles.actions}>
        <button type="button" className={buttonClass("primary")} onClick={() => retry()}>
          <RotateCcw size={16} aria-hidden />
          다시 시도
        </button>
        <Link href="/newsletter-community" className={buttonClass("secondary")}>
          편집실로
        </Link>
      </div>
    </section>
  );
}
