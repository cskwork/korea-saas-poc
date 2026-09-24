import type { CSSProperties } from "react";
import Link from "next/link";
import { formatNumber } from "@/core/format";
import { ArrowRight } from "lucide-react";
import { SUPPLIER_LABEL, categoryLabel } from "../../domain/categories";
import type { CatalogEntry } from "../../server/data/catalog";
import { ListItemButton } from "../listings/ListItemButton";
import { EmptyState } from "../ui/EmptyState";
import { HangTag } from "../ui/HangTag";
import styles from "./overview.module.css";

/** Tags hang slightly askew on the rail, each its own way. */
const TILTS = [-1.6, 1.1, -0.7, 1.5];

/** Unlisted wholesale items with the best margins, each listable in one click. */
export function Picks({ picks }: { picks: CatalogEntry[] }) {
  return (
    <section aria-labelledby="picks-title" className={styles.picks}>
      <div className={styles.sectionHead}>
        <h2 id="picks-title" className={styles.sectionTitle}>
          아직 안 올린 고마진 도매 상품
        </h2>
        <Link href="/smart-store/sourcing" className={styles.footLink}>
          소싱 목록 전체 <ArrowRight size={14} strokeWidth={2} aria-hidden />
        </Link>
      </div>
      {picks.length === 0 ? (
        <EmptyState title="남는 도매 상품을 모두 올렸어요.">
          소싱 목록에서 조건을 바꿔 다른 상품을 찾아보세요.
        </EmptyState>
      ) : (
        <ul className={styles.pickRow}>
          {picks.map((pick, i) => (
            <li
              key={pick.id}
              className={styles.pick}
              style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
            >
              <HangTag margin={pick.margin} caption="권장 판매가" tilt />
              <div className={styles.pickText}>
                <Link href={`/smart-store/sourcing/${pick.id}`} className={styles.pickName}>
                  {pick.name}
                </Link>
                <p className={styles.pickMeta}>
                  {SUPPLIER_LABEL[pick.supplier]} · {categoryLabel(pick.category)} · 매입{" "}
                  {formatNumber(pick.wholesalePrice)}원
                </p>
              </div>
              <ListItemButton catalogItemId={pick.id} block />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
