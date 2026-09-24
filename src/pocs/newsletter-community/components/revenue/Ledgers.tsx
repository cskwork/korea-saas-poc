import { formatNumber } from "@/core/format";
import type { MembershipSaleRow, SponsorshipRow } from "../../server/store/revenue";
import { shortDate, won } from "../format";
import { EmptyState } from "../ui/EmptyState";
import { SectionHead } from "../ui/SectionHead";
import ui from "../ui/ui.module.css";
import {
  AddMembershipSaleForm,
  AddSponsorshipForm,
  DeleteMembershipSaleButton,
  DeleteSponsorshipButton,
  SponsorshipStatusSelect,
} from "./LedgerForms";
import styles from "./revenue.module.css";

export function SponsorshipLedger({ deals }: { deals: SponsorshipRow[] }) {
  return (
    <section className={styles.ledger} id="sponsorships" aria-labelledby="sponsorships-title">
      <SectionHead id="sponsorships-title" title="광고 계약" aside={`${formatNumber(deals.length)}건`} />
      <AddSponsorshipForm />
      {deals.length === 0 ? (
        <EmptyState title="적힌 광고 계약이 없어요">
          광고주와 금액, 게재일을 적어 두면 편집기에서 호에 광고를 싣고 월별 수입에 더해져요. 협의 중인 계약은 수입에 넣지 않아요.
        </EmptyState>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={ui.srOnly}>광고 계약 장부</caption>
            <thead>
              <tr>
                <th scope="col">게재일</th>
                <th scope="col">광고주 · 문구</th>
                <th scope="col">실린 호</th>
                <th scope="col" className={styles.num}>
                  금액
                </th>
                <th scope="col">상태</th>
                <th scope="col">
                  <span className={ui.srOnly}>지우기</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td className={styles.date}>{shortDate(deal.runOn)}</td>
                  <th scope="row" className={styles.sponsor}>
                    {deal.sponsorName}
                    <span>{deal.message}</span>
                  </th>
                  <td>
                    {deal.issueNumber
                      ? `제${deal.issueNumber}호`
                      : deal.issueId
                        ? "발행 전 호"
                        : "미정"}
                  </td>
                  <td className={styles.num}>{won(deal.amount)}</td>
                  <td>
                    <SponsorshipStatusSelect id={deal.id} status={deal.status} sponsor={deal.sponsorName} />
                  </td>
                  <td className={styles.rowAction}>
                    <DeleteSponsorshipButton id={deal.id} sponsor={deal.sponsorName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function MembershipLedger({ sales }: { sales: MembershipSaleRow[] }) {
  return (
    <section className={styles.ledger} id="memberships" aria-labelledby="memberships-title">
      <SectionHead id="memberships-title" title="멤버십 매출" aside={`${formatNumber(sales.length)}건`} />
      <AddMembershipSaleForm />
      {sales.length === 0 ? (
        <EmptyState title="멤버십 매출이 없어요">오프라인 모임 참가비나 후원 멤버십처럼 구독료 밖의 매출을 적어 두세요.</EmptyState>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={ui.srOnly}>멤버십 매출 장부</caption>
            <thead>
              <tr>
                <th scope="col">날짜</th>
                <th scope="col">항목</th>
                <th scope="col">구매자</th>
                <th scope="col" className={styles.num}>
                  금액
                </th>
                <th scope="col">
                  <span className={ui.srOnly}>지우기</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className={styles.date}>{shortDate(sale.soldOn)}</td>
                  <th scope="row">{sale.item}</th>
                  <td>{sale.buyerName}</td>
                  <td className={styles.num}>{won(sale.amount)}</td>
                  <td className={styles.rowAction}>
                    <DeleteMembershipSaleButton id={sale.id} item={sale.item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function RevenueLedgers({ deals, sales }: { deals: SponsorshipRow[]; sales: MembershipSaleRow[] }) {
  return (
    <div className={styles.ledgers}>
      <SponsorshipLedger deals={deals} />
      <MembershipLedger sales={sales} />
    </div>
  );
}
