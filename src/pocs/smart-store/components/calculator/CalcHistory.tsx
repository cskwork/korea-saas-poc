import Link from "next/link";
import clsx from "clsx";
import { formatNumber, formatPercent, formatRelative } from "@/core/format";
import { categoryLabel } from "../../domain/categories";
import type { CalculationEntry } from "../../server/data/calculations";
import { EmptyState } from "../ui/EmptyState";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import { ClearHistoryButton, DeleteCalculationButton } from "./HistoryButtons";
import styles from "./calculator.module.css";

function reloadHref(entry: CalculationEntry) {
  return `/smart-store/calculator?${new URLSearchParams({
    label: entry.label,
    category: entry.category,
    cost: String(entry.cost),
    price: String(entry.price),
    shipping: String(entry.shippingCost),
    qty: String(entry.monthlyQuantity),
  })}`;
}

export function CalcHistory({ entries, now }: { entries: CalculationEntry[]; now: Date }) {
  return (
    <Slip
      title="계산 기록"
      titleId="calc-history"
      meta={entries.length ? <ClearHistoryButton count={entries.length} /> : "최근 30건까지 보관"}
      flush
      className={styles.history}
    >
      {entries.length === 0 ? (
        <EmptyState title="남긴 계산이 없어요.">
          위에서 계산한 뒤 &lsquo;계산 기록에 남기기&rsquo;를 누르면 여기에서 비교할 수 있어요.
        </EmptyState>
      ) : (
        <div className={ui.tableWrap}>
          <table className={clsx(ui.table, styles.historyTable)}>
            <thead>
              <tr>
                <th scope="col">메모</th>
                <th scope="col">카테고리</th>
                <th scope="col" className={ui.right}>
                  매입가
                </th>
                <th scope="col" className={ui.right}>
                  판매가
                </th>
                <th scope="col" className={ui.right}>
                  수수료
                </th>
                <th scope="col" className={ui.right}>
                  배송비
                </th>
                <th scope="col" className={ui.right}>
                  남는 돈
                </th>
                <th scope="col" className={ui.right}>
                  마진율
                </th>
                <th scope="col">
                  <span className={ui.visuallyHidden}>관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const loss = entry.margin.profit < 0;
                return (
                  <tr key={entry.id}>
                    <th scope="row" className={styles.historyLabel}>
                      {entry.label}
                      <span className={ui.muted}>{formatRelative(entry.createdAt, now)}</span>
                    </th>
                    <td>{categoryLabel(entry.category)}</td>
                    <td className={ui.right}>{formatNumber(entry.cost)}</td>
                    <td className={ui.right}>{formatNumber(entry.price)}</td>
                    <td className={ui.right}>{formatNumber(entry.margin.fee)}</td>
                    <td className={ui.right}>{formatNumber(entry.shippingCost)}</td>
                    <td className={clsx(ui.right, styles.historyProfit, loss && ui.loss)}>
                      {loss ? "−" : ""}
                      {formatNumber(Math.abs(entry.margin.profit))}
                    </td>
                    <td className={clsx(ui.right, loss && ui.loss)}>{formatPercent(entry.margin.marginRate)}</td>
                    <td>
                      <div className={styles.historyActions}>
                        <Link href={reloadHref(entry)} className={clsx(ui.btn, ui.btnSm)} scroll={false}>
                          불러오기
                        </Link>
                        <DeleteCalculationButton id={entry.id} label={entry.label} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Slip>
  );
}
