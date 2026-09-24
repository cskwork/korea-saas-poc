import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatWon } from "@/core/format";
import { dDay, longDay } from "../../domain/dates";
import { availableShares, isEstimateExpired, overdueDays } from "../../domain/documents";
import { ESTIMATE_STATUS_LABEL, INVOICE_STATUS_LABEL, TAX_MODE_LABEL } from "../../domain/labels";
import type { EstimateSummary, InvoiceSummary } from "../../server/data/documents-read";
import type { Profile } from "../../server/data/profile";
import { StateLabel } from "../ui/Cells";
import ui from "../ui/ui.module.css";
import { EstimateActions, InvoiceActions } from "./DocumentActions";
import styles from "./DocumentView.module.css";
import { PaperSheet } from "./PaperSheet";
import { estimateCell, invoiceCell } from "./status";

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className={styles.facts}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EstimateView({
  estimate,
  profile,
  invoices,
  today,
}: {
  estimate: EstimateSummary;
  profile: Profile;
  invoices: InvoiceSummary[];
  today: string;
}) {
  const expired = isEstimateExpired(estimate, today);
  const shares = availableShares(estimate.totals.supply, estimate.invoicedSupply);
  return (
    <div className={styles.page}>
      <div className={styles.side}>
        <Link href="/dev-freelancing/documents" className={ui.textLink}>
          <ArrowLeft size={14} aria-hidden="true" /> 견적 · 청구
        </Link>
        <div className={styles.sideHead}>
          <h1 className={styles.title}>{estimate.title}</h1>
          <p className={styles.sub}>
            <span className={ui.measure}>{estimate.number}</span>
          </p>
          <StateLabel state={estimateCell(estimate.status, expired)}>
            {ESTIMATE_STATUS_LABEL[estimate.status]}
            {expired ? " · 유효기간 지남" : ""}
          </StateLabel>
        </div>
        <Facts
          rows={[
            ["고객", estimate.clientId ? <Link href={`/dev-freelancing/clients/${estimate.clientId}`}>{estimate.clientCompany || estimate.clientName}</Link> : "미지정"],
            ["프로젝트", estimate.projectId ? <Link href={`/dev-freelancing/projects/${estimate.projectId}`}>{estimate.projectTitle}</Link> : "연결 안 됨"],
            ["세금", TAX_MODE_LABEL[estimate.taxMode]],
            ["청구 합계", formatWon(estimate.totals.billed)],
            ["유효기간", `${longDay(estimate.validUntil)} · ${dDay(estimate.validUntil, today)}`],
          ]}
        />
        <EstimateActions
          id={estimate.id}
          status={estimate.status}
          hasProject={Boolean(estimate.projectId)}
          shares={shares}
          supply={estimate.totals.supply}
          invoicedSupply={estimate.invoicedSupply}
        />
        {invoices.length > 0 ? (
          <section className={styles.linked} aria-labelledby="linked-invoices">
            <h2 id="linked-invoices" className={styles.linkedTitle}>
              이 견적으로 만든 인보이스
            </h2>
            <ul role="list">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link href={`/dev-freelancing/invoices/${invoice.id}`} className={ui.rowLink}>
                    {invoice.number}
                  </Link>
                  <StateLabel state={invoiceCell(invoice.status, overdueDays(invoice, today))}>{INVOICE_STATUS_LABEL[invoice.status]}</StateLabel>
                  <span className={ui.num}>{formatWon(invoice.totals.billed)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <PaperSheet
        className={styles.sheet}
        supplier={profile}
        doc={{
          kind: "estimate",
          number: estimate.number,
          title: estimate.title,
          issuedOn: estimate.issuedOn,
          deadline: estimate.validUntil,
          clientName: estimate.clientName,
          clientCompany: estimate.clientCompany,
          lines: estimate.lines,
          taxMode: estimate.taxMode,
          totals: estimate.totals,
          notes: estimate.notes,
        }}
      />
    </div>
  );
}

export function InvoiceView({
  invoice,
  profile,
  estimate,
  today,
}: {
  invoice: InvoiceSummary;
  profile: Profile;
  estimate: { id: string; number: string } | null;
  today: string;
}) {
  const overdue = overdueDays(invoice, today);
  return (
    <div className={styles.page}>
      <div className={styles.side}>
        <Link href="/dev-freelancing/documents?tab=invoices" className={ui.textLink}>
          <ArrowLeft size={14} aria-hidden="true" /> 견적 · 청구
        </Link>
        <div className={styles.sideHead}>
          <h1 className={styles.title}>{invoice.title}</h1>
          <p className={styles.sub}>
            <span className={ui.measure}>{invoice.number}</span>
          </p>
          <StateLabel state={invoiceCell(invoice.status, overdue)}>
            {INVOICE_STATUS_LABEL[invoice.status]}
            {overdue > 0 ? ` · 기한 ${overdue}일 지남` : ""}
          </StateLabel>
        </div>
        <Facts
          rows={[
            ["고객", invoice.clientId ? <Link href={`/dev-freelancing/clients/${invoice.clientId}`}>{invoice.clientCompany || invoice.clientName}</Link> : "미지정"],
            ["프로젝트", invoice.projectId ? <Link href={`/dev-freelancing/projects/${invoice.projectId}`}>{invoice.projectTitle}</Link> : "연결 안 됨"],
            ["견적서", estimate ? <Link href={`/dev-freelancing/estimates/${estimate.id}`}>{estimate.number}</Link> : "없음"],
            ["세금", TAX_MODE_LABEL[invoice.taxMode]],
            ["청구 합계", formatWon(invoice.totals.billed)],
            ["실입금", formatWon(invoice.totals.payout)],
            [invoice.paidOn ? "입금일" : "입금 기한", invoice.paidOn ? longDay(invoice.paidOn) : `${longDay(invoice.dueOn)} · ${dDay(invoice.dueOn, today)}`],
          ]}
        />
        <InvoiceActions id={invoice.id} status={invoice.status} today={today} />
      </div>
      <PaperSheet
        className={styles.sheet}
        supplier={profile}
        doc={{
          kind: "invoice",
          number: invoice.number,
          title: invoice.title,
          issuedOn: invoice.issuedOn,
          deadline: invoice.dueOn,
          clientName: invoice.clientName,
          clientCompany: invoice.clientCompany,
          lines: invoice.lines,
          taxMode: invoice.taxMode,
          totals: invoice.totals,
          notes: invoice.notes,
          paidOn: invoice.paidOn,
        }}
      />
    </div>
  );
}
