import Link from "next/link";
import { formatWon } from "@/core/format";
import { isEstimateExpired, overdueDays } from "../../domain/documents";
import { ESTIMATE_STATUS_LABEL, INVOICE_STATUS_LABEL } from "../../domain/labels";
import type { EstimateSummary, InvoiceSummary } from "../../server/data/documents-read";
import { StateLabel } from "../ui/Cells";
import ui from "../ui/ui.module.css";
import { estimateCell, invoiceCell } from "./status";

/** A compact list of the documents tied to a project or a client. */
export function DocumentRows({ estimates, invoices, today }: { estimates: EstimateSummary[]; invoices: InvoiceSummary[]; today: string }) {
  const rows = [
    ...estimates.map((e) => ({
      key: `e-${e.id}`,
      href: `/dev-freelancing/estimates/${e.id}`,
      kind: "견적서",
      number: e.number,
      title: e.title,
      amount: e.totals.billed,
      day: e.issuedOn,
      status: <StateLabel state={estimateCell(e.status, isEstimateExpired(e, today))}>{ESTIMATE_STATUS_LABEL[e.status]}</StateLabel>,
    })),
    ...invoices.map((i) => {
      const overdue = overdueDays(i, today);
      return {
        key: `i-${i.id}`,
        href: `/dev-freelancing/invoices/${i.id}`,
        kind: "인보이스",
        number: i.number,
        title: i.title,
        amount: i.totals.billed,
        day: i.issuedOn,
        status: (
          <StateLabel state={invoiceCell(i.status, overdue)}>
            {INVOICE_STATUS_LABEL[i.status]}
            {overdue > 0 ? ` · ${overdue}일 지남` : ""}
          </StateLabel>
        ),
      };
    }),
  ].sort((a, b) => b.day.localeCompare(a.day));

  return (
    <div className={ui.tableWrap}>
      <table className={ui.table}>
        <thead>
          <tr>
            <th scope="col">문서</th>
            <th scope="col">제목</th>
            <th scope="col" className={ui.num}>
              청구액
            </th>
            <th scope="col">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>
                <span className={ui.muted}>{row.kind}</span>
                <br />
                <span className={`${ui.measure} ${ui.muted}`}>{row.number}</span>
              </td>
              <td>
                <Link href={row.href} className={ui.rowLink}>
                  {row.title}
                </Link>
              </td>
              <td className={ui.num}>{formatWon(row.amount)}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
