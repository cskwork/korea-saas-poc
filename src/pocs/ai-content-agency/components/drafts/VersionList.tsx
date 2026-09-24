import Link from "next/link";
import { formatDate, formatNumber, formatTime } from "@/core/format";
import type { DraftVersionRow } from "../../db/schema";
import { countCharacters } from "../../domain/content";
import { SOURCE_LABEL } from "../ui/Tags";
import styles from "./drafts.module.css";

/** Every version, newest first, with who wrote it and how its length moved. */
export function VersionList({ draftId, versions, current, viewing }: { draftId: string; versions: DraftVersionRow[]; current: number; viewing: number }) {
  return (
    <ol className={styles.versions} reversed>
      {versions.map((version, i) => {
        const chars = countCharacters(version.body).withSpaces;
        const older = versions[i + 1];
        const delta = older ? chars - countCharacters(older.body).withSpaces : null;
        const isCurrent = version.version === current;
        return (
          <li key={version.id} className={styles.version} data-current={isCurrent} aria-current={version.version === viewing ? "true" : undefined}>
            <span className={styles.versionNo}>v{version.version}</span>
            <span className={styles.versionNote}>
              {version.note || SOURCE_LABEL[version.source]}
              {isCurrent ? " · 지금" : ""}
            </span>
            <span className={styles.versionMeta}>
              <span>{SOURCE_LABEL[version.source]}</span>
              <span>
                {formatDate(version.createdAt, { month: "numeric", day: "numeric" })} {formatTime(version.createdAt)}
              </span>
              <span>
                {formatNumber(chars)}자{delta ? ` (${delta > 0 ? "+" : ""}${formatNumber(delta)})` : ""}
              </span>
              {version.version !== viewing ? (
                <Link href={isCurrent ? `/ai-content-agency/drafts/${draftId}` : `/ai-content-agency/drafts/${draftId}?v=${version.version}`} scroll={false}>
                  {isCurrent ? "지금 버전 보기" : "이 버전 보기"}
                </Link>
              ) : (
                <strong>보는 중</strong>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
