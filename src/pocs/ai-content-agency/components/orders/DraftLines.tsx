import Link from "next/link";
import { formatDate, formatNumber, formatTime } from "@/core/format";
import type { DraftSource } from "../../db/schema";
import { countCharacters } from "../../domain/content";
import { countOpenChecks } from "../../domain/templates";
import { SourceTag } from "../ui/Tags";
import styles from "./orders.module.css";

export interface DraftSummary {
  id: string;
  title: string;
  body: string;
  currentVersion: number;
  source: DraftSource;
  updatedAt: Date;
}

/** Title link and facts of one draft written for an order. */
export function DraftLine({ draft, delivered }: { draft: DraftSummary; delivered?: boolean }) {
  const checks = countOpenChecks(draft.body);
  return (
    <>
      <Link href={`/ai-content-agency/drafts/${draft.id}`} className={styles.draftTitle}>
        {draft.title}
        {delivered ? " (납품본)" : ""}
      </Link>
      <span className={styles.draftMeta}>
        <SourceTag source={draft.source} />
        <span>v{draft.currentVersion}</span>
        <span>{formatNumber(countCharacters(draft.body).withSpaces)}자</span>
        {/* Absolute time: this line also renders inside client components, where a relative time would drift between server and browser. */}
        <span>
          {formatDate(draft.updatedAt, { month: "numeric", day: "numeric" })} {formatTime(draft.updatedAt)}
        </span>
        {checks > 0 ? <span className={styles.checks}>확인 필요 {checks}곳</span> : null}
      </span>
    </>
  );
}

export function DraftLines({ drafts, deliveredDraftId }: { drafts: DraftSummary[]; deliveredDraftId: string | null }) {
  if (drafts.length === 0) return <p className={styles.filterNote}>아직 이 의뢰로 쓴 시안이 없어요.</p>;
  return (
    <ul className={styles.draftList} role="list">
      {drafts.map((draft) => (
        <li key={draft.id} className={`${styles.draftItem} ${styles.draftItemPlain}`}>
          <DraftLine draft={draft} delivered={draft.id === deliveredDraftId} />
        </li>
      ))}
    </ul>
  );
}
