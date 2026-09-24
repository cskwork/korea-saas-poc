"use client";

import clsx from "clsx";
import { Pause, Play } from "lucide-react";
import { setListingStatus } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";

/** 판매중 ⇄ 판매중지. Pausing stops new (test) orders; existing orders are untouched. */
export function ListingStatusToggle({
  id,
  status,
  small,
}: {
  id: string;
  status: "selling" | "paused";
  small?: boolean;
}) {
  const selling = status === "selling";
  return (
    <ActionButton
      action={setListingStatus}
      input={{ id, status: selling ? ("paused" as const) : ("selling" as const) }}
      className={clsx(ui.btn, small && ui.btnSm, !selling && ui.btnPop)}
    >
      {selling ? <Pause size={14} strokeWidth={2} aria-hidden /> : <Play size={14} strokeWidth={2} aria-hidden />}
      {selling ? "판매 중지" : "판매 재개"}
    </ActionButton>
  );
}
