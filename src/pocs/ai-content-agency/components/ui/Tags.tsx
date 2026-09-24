import { Bot, FileText, PencilLine } from "lucide-react";
import type { DraftSource } from "../../db/schema";
import { KIND_LABEL, type ContentKind } from "../../domain/content";
import { ORDER_STATUSES, STATUS_LABEL, statusIndex, type OrderStatus } from "../../domain/pipeline";
import styles from "./ui.module.css";

export function KindTag({ kind, short }: { kind: ContentKind; short?: boolean }) {
  return (
    <span className={styles.tag}>
      <span className={styles.swatch} data-kind={kind} aria-hidden="true" />
      {short ? KIND_LABEL[kind].replace(" 포스트", "") : KIND_LABEL[kind]}
    </span>
  );
}

/** The stage as words plus four blocks filled up to it. */
export function StageTag({ status }: { status: OrderStatus }) {
  const reached = statusIndex(status);
  return (
    <span className={styles.stage}>
      <span className={styles.stageBar} aria-hidden="true">
        {ORDER_STATUSES.map((s, i) => (
          <i key={s} data-on={i <= reached} />
        ))}
      </span>
      {STATUS_LABEL[status]}
    </span>
  );
}

export const SOURCE_LABEL: Record<DraftSource, string> = {
  claude: "Claude 작성",
  template: "기본 템플릿",
  edit: "에디터 수정",
};

export function SourceTag({ source }: { source: DraftSource }) {
  const Icon = source === "claude" ? Bot : source === "edit" ? PencilLine : FileText;
  return (
    <span className={styles.source} data-source={source}>
      <Icon size={14} aria-hidden="true" />
      {SOURCE_LABEL[source]}
    </span>
  );
}

export function SampleMark() {
  return <span className={styles.sampleMark}>샘플</span>;
}
