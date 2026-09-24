"use client";

import { useActionState, useEffect } from "react";
import clsx from "clsx";
import { LoaderCircle, WandSparkles } from "lucide-react";
import { idleState } from "@/core/actions";
import { listCatalogItem } from "../../server/actions";
import { useToast } from "../ui/Toast";
import ui from "../ui/ui.module.css";

/**
 * One-click listing: writes the SEO copy (Claude or template) and creates a
 * selling listing, then opens it for review.
 */
export function ListItemButton({
  catalogItemId,
  block,
  quiet,
  label = "AI로 바로 등록",
}: {
  catalogItemId: string;
  block?: boolean;
  /** Secondary styling for dense rows, where a column of POP buttons would drown the margin tags. */
  quiet?: boolean;
  label?: string;
}) {
  const [state, submit, pending] = useActionState(listCatalogItem, idleState);
  const toast = useToast();
  useEffect(() => {
    if (state.status === "error") toast(state.message, "error");
  }, [state, toast]);

  return (
    <form action={submit} className={block ? ui.btnBlock : undefined}>
      <input type="hidden" name="catalogItemId" value={catalogItemId} />
      <button
        type="submit"
        className={clsx(ui.btn, !quiet && ui.btnPop, quiet && ui.btnSm, block && ui.btnBlock)}
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? (
          <LoaderCircle size={16} className={ui.spin} aria-hidden />
        ) : (
          <WandSparkles size={16} strokeWidth={2} aria-hidden />
        )}
        {pending ? "상품명·설명 쓰는 중…" : label}
      </button>
    </form>
  );
}
