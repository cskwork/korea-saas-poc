"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { idleState } from "@/core/actions";
import { setPackageArchivedAction } from "../../server/actions";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";

/** Stop or resume selling a package. Existing quotes and projects keep their reference. */
export function ArchiveToggle({ id, archived }: { id: string; archived: boolean }) {
  const [state, action] = useActionState(setPackageArchivedAction, idleState);
  return (
    <form action={action} className={ui.formFoot}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archived" value={archived ? "false" : "true"} />
      <SubmitButton
        variant={archived ? "secondary" : "ghost"}
        pendingLabel="바꾸는 중…"
        icon={archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
      >
        {archived ? "다시 판매하기" : "판매 중지"}
      </SubmitButton>
      <ActionNotice state={state} />
    </form>
  );
}
