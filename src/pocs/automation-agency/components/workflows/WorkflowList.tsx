import type { CSSProperties } from "react";
import Link from "next/link";
import { formatRelative } from "@/core/format";
import type { Platform } from "../../db/schema";
import type { WorkflowListItem } from "../../server/data/workflows";
import { BASE_PATH } from "../shell/stations";
import { EmptyLine } from "../ui/EmptyLine";
import { LineBadge } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./builder.module.css";

/** A workflow in miniature: its line colour with one tick per station (up to six). */
function LineStrip({ platform, stations }: { platform: Platform; stations: number }) {
  const n = Math.min(stations, 6);
  const step = n > 1 ? 76 / (n - 1) : 0;
  return (
    <svg viewBox="0 0 92 22" aria-hidden="true" style={{ "--line": `var(--aa-line-${platform})` } as CSSProperties}>
      <path d="M8 11h76" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={8 + i * step} cy={11} r={5} fill="#fff" stroke="var(--line)" strokeWidth="3" />
      ))}
    </svg>
  );
}

export function WorkflowList({ workflows }: { workflows: WorkflowListItem[] }) {
  if (workflows.length === 0) {
    return (
      <EmptyLine title="아직 설계한 노선이 없어요">오른쪽에서 이름과 플랫폼을 정하고 첫 워크플로를 만드세요.</EmptyLine>
    );
  }
  return (
    <ul className={styles.lines}>
      {workflows.map((w) => (
        <li key={w.id} className={styles.lineRow}>
          <span className={styles.lineStrip}>
            <LineStrip platform={w.platform} stations={w.nodeCount} />
          </span>
          <div className={styles.lineMain}>
            <Link href={`${BASE_PATH}/workflows/${w.id}`} className={ui.rowLink}>
              {w.name}
            </Link>
            <div className={styles.lineMeta}>
              <LineBadge platform={w.platform} />
              <span>역 {w.nodeCount}개</span>
              {w.projectName ? <span>{w.projectName}</span> : <span>프로젝트 미연결</span>}
              <span>{formatRelative(w.updatedAt)} 수정</span>
            </div>
          </div>
          <span className={styles.lineStatus}>
            {w.issueCount === 0 ? (
              <span className={`${ui.tag} ${ui.tagOk}`}>운행 가능</span>
            ) : (
              <span className={`${ui.tag} ${ui.tagWarn}`}>점검 {w.issueCount}건</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
