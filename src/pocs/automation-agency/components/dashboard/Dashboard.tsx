import Link from "next/link";
import { FilePlus2, Plus } from "lucide-react";
import { formatKrw, formatMonthDay, formatPercent, seoulDateKey } from "@/core/format";
import type { Dashboard as DashboardData } from "../../server/data/dashboard";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { PageHeader, SectionHead } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { MrrChart } from "./MrrChart";
import { NetworkMap } from "./NetworkMap";
import { ArrivalsBoard, OpenQuotes, TopPackages } from "./Panels";
import styles from "./dashboard.module.css";

export function Dashboard({ data }: { data: DashboardData }) {
  const today = seoulDateKey();
  const { pipeline } = data;
  return (
    <>
      <PageHeader
        title="운행 현황"
        lede={`${formatMonthDay(new Date())} 기준. 구축선에서 진행 중인 프로젝트와 유지보수 순환선의 정기 수익을 한 장의 노선도로 봅니다.`}
      />

      <section className={styles.mapSection} aria-labelledby="map-title">
        <SectionHead
          id="map-title"
          title="노선도"
          note={
            <>
              구축선 <strong>{data.inDelivery}건</strong> 운행 중 · 구축비 합계{" "}
              <strong>{formatKrw(data.deliverySetupValue)}</strong>
            </>
          }
        >
          <div className={styles.mapActions}>
            <Link href={`${BASE_PATH}/quotes/new`} className={buttonClass("secondary", { small: true })}>
              <FilePlus2 size={15} aria-hidden="true" />
              견적 작성
            </Link>
            <Link href={`${BASE_PATH}/projects/new`} className={buttonClass("primary", { small: true })}>
              <Plus size={15} aria-hidden="true" />새 프로젝트
            </Link>
          </div>
        </SectionHead>
        <NetworkMap
          stations={data.stations}
          riders={data.riders}
          mrr={data.mrr}
          mrrDelta={data.mrrDelta}
          activeCount={data.activeSubscriptions}
          pausedCount={data.pausedSubscriptions}
        />
      </section>

      <div className={styles.twoCol}>
        <section className={ui.section} aria-labelledby="arrivals-title">
          <SectionHead id="arrivals-title" title="도착 예정" note="3주 안에 마감되는 구축 프로젝트" />
          <ArrivalsBoard arrivals={data.arrivals} />
        </section>
        <section className={ui.section} aria-labelledby="pipeline-title">
          <SectionHead id="pipeline-title" title="견적 대기">
            <Link href={`${BASE_PATH}/quotes`} className={ui.textLink}>
              전체 견적
            </Link>
          </SectionHead>
          <p className={styles.summary}>
            발송 <strong>{pipeline.openCount}건</strong> · 구축비 <strong>{formatKrw(pipeline.setupValue)}</strong> ·
            수락되면 월 <strong>+{formatKrw(pipeline.monthlyValue)}</strong>
            {pipeline.winRate !== null ? (
              <>
                {" "}
                · 수주율 <strong>{formatPercent(pipeline.winRate, 0)}</strong>
              </>
            ) : null}
          </p>
          <OpenQuotes quotes={data.openQuotes} />
        </section>
      </div>

      <div className={styles.twoCol}>
        <section className={ui.section} aria-labelledby="mrr-title" id="mrr">
          <SectionHead
            id="mrr-title"
            title="순환선 수익 추이"
            note="유지보수 시작·종료일로 계산한 월말 기준 정기 수익"
          />
          <MrrChart points={data.mrrHistory} currentYear={Number(today.slice(0, 4))} />
        </section>
        <section className={ui.section} aria-labelledby="top-title">
          <SectionHead id="top-title" title="많이 팔린 패키지">
            <Link href={`${BASE_PATH}/catalog`} className={ui.textLink}>
              솔루션 전체
            </Link>
          </SectionHead>
          <TopPackages packages={data.topPackages} />
          <p className={styles.leads}>
            <span>
              최근 30일 ROI 진단 <strong>{data.newLeads}건</strong>
            </span>
            <Link href={`${BASE_PATH}/roi`} className={ui.textLink}>
              진단 목록 보기
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
