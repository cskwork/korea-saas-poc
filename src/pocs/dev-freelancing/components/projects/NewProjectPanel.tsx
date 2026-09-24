"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { ClientOption } from "../../server/data/clients";
import { buttonClass } from "../ui/button";
import { ProjectForm } from "./ProjectForm";
import styles from "./NewProjectPanel.module.css";

/** "새 프로젝트" opens an inline form above the board (no modal: the board stays in view). */
export function NewProjectPanel({ clients, defaultOpen }: { clients: ClientOption[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.panel}>
      <button type="button" className={buttonClass(open ? "ghost" : "primary")} aria-expanded={open} aria-controls="new-project" onClick={() => setOpen((value) => !value)}>
        {open ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
        {open ? "닫기" : "새 프로젝트"}
      </button>
      {open ? (
        <div id="new-project" className={styles.body}>
          <h2 className={styles.title}>새 프로젝트</h2>
          <ProjectForm clients={clients} />
        </div>
      ) : null}
    </div>
  );
}
