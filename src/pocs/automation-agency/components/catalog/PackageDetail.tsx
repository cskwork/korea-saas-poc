import Link from "next/link";
import { Calculator, FilePlus2 } from "lucide-react";
import { formatKrw, formatNumber } from "@/core/format";
import { INDUSTRY_LABEL, PACKAGE_KIND_LABEL } from "../../domain/labels";
import { computeRoi, ROI_DEFAULTS, WEEKS_PER_MONTH } from "../../domain/roi";
import type { PackageWithUsage } from "../../server/data/catalog";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { Notice } from "../ui/Notice";
import { PageHeader, SectionHead } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { ArchiveToggle } from "./ArchiveToggle";
import { ToolLines } from "./Catalog";
import { PackageForm } from "./PackageForm";
import styles from "./catalog.module.css";

export function PackageDetail({ pkg, saved }: { pkg: PackageWithUsage; saved: boolean }) {
  // Quick estimate at the default hourly cost: the package's monthly hours, fully automated.
  const estimate = computeRoi({
    weeklyHours: pkg.monthlyHoursSaved / WEEKS_PER_MONTH,
    hourlyCost: ROI_DEFAULTS.hourlyCost,
    automationRate: 100,
    investment: pkg.setupFee,
    monthlyFee: pkg.monthlyFee,
  });

  return (
    <>
      <PageHeader
        back={{ href: `${BASE_PATH}/catalog`, label: "솔루션 카탈로그" }}
        title={pkg.name}
        lede={pkg.summary}
        actions={
          pkg.archived ? null : (
            <Link href={`${BASE_PATH}/quotes/new?package=${pkg.id}`} className={buttonClass("primary")}>
              <FilePlus2 size={16} aria-hidden="true" />
              견적에 담기
            </Link>
          )
        }
      />
      {saved ? (
        <Notice tone="ok" className={ui.noticeGap}>
          패키지를 등록했어요.
        </Notice>
      ) : null}
      {pkg.archived ? (
        <Notice tone="info" className={ui.noticeGap}>
          판매 중지된 패키지예요. 새 견적과 프로젝트의 선택지에서 빠져요.
        </Notice>
      ) : null}

      <div className={styles.detail}>
        <div>
          <div className={styles.detailBlock}>
            <h2 className={styles.blockTitle}>무엇을 자동화하나요</h2>
            <p className={styles.prose}>{pkg.details || pkg.summary}</p>
          </div>
          <div className={styles.detailBlock}>
            <h2 className={styles.blockTitle}>사용 도구</h2>
            <ToolLines tools={pkg.tools} />
          </div>
          <div className={styles.detailBlock}>
            <dl className={ui.facts}>
              <div className={ui.fact}>
                <dt>업종 · 유형</dt>
                <dd>
                  {INDUSTRY_LABEL[pkg.industry]} · {PACKAGE_KIND_LABEL[pkg.kind]}
                </dd>
              </div>
              <div className={ui.fact}>
                <dt>구축 시간</dt>
                <dd>{pkg.buildHours}시간</dd>
              </div>
              <div className={ui.fact}>
                <dt>월 절감 시간</dt>
                <dd>{pkg.monthlyHoursSaved}시간</dd>
              </div>
              <div className={ui.fact}>
                <dt>판매 실적</dt>
                <dd>
                  프로젝트 {pkg.projectCount} · 견적 {pkg.quoteCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className={ui.panelMuted} aria-labelledby="fare-title">
          <h2 id="fare-title" className={styles.blockTitle}>
            요금과 회수 기간
          </h2>
          <dl className={styles.fare}>
            <div className={styles.fareRow}>
              <dt>구축비 (1회)</dt>
              <dd>{formatKrw(pkg.setupFee)}</dd>
            </div>
            <div className={styles.fareRow}>
              <dt>월 유지보수비</dt>
              <dd>{formatKrw(pkg.monthlyFee)}</dd>
            </div>
            <div className={styles.fareRow}>
              <dt>월 절감 인건비</dt>
              <dd>{formatKrw(estimate.monthlySavings)}</dd>
            </div>
            <div className={`${styles.fareRow} ${styles.fareTotal}`}>
              <dt>투자 회수</dt>
              <dd>{estimate.paybackMonths === null ? "회수 어려움" : `${formatNumber(estimate.paybackMonths)}개월`}</dd>
            </div>
          </dl>
          <p className={styles.estimateNote}>
            시간당 인건비 {formatKrw(ROI_DEFAULTS.hourlyCost)}, 절감 시간 전부 자동화 기준의 추정이에요. 고객 조건으로
            다시 계산해 보세요.
          </p>
          <div className={styles.sideActions}>
            <Link href={`${BASE_PATH}/roi?package=${pkg.id}`} className={buttonClass("secondary")}>
              <Calculator size={16} aria-hidden="true" />
              ROI 진단에서 계산
            </Link>
            <ArchiveToggle id={pkg.id} archived={pkg.archived} />
          </div>
        </aside>
      </div>

      <section className={ui.section} aria-labelledby="edit-title">
        <SectionHead
          id="edit-title"
          title="패키지 정보 수정"
          note="바꾼 가격은 새 견적부터 적용돼요. 이미 만든 견적은 그대로예요."
        />
        <PackageForm
          values={{
            id: pkg.id,
            name: pkg.name,
            industry: pkg.industry,
            kind: pkg.kind,
            summary: pkg.summary,
            details: pkg.details,
            tools: pkg.tools,
            buildHours: pkg.buildHours,
            monthlyHoursSaved: pkg.monthlyHoursSaved,
            setupFee: pkg.setupFee,
            monthlyFee: pkg.monthlyFee,
          }}
        />
      </section>
    </>
  );
}
