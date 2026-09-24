import Link from "next/link";
import clsx from "clsx";
import { Minus, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { formatKrw } from "@/core/format";
import type { LoopRider, StationSummary } from "../../domain/dashboard";
import { STAGE_CODE, STAGE_LABEL } from "../../domain/stages";
import { BASE_PATH } from "../shell/stations";
import styles from "./network.module.css";

const MAX_NAMES = 4;
const MAX_RIDERS = 8;

/**
 * The agency as a metro map: the delivery line (대기 → 배포) runs left to right and
 * interchanges onto the maintenance circle line, which encloses the monthly recurring revenue.
 */
export function NetworkMap({
  stations,
  riders,
  mrr,
  mrrDelta,
  activeCount,
  pausedCount,
}: {
  stations: StationSummary[];
  riders: LoopRider[];
  mrr: number;
  mrrDelta: number;
  activeCount: number;
  pausedCount: number;
}) {
  const shown = riders.slice(0, MAX_RIDERS);
  const topCount = Math.ceil(shown.length / 2);
  const top = shown.slice(0, topCount);
  const bottom = shown.slice(topCount);
  const hidden = riders.length - shown.length;

  return (
    <div className={styles.network}>
      <div className={styles.build}>
        <svg className={styles.bend} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path d="M0 4 A28 28 0 0 1 28 32" />
        </svg>
        <span className={styles.drop} aria-hidden="true" />
        <ol className={styles.buildStations} aria-label="구축선 역별 프로젝트">
          {stations.map((station) => (
            <li
              key={station.stage}
              className={clsx(styles.station, station.projects.length === 0 && styles.stationEmpty)}
            >
              <span className={styles.disc} aria-hidden="true" />
              <div className={styles.stationBody}>
                <h3 className={styles.stationName}>
                  <Link href={`${BASE_PATH}/projects?stage=${station.stage}`}>{STAGE_LABEL[station.stage]}</Link>
                  <span className={styles.code} aria-hidden="true">
                    {STAGE_CODE[station.stage]}
                  </span>
                </h3>
                <p className={styles.count}>
                  {station.projects.length === 0 ? "비어 있음" : `${station.projects.length}건`}
                </p>
                {station.projects.length > 0 ? (
                  <ul className={styles.names}>
                    {station.projects.slice(0, MAX_NAMES).map((project) => (
                      <li key={project.id}>
                        <Link href={`${BASE_PATH}/projects/${project.id}`} className={styles.nameLink}>
                          {project.clientName}
                        </Link>
                        <span className={styles.progress}>{project.progress}%</span>
                        {project.overdue ? (
                          <span className={styles.late}>
                            <TriangleAlert size={12} aria-hidden="true" />
                            지연
                          </span>
                        ) : null}
                      </li>
                    ))}
                    {station.projects.length > MAX_NAMES ? (
                      <li>
                        <Link href={`${BASE_PATH}/projects?stage=${station.stage}`} className={styles.more}>
                          +{station.projects.length - MAX_NAMES}곳 더 보기
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.loop}>
        <span className={styles.interchange} aria-hidden="true" />
        <span className={styles.interchangeLabel}>유지보수 합류</span>

        <div className={styles.loopCenter}>
          <p className={styles.mrrLabel}>월 정기 수익</p>
          <p className={styles.mrr}>{formatKrw(mrr)}</p>
          <p className={styles.loopMeta}>
            운행 중 {activeCount}곳{pausedCount > 0 ? ` · 일시 정지 ${pausedCount}곳` : ""}
          </p>
          <p className={clsx(styles.delta, mrrDelta > 0 && styles.deltaUp, mrrDelta < 0 && styles.deltaDown)}>
            {mrrDelta > 0 ? (
              <TrendingUp size={15} aria-hidden="true" />
            ) : mrrDelta < 0 ? (
              <TrendingDown size={15} aria-hidden="true" />
            ) : (
              <Minus size={15} aria-hidden="true" />
            )}
            {mrrDelta === 0
              ? "지난달 말과 같아요"
              : `지난달 말보다 ${mrrDelta > 0 ? "+" : "−"}${formatKrw(Math.abs(mrrDelta))}`}
          </p>
        </div>

        {shown.length === 0 ? (
          <p className={styles.loopEmpty}>
            아직 순환선에 오른 고객이 없어요. 배포를 마친 프로젝트를 ‘다음 역으로’ 보내면 합류해요.
          </p>
        ) : (
          <>
            <RiderRow riders={top} position="top" />
            <RiderRow riders={bottom} position="bottom" />
          </>
        )}
        {hidden > 0 ? (
          <Link href={`${BASE_PATH}/projects?stage=maintenance`} className={styles.loopMore}>
            +{hidden}곳 더 보기
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function RiderRow({ riders, position }: { riders: LoopRider[]; position: "top" | "bottom" }) {
  if (riders.length === 0) return null;
  return (
    <ol
      className={clsx(styles.loopRow, position === "top" ? styles.loopTop : styles.loopBottom)}
      aria-label="유지보수 순환선 고객"
    >
      {riders.map((rider) => (
        <li key={rider.id} className={clsx(styles.rider, rider.status === "paused" && styles.riderPaused)}>
          <span className={styles.riderDisc} aria-hidden="true" />
          <span className={styles.riderLabel}>
            <Link href={`${BASE_PATH}/projects/${rider.id}`} className={styles.riderName}>
              {rider.clientName}
            </Link>
            <span className={styles.riderFee}>
              {rider.status === "paused" ? "일시 정지" : `월 ${formatKrw(rider.monthlyFee)}`}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
