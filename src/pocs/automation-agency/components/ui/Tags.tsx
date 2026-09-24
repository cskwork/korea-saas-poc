import type { CSSProperties } from "react";
import clsx from "clsx";
import { ArrowUpRight, Check, CircleDashed, Pause, Play, Square, X } from "lucide-react";
import type { LeadStatus, MaintenanceStatus, Platform, QuoteStatus, Stage } from "../../db/schema";
import { LEAD_STATUS_LABEL, MAINTENANCE_LABEL, PLATFORM_INFO, QUOTE_STATUS_LABEL } from "../../domain/labels";
import { STAGE_LABEL } from "../../domain/stages";
import ui from "./ui.module.css";

/** A platform shown as a metro line badge: coloured disc with its letter, plus the name. */
export function LineBadge({ platform, showLabel = true }: { platform: Platform; showLabel?: boolean }) {
  const info = PLATFORM_INFO[platform];
  return (
    <span className={ui.lineBadge} title={showLabel ? undefined : info.label}>
      <span
        className={ui.lineDisc}
        style={{ "--line": `var(--aa-line-${platform})` } as CSSProperties}
        aria-hidden="true"
      >
        {info.code}
      </span>
      {showLabel ? info.label : <span className={ui.srOnly}>{info.label}</span>}
    </span>
  );
}

export function StageTag({ stage }: { stage: Stage }) {
  return (
    <span className={ui.stageTag}>
      <span className={clsx(ui.stageDot, stage === "maintenance" && ui.stageDotLoop)} aria-hidden="true" />
      {STAGE_LABEL[stage]}
    </span>
  );
}

const QUOTE_TONE: Record<QuoteStatus, string> = {
  draft: "",
  sent: ui.tagInfo,
  accepted: ui.tagOk,
  declined: ui.tagDanger,
};
const QUOTE_ICON = { draft: CircleDashed, sent: ArrowUpRight, accepted: Check, declined: X } as const;

export function QuoteStatusTag({ status }: { status: QuoteStatus }) {
  const Icon = QUOTE_ICON[status];
  return (
    <span className={clsx(ui.tag, QUOTE_TONE[status])}>
      <Icon size={12} aria-hidden="true" />
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}

const MAINTENANCE_TONE: Record<MaintenanceStatus, string> = {
  none: "",
  active: ui.tagOk,
  paused: ui.tagWarn,
  ended: "",
};
const MAINTENANCE_ICON = { none: CircleDashed, active: Play, paused: Pause, ended: Square } as const;

export function MaintenanceTag({ status }: { status: MaintenanceStatus }) {
  const Icon = MAINTENANCE_ICON[status];
  return (
    <span className={clsx(ui.tag, MAINTENANCE_TONE[status])}>
      <Icon size={11} aria-hidden="true" />
      {MAINTENANCE_LABEL[status]}
    </span>
  );
}

const LEAD_TONE: Record<LeadStatus, string> = {
  new: ui.tagInfo,
  consulting: ui.tagWarn,
  quoted: ui.tagInfo,
  won: ui.tagOk,
  on_hold: "",
};

export function LeadStatusTag({ status }: { status: LeadStatus }) {
  return <span className={clsx(ui.tag, LEAD_TONE[status])}>{LEAD_STATUS_LABEL[status]}</span>;
}
