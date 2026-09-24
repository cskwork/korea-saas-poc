import Link from "next/link";
import clsx from "clsx";
import { FilePlus2, Upload } from "lucide-react";
import { formatDate, formatKrw, formatNumber } from "@/core/format";
import { INDUSTRY_LABEL } from "../../domain/labels";
import type { DiagnosisWithRoi } from "../../server/data/diagnoses";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { EmptyLine } from "../ui/EmptyLine";
import ui from "../ui/ui.module.css";
import { DeleteDiagnosis, LeadStatusSelect } from "./DiagnosisControls";
import styles from "./roi.module.css";

/** Saved diagnoses (leads) with their computed payback, status and next steps. */
export function DiagnosisList({ diagnoses }: { diagnoses: DiagnosisWithRoi[] }) {
  if (diagnoses.length === 0) {
    return (
      <EmptyLine title="저장한 진단이 없어요">
        위 계산기에서 고객 조건을 넣고 ‘진단 저장’을 누르면 여기에 쌓여요.
      </EmptyLine>
    );
  }
  return (
    <table className={clsx(ui.table, ui.stack)}>
      <thead>
        <tr>
          <th scope="col">고객</th>
          <th scope="col" className={ui.num}>
            월 절감액
          </th>
          <th scope="col" className={ui.num}>
            투자 회수
          </th>
          <th scope="col">상태</th>
          <th scope="col">
            <span className={ui.srOnly}>작업</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {diagnoses.map((d) => (
          <tr key={d.id}>
            <td className={ui.wide}>
              <strong>{d.clientName}</strong>
              <span className={ui.sub}>
                {INDUSTRY_LABEL[d.industry]}
                {d.contactName ? ` · ${d.contactName}` : ""} · {formatDate(d.createdAt)} · 주 {d.weeklyHours}시간 ×{" "}
                {d.automationRate}%
              </span>
              {d.note ? <span className={styles.note}>{d.note}</span> : null}
            </td>
            <td data-label="월 절감액" className={ui.num}>
              {formatKrw(d.result.monthlySavings)}
              <span className={ui.sub}>월 {formatNumber(d.result.monthlyHoursSaved, 0)}시간</span>
            </td>
            <td data-label="투자 회수" className={ui.num}>
              {d.result.paybackMonths === null ? (
                <span className={styles.negative}>회수 어려움</span>
              ) : (
                `${d.result.paybackMonths}개월`
              )}
            </td>
            <td data-label="상태">
              <LeadStatusSelect id={d.id} status={d.status} />
            </td>
            <td className={ui.wide}>
              <div className={styles.rowActions}>
                <Link
                  href={`${BASE_PATH}/roi?diagnosis=${d.id}#calculator`}
                  className={buttonClass("ghost", { small: true })}
                >
                  <Upload size={15} aria-hidden="true" />
                  불러오기
                </Link>
                <Link
                  href={`${BASE_PATH}/quotes/new?diagnosis=${d.id}`}
                  className={buttonClass("secondary", { small: true })}
                >
                  <FilePlus2 size={15} aria-hidden="true" />
                  견적 작성
                </Link>
                <DeleteDiagnosis id={d.id} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
