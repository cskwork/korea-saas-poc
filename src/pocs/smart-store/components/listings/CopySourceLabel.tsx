import { PenLine, Sparkles, WandSparkles } from "lucide-react";
import type { CopySource } from "../../server/data/listings";
import styles from "./listings.module.css";

const LABEL: Record<CopySource, string> = {
  claude: "Claude가 작성",
  template: "기본 템플릿으로 작성",
  manual: "직접 고침",
};

/** Says honestly where the listing copy came from. */
export function CopySourceLabel({ source }: { source: CopySource }) {
  const Icon = source === "claude" ? Sparkles : source === "template" ? WandSparkles : PenLine;
  return (
    <span className={styles.source}>
      <Icon size={13} strokeWidth={2} aria-hidden />
      {LABEL[source]}
    </span>
  );
}
