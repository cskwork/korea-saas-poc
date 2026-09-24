"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import styles from "./slide.module.css";

/** Copies the post's address; says so, or says how to copy it by hand when the clipboard is unavailable. */
export function ShareButton({ path }: { path: string }) {
  const [message, setMessage] = useState<string | null>(null);

  const copy = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setMessage("링크를 복사했어요");
    } catch {
      setMessage("복사하지 못했어요. 글을 열어 주소창의 링크를 복사해 주세요");
    }
    window.setTimeout(() => setMessage(null), 2400);
  };

  return (
    <>
      <button type="button" className={styles.action} onClick={copy}>
        <Link2 size={16} aria-hidden="true" />
        <span>공유</span>
      </button>
      <span role="status" className={styles.shareNote}>
        {message}
      </span>
    </>
  );
}
