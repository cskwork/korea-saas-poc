"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { buttonClass } from "../ui/button";
import styles from "./EditToggle.module.css";

/**
 * A disclosure for an edit form under the page header (no modal: the page stays in view).
 * `render` receives a `close` callback so the form can fold itself away after saving.
 */
export function EditToggle({ label, render }: { label: string; render: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.wrap}>
      <button type="button" className={buttonClass(open ? "ghost" : "secondary", { small: true })} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X size={14} aria-hidden="true" /> : <Pencil size={14} aria-hidden="true" />}
        {open ? "편집 닫기" : label}
      </button>
      {open ? <div className={styles.body}>{render(() => setOpen(false))}</div> : null}
    </div>
  );
}
