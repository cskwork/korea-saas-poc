"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { EditToggle } from "../projects/EditToggle";
import { buttonClass } from "../ui/button";
import { ClientForm, type ClientDraft } from "./ClientForm";
import styles from "./Clients.module.css";

export function ClientEditor({ client }: { client: ClientDraft }) {
  return <EditToggle label="정보 편집" render={(close) => <ClientForm client={client} onSaved={close} />} />;
}

/** "새 고객" opens the form inline above the list. */
export function NewClientPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.newPanel}>
      <button type="button" className={buttonClass(open ? "ghost" : "primary")} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
        {open ? "닫기" : "새 고객"}
      </button>
      {open ? (
        <div className={styles.newBody}>
          <ClientForm />
        </div>
      ) : null}
    </div>
  );
}
