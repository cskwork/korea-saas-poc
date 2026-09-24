import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatNumber } from "@/core/format";
import { PLAN_LABEL, type PlanKind } from "../../domain/catalog";
import { ORDER_NOTES } from "../../domain/pricing";
import type { PackageRecord } from "../../server/studio-data";
import { Frame } from "../frame/Frame";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import { PackageEditor } from "./PackageEditor";
import styles from "./pricing.module.css";

export function PriceSheet({ packages, plan }: { packages: PackageRecord[]; plan: PlanKind }) {
  const shown = packages.filter((p) => p.kind === plan);
  return (
    <>
      <SheetHeader
        title="가격표"
        lead="단건 주문과 월 구독 패키지예요. ‘이 패키지로 주문’을 누르면 주문 접수서가 금액·수정 횟수·마감일까지 채워진 채로 열려요."
      >
        {(["single", "subscription"] as const).map((kind) => (
          <HeaderCell
            key={kind}
            label={PLAN_LABEL[kind]}
            value={`${packages.filter((p) => p.kind === kind).length}개`}
            sub={kind === "single" ? "작업 한 건씩" : "매월 자동 갱신"}
            href={kind === "single" ? paths.pricing : `${paths.pricing}?plan=subscription`}
            current={plan === kind}
          />
        ))}
      </SheetHeader>

      <div className={styles.sheetWrap}>
        <ol role="list" className={styles.sheet} aria-label={`${PLAN_LABEL[plan]} 패키지`}>
          {shown.map((pkg) => (
            <li key={pkg.id} className={styles.row} data-featured={pkg.featured || undefined}>
              <div className={styles.frame}>
                <Frame type={pkg.orderType ?? "bundle"} medium="pencil" height={72} maxWidth={128} />
              </div>
              <div className={styles.main}>
                <h2 className={styles.name}>
                  {pkg.name}
                  {pkg.featured && <span className={styles.pick}>추천</span>}
                </h2>
                <p className={styles.summary}>{pkg.summary}</p>
                <ul role="list" className={styles.includes}>
                  {pkg.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <dl className={styles.terms}>
                <div>
                  <dt>수정</dt>
                  <dd>{pkg.revisionLimit === null ? "무제한" : `${pkg.revisionLimit}회`}</dd>
                </div>
                <div>
                  <dt>{pkg.kind === "subscription" ? "요청당" : "작업"}</dt>
                  <dd>{pkg.turnaroundDays}일</dd>
                </div>
              </dl>
              <div className={styles.buy}>
                <p className={styles.price}>
                  <span className={styles.won}>₩</span>
                  {formatNumber(pkg.price)}
                  <span className={styles.unit}>/{pkg.unit}</span>
                </p>
                <Link
                  href={`${paths.newOrder}?package=${pkg.id}`}
                  className={[ui.button, pkg.featured ? "" : ui.secondary].join(" ")}
                >
                  {pkg.kind === "subscription" ? "이 플랜으로 구독 접수" : "이 패키지로 주문"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <PackageEditor pkg={pkg} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <section className={styles.notes} aria-labelledby="order-notes">
        <h2 id="order-notes" className={styles.notesTitle}>
          주문 안내
        </h2>
        <ul role="list" className={styles.noteList}>
          {ORDER_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
