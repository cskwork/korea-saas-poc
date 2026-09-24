import { ArrowRight, FilePlus2 } from "lucide-react";
import Link from "next/link";
import { formatMonthDay, formatWon } from "@/core/format";
import { dDay, monthLabel, shortDay } from "../../domain/dates";
import { INVOICE_STATUS_LABEL, PROJECT_STATUS_LABEL } from "../../domain/labels";
import { formatDuration, hoursLabel } from "../../domain/time";
import { setInvoiceStatus } from "../../server/actions";
import type { Overview as OverviewData } from "../../server/data/insights";
import { WorkCalendar } from "../calendar/WorkCalendar";
import { invoiceCell, projectCell } from "../documents/status";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { Cell, GoalCellsBar, HourCellsBar, StateLabel } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import styles from "./Overview.module.css";

const BASE = "/dev-freelancing";

export function Overview({ data }: { data: OverviewData }) {
  const { calendar, month, receivables } = data;
  return (
    <div className={styles.page}>
      <PageHeader
        title="개요"
        description={`${formatMonthDay(data.today)} · 샘플 데이터로 채운 작업공간이에요. 설정에서 언제든 처음 상태로 되돌릴 수 있어요.`}
        actions={
          <>
            <Link href={`${BASE}/projects?new=1`} className={buttonClass("secondary")}>
              새 프로젝트
            </Link>
            <Link href={`${BASE}/estimates/new`} className={buttonClass("primary")}>
              <FilePlus2 size={15} aria-hidden="true" />새 견적서
            </Link>
          </>
        }
      />

      <section className={styles.band} aria-labelledby="ov-calendar">
        <div className={`${ui.regionHead} ${styles.bandHead}`}>
          <h2 id="ov-calendar" className={ui.regionTitle}>
            작업 기록
          </h2>
          <p className={ui.regionNote}>최근 26주 · 칸 하나가 하루예요. 칸을 누르면 그날 기록으로 가요.</p>
        </div>
        <WorkCalendar calendar={calendar} mode="link" label="최근 26주 작업 기록" />
        <dl className={styles.facts}>
          <div>
            <dt>오늘</dt>
            <dd className={ui.measure}>{formatDuration(data.todayMinutes)}</dd>
          </div>
          <div>
            <dt>최근 7일</dt>
            <dd className={ui.measure}>{formatDuration(data.weekMinutes)}</dd>
          </div>
          <div>
            <dt>26주 동안</dt>
            <dd>
              <span className={ui.measure}>{hoursLabel(calendar.totalMinutes)}</span>시간 · {calendar.activeDays}일
            </dd>
          </div>
          <div>
            <dt>입금</dt>
            <dd>
              {calendar.depositDays}번 · {formatWon(calendar.depositTotal)}
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="ov-owed">
          <div className={ui.regionHead}>
            <h2 id="ov-owed" className={ui.regionTitle}>
              받을 돈
            </h2>
            <p className={ui.regionNote}>
              {receivables.count}건 · <strong className={styles.owed}>{formatWon(receivables.amount)}</strong>
              {receivables.overdueCount > 0 ? <span className={styles.late}> · 연체 {receivables.overdueCount}건</span> : null}
            </p>
          </div>
          {data.open.length === 0 ? (
            <EmptyState title="받을 돈이 없어요">모든 인보이스가 입금완료 상태예요. 새 인보이스는 견적서를 수락 처리한 뒤 전환하면 만들어져요.</EmptyState>
          ) : (
            <ol role="list" className={styles.ledger}>
              {data.open.map((invoice) => (
                <li key={invoice.id} className={styles.ledgerRow}>
                  <Cell state={invoiceCell(invoice.status, invoice.overdue)} size={12} />
                  <div className={styles.ledgerWhat}>
                    <Link href={`${BASE}/invoices/${invoice.id}`} className={ui.rowLink}>
                      {invoice.title}
                    </Link>
                    <span className={styles.ledgerSub}>
                      <span className={ui.measure}>{invoice.number}</span> · {invoice.clientCompany || invoice.clientName || "고객 미지정"}
                    </span>
                  </div>
                  <div className={styles.ledgerAmount}>
                    <span className={ui.num}>{formatWon(invoice.totals.payout)}</span>
                    <span className={invoice.overdue > 0 ? styles.late : styles.ledgerSub}>
                      {invoice.overdue > 0
                        ? `기한 지남 ${invoice.overdue}일`
                        : invoice.status === "issued"
                          ? "발행 · 아직 안 보냄"
                          : `${INVOICE_STATUS_LABEL[invoice.status]} · 기한 ${dDay(invoice.dueOn, data.today)}`}
                    </span>
                  </div>
                  <div className={styles.ledgerAction}>
                    {invoice.status === "issued" ? (
                      <ActionButton action={setInvoiceStatus} payload={{ id: invoice.id, status: "awaiting" }} small pendingLabel="처리 중…">
                        발송 처리
                      </ActionButton>
                    ) : (
                      <ActionButton action={setInvoiceStatus} payload={{ id: invoice.id, status: "paid" }} small variant="primary" pendingLabel="처리 중…">
                        입금 확인
                      </ActionButton>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={styles.month} aria-labelledby="ov-month">
          <div className={ui.regionHead}>
            <h2 id="ov-month" className={ui.regionTitle}>
              {monthLabel(month.key)} 목표
            </h2>
            <Link href={`${BASE}/settings`} className={ui.textLink}>
              목표 바꾸기
            </Link>
          </div>
          <GoalCellsBar progress={month.goal} size={22} />
          <p className={styles.goalLine}>
            <strong className={ui.num}>{formatWon(month.paidSupply)}</strong>
            <span className={ui.muted}> / {formatWon(month.goal.goal)} · {Math.round(month.goal.ratio * 100)}%</span>
          </p>
          <dl className={styles.monthFacts}>
            <div>
              <dt>실제 입금 (원천징수 후)</dt>
              <dd className={ui.num}>{formatWon(month.payout)}</dd>
            </div>
            <div>
              <dt>이번 달 작업</dt>
              <dd className={ui.measure}>{formatDuration(month.minutes)}</dd>
            </div>
            <div>
              <dt>완료 프로젝트 실효 시급</dt>
              <dd className={ui.num}>{data.finishedRate === null ? "—" : `${formatWon(data.finishedRate)}/시간`}</dd>
            </div>
          </dl>
          <Link href={`${BASE}/revenue`} className={ui.textLink}>
            수익 자세히 <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className={ui.region} aria-labelledby="ov-active">
        <div className={ui.regionHead}>
          <h2 id="ov-active" className={ui.regionTitle}>
            진행 중인 프로젝트
          </h2>
          <Link href={`${BASE}/projects`} className={ui.textLink}>
            보드 열기 <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {data.active.length === 0 ? (
          <EmptyState title="진행 중인 프로젝트가 없어요" action={<Link href={`${BASE}/projects`} className={buttonClass("secondary", { small: true })}>보드로 가기</Link>}>
            문의 열에 있는 프로젝트를 &lsquo;진행 중&rsquo;으로 옮기면 여기에 시간과 마일스톤이 쌓여요.
          </EmptyState>
        ) : (
          <ul role="list" className={styles.projects}>
            {data.active.map((project) => (
              <li key={project.id} className={styles.projectRow}>
                <div className={styles.projectWhat}>
                  <Link href={`${BASE}/projects/${project.id}`} className={ui.rowLink}>
                    {project.title}
                  </Link>
                  <span className={styles.ledgerSub}>
                    <StateLabel state={projectCell(project.status)}>{PROJECT_STATUS_LABEL[project.status]}</StateLabel>
                    {project.clientCompany || project.clientName ? ` · ${project.clientCompany || project.clientName}` : ""}
                  </span>
                </div>
                <HourCellsBar estimatedHours={project.estimatedHours} trackedMinutes={project.trackedMinutes} maxCells={40} />
                <div className={styles.projectNext}>
                  {project.nextMilestone ? (
                    <>
                      <span className={styles.ledgerSub}>다음 마일스톤</span>
                      <span>{project.nextMilestone.title}</span>
                      {project.nextMilestone.dueOn ? (
                        <span className={ui.measure}>
                          {shortDay(project.nextMilestone.dueOn)} · {dDay(project.nextMilestone.dueOn, data.today)}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span className={styles.ledgerSub}>
                      {project.dueOn ? `마감 ${shortDay(project.dueOn)} · ${dDay(project.dueOn, data.today)}` : "마감일 없음"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.pendingEstimates.length > 0 ? (
        <section className={ui.region} aria-labelledby="ov-estimates">
          <div className={ui.regionHead}>
            <h2 id="ov-estimates" className={ui.regionTitle}>
              답을 기다리는 견적
            </h2>
            <Link href={`${BASE}/documents`} className={ui.textLink}>
              견적 · 청구 <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <ul role="list" className={styles.ledger}>
            {data.pendingEstimates.map((estimate) => (
              <li key={estimate.id} className={styles.ledgerRow}>
                <Cell state={estimate.expired ? "warn" : "partial"} size={12} />
                <div className={styles.ledgerWhat}>
                  <Link href={`${BASE}/estimates/${estimate.id}`} className={ui.rowLink}>
                    {estimate.title}
                  </Link>
                  <span className={styles.ledgerSub}>
                    <span className={ui.measure}>{estimate.number}</span> · {estimate.clientCompany || estimate.clientName || "고객 미지정"}
                  </span>
                </div>
                <div className={styles.ledgerAmount}>
                  <span className={ui.num}>{formatWon(estimate.totals.billed)}</span>
                  <span className={estimate.expired ? styles.late : styles.ledgerSub}>
                    {estimate.expired ? "유효기간 지남" : `유효 ${dDay(estimate.validUntil, data.today)}`}
                  </span>
                </div>
                <div className={styles.ledgerAction}>
                  <Link href={`${BASE}/estimates/${estimate.id}`} className={buttonClass("secondary", { small: true })}>
                    열기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
