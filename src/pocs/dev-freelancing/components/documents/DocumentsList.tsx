import { FilePlus2, ReceiptText } from "lucide-react";
import Link from "next/link";
import { formatWon } from "@/core/format";
import { dDay, shortDay } from "../../domain/dates";
import { ESTIMATE_STATUSES, INVOICE_STATUSES, isEstimateExpired, overdueDays, type EstimateStatus, type InvoiceStatus } from "../../domain/documents";
import { ESTIMATE_STATUS_LABEL, INVOICE_STATUS_LABEL, TAX_MODE_LABEL } from "../../domain/labels";
import type { EstimateSummary, InvoiceSummary } from "../../server/data/documents-read";
import { buttonClass } from "../ui/button";
import { StateLabel } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { Segments } from "../ui/Segments";
import ui from "../ui/ui.module.css";
import styles from "./DocumentsList.module.css";
import { estimateCell, invoiceCell } from "./status";

const BASE = "/dev-freelancing/documents";

export function DocumentsList({
  tab,
  status,
  estimates,
  invoices,
  today,
}: {
  tab: "estimates" | "invoices";
  status: string;
  estimates: EstimateSummary[];
  invoices: InvoiceSummary[];
  today: string;
}) {
  const unpaid = invoices.filter((i) => i.status !== "paid");
  const owed = unpaid.reduce((sum, i) => sum + i.totals.payout, 0);
  const waiting = estimates.filter((e) => e.status === "sent").length;

  const tabHref = (next: string) => (next === "estimates" ? BASE : `${BASE}?tab=${next}`);
  const statusHref = (value: string) => {
    const params = new URLSearchParams();
    if (tab === "invoices") params.set("tab", "invoices");
    if (value) params.set("status", value);
    const query = params.toString();
    return query ? `${BASE}?${query}` : BASE;
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="견적 · 청구"
        description={`답을 기다리는 견적 ${waiting}건 · 받을 돈 ${formatWon(owed)} (${unpaid.length}건)`}
        actions={
          <>
            <Link href="/dev-freelancing/invoices/new" className={buttonClass("secondary")}>
              <ReceiptText size={15} aria-hidden="true" />새 인보이스
            </Link>
            <Link href="/dev-freelancing/estimates/new" className={buttonClass("primary")}>
              <FilePlus2 size={15} aria-hidden="true" />새 견적서
            </Link>
          </>
        }
      />
      <div className={styles.filters}>
        <Segments
          label="문서 종류"
          items={[
            { href: tabHref("estimates"), label: "견적서", count: estimates.length, current: tab === "estimates" },
            { href: tabHref("invoices"), label: "인보이스", count: invoices.length, current: tab === "invoices" },
          ]}
        />
        <Segments
          label="상태"
          items={[
            { href: statusHref(""), label: "전체", current: status === "" },
            ...(tab === "estimates" ? ESTIMATE_STATUSES : INVOICE_STATUSES).map((value) => ({
              href: statusHref(value),
              label: tab === "estimates" ? ESTIMATE_STATUS_LABEL[value as EstimateStatus] : INVOICE_STATUS_LABEL[value as InvoiceStatus],
              count: (tab === "estimates" ? estimates : invoices).filter((doc) => doc.status === value).length,
              current: status === value,
            })),
          ]}
        />
      </div>
      {tab === "estimates" ? <EstimateTable estimates={estimates.filter((e) => !status || e.status === status)} today={today} /> : null}
      {tab === "invoices" ? <InvoiceTable invoices={invoices.filter((i) => !status || i.status === status)} today={today} /> : null}
    </div>
  );
}

function EstimateTable({ estimates, today }: { estimates: EstimateSummary[]; today: string }) {
  if (estimates.length === 0) {
    return (
      <EmptyState title="이 상태의 견적서가 없어요" action={<Link href="/dev-freelancing/estimates/new" className={buttonClass("secondary", { small: true })}>새 견적서</Link>}>
        견적서는 작성 중 → 발송됨 → 수락됨 → 청구됨 순서로 흘러가요.
      </EmptyState>
    );
  }
  return (
    <div className={ui.tableWrap}>
      <table className={ui.table}>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">건명 · 고객</th>
            <th scope="col" className={ui.num}>
              견적 금액
            </th>
            <th scope="col">상태</th>
            <th scope="col">발행 · 유효</th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => {
            const expired = isEstimateExpired(estimate, today);
            return (
              <tr key={estimate.id}>
                <td className={`${ui.measure} ${ui.muted}`}>{estimate.number}</td>
                <td>
                  <Link href={`/dev-freelancing/estimates/${estimate.id}`} className={ui.rowLink}>
                    {estimate.title}
                  </Link>
                  <p className={ui.muted}>{estimate.clientCompany || estimate.clientName || "고객 미지정"}</p>
                </td>
                <td className={ui.num}>
                  {formatWon(estimate.totals.billed)}
                  <p className={ui.muted}>{TAX_MODE_LABEL[estimate.taxMode]}</p>
                </td>
                <td>
                  <StateLabel state={estimateCell(estimate.status, expired)}>{ESTIMATE_STATUS_LABEL[estimate.status]}</StateLabel>
                  {expired ? <p className={styles.late}>유효기간 지남</p> : null}
                </td>
                <td className={ui.muted}>
                  {shortDay(estimate.issuedOn)} · {estimate.status === "sent" ? dDay(estimate.validUntil, today) : shortDay(estimate.validUntil)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceTable({ invoices, today }: { invoices: InvoiceSummary[]; today: string }) {
  if (invoices.length === 0) {
    return (
      <EmptyState title="이 상태의 인보이스가 없어요" action={<Link href="/dev-freelancing/invoices/new" className={buttonClass("secondary", { small: true })}>새 인보이스</Link>}>
        수락된 견적서에서 전액·착수금·잔금으로 인보이스를 만들 수 있어요.
      </EmptyState>
    );
  }
  return (
    <div className={ui.tableWrap}>
      <table className={ui.table}>
        <thead>
          <tr>
            <th scope="col">번호</th>
            <th scope="col">건명 · 고객</th>
            <th scope="col" className={ui.num}>
              청구 합계
            </th>
            <th scope="col" className={ui.num}>
              실입금
            </th>
            <th scope="col">상태</th>
            <th scope="col">기한 · 입금</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const overdue = overdueDays(invoice, today);
            return (
              <tr key={invoice.id}>
                <td className={`${ui.measure} ${ui.muted}`}>{invoice.number}</td>
                <td>
                  <Link href={`/dev-freelancing/invoices/${invoice.id}`} className={ui.rowLink}>
                    {invoice.title}
                  </Link>
                  <p className={ui.muted}>{invoice.clientCompany || invoice.clientName || "고객 미지정"}</p>
                </td>
                <td className={ui.num}>{formatWon(invoice.totals.billed)}</td>
                <td className={ui.num}>{formatWon(invoice.totals.payout)}</td>
                <td>
                  <StateLabel state={invoiceCell(invoice.status, overdue)}>{INVOICE_STATUS_LABEL[invoice.status]}</StateLabel>
                  {overdue > 0 ? <p className={styles.late}>기한 {overdue}일 지남</p> : null}
                </td>
                <td className={ui.muted}>{invoice.paidOn ? `${shortDay(invoice.paidOn)} 입금` : `${shortDay(invoice.dueOn)} · ${dDay(invoice.dueOn, today)}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
