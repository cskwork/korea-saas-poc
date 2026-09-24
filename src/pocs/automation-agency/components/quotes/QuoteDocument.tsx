import { formatDate, formatKrw, formatNumber } from "@/core/format";
import { COMPLEXITY_LABEL } from "../../domain/labels";
import { adjustedUnit, amountInKorean } from "../../domain/quote";
import type { AgencyProfile, QuoteDetail } from "../../server/data/quotes";
import { BrandMark } from "../shell/BrandMark";
import styles from "./document.module.css";

const SAMPLE_BUSINESS_NUMBER = "000-00-00000";
const day = (value: string) =>
  formatDate(`${value}T00:00:00+09:00`, { year: "numeric", month: "long", day: "numeric" });

/** The printable 견적서 (A4). Screen and print share this markup. */
export function QuoteDocument({ quote, profile }: { quote: QuoteDetail; profile: AgencyProfile | undefined }) {
  const { totals } = quote;
  return (
    <article className={styles.sheet} aria-labelledby="doc-title">
      <header className={styles.head}>
        <p className={styles.brand}>
          <BrandMark className={styles.mark} />
          {profile?.agencyName ?? "AutoMate Pro"}
        </p>
        <h1 id="doc-title" className={styles.title}>
          견 적 서
        </h1>
        <dl className={styles.meta}>
          <div>
            <dt>견적번호</dt>
            <dd>{quote.number}</dd>
          </div>
          <div>
            <dt>발행일</dt>
            <dd>{day(quote.issuedOn)}</dd>
          </div>
          <div>
            <dt>유효기한</dt>
            <dd>{day(quote.validUntil)}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.parties}>
        <section className={styles.recipient} aria-label="수신">
          <p className={styles.to}>
            <strong>{quote.clientName}</strong> 귀하
          </p>
          {quote.contactName ? <p className={styles.contact}>담당: {quote.contactName}</p> : null}
          <p className={styles.lead}>아래와 같이 견적합니다.</p>
        </section>
        <section aria-label="공급자">
          <table className={styles.supplier}>
            <caption>공급자</caption>
            <tbody>
              <tr>
                <th scope="row">상호</th>
                <td>{profile?.agencyName ?? "AutoMate Pro"}</td>
              </tr>
              <tr>
                <th scope="row">대표자</th>
                <td>{profile?.representative ?? "—"}</td>
              </tr>
              <tr>
                <th scope="row">사업자등록번호</th>
                <td>
                  {profile?.businessNumber || "—"}
                  {profile?.businessNumber === SAMPLE_BUSINESS_NUMBER ? (
                    <span className={styles.sample}> (예시)</span>
                  ) : null}
                </td>
              </tr>
              <tr>
                <th scope="row">연락처</th>
                <td>{[profile?.phone, profile?.email].filter(Boolean).join(" · ") || "—"}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <div className={styles.amounts}>
        <p>
          <span className={styles.amountLabel}>구축비 합계</span>
          <span className={styles.amountWords}>일금 {amountInKorean(totals.setup.total)}원정</span>
          <span className={styles.amountFigure}>({formatKrw(totals.setup.total)}, VAT 포함)</span>
        </p>
        <p>
          <span className={styles.amountLabel}>월 유지보수비</span>
          <span className={styles.amountWords}>일금 {amountInKorean(totals.monthly.total)}원정</span>
          <span className={styles.amountFigure}>({formatKrw(totals.monthly.total)}/월, VAT 포함)</span>
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.items}>
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">항목</th>
              <th scope="col">복잡도</th>
              <th scope="col" className={styles.num}>
                수량
              </th>
              <th scope="col" className={styles.num}>
                구축 단가
              </th>
              <th scope="col" className={styles.num}>
                구축 금액
              </th>
              <th scope="col" className={styles.num}>
                월 단가
              </th>
              <th scope="col" className={styles.num}>
                월 금액
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.lines.map((line, index) => (
              <tr key={`${line.name}-${index}`}>
                <td>{index + 1}</td>
                <td className={styles.itemName}>{line.name}</td>
                <td>{COMPLEXITY_LABEL[line.complexity]}</td>
                <td className={styles.num}>{formatNumber(line.quantity)}</td>
                <td className={styles.num}>{formatNumber(adjustedUnit(line.unitSetupFee, line.complexity))}</td>
                <td className={styles.num}>{formatNumber(line.setupAmount)}</td>
                <td className={styles.num}>{formatNumber(adjustedUnit(line.unitMonthlyFee, line.complexity))}</td>
                <td className={styles.num}>{formatNumber(line.monthlyAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <table className={styles.sums}>
        <thead>
          <tr>
            <th scope="col">구분</th>
            <th scope="col" className={styles.num}>
              공급가액
            </th>
            <th scope="col" className={styles.num}>
              부가세
            </th>
            <th scope="col" className={styles.num}>
              합계
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">구축비 (1회)</th>
            <td className={styles.num}>{formatKrw(totals.setup.supply)}</td>
            <td className={styles.num}>{formatKrw(totals.setup.vat)}</td>
            <td className={styles.num}>{formatKrw(totals.setup.total)}</td>
          </tr>
          <tr>
            <th scope="row">월 유지보수</th>
            <td className={styles.num}>{formatKrw(totals.monthly.supply)}</td>
            <td className={styles.num}>{formatKrw(totals.monthly.vat)}</td>
            <td className={styles.num}>{formatKrw(totals.monthly.total)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              첫해 총액 (구축비 + 월 유지보수 12개월, VAT 포함)
            </th>
            <td className={styles.num}>{formatKrw(totals.firstYearTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <footer className={styles.foot}>
        {quote.notes ? (
          <div className={styles.notes}>
            <h2>비고</h2>
            <p>{quote.notes}</p>
          </div>
        ) : null}
        <ul className={styles.terms}>
          <li>본 견적서는 발행일로부터 {quote.validDays}일간 유효합니다.</li>
          <li>월 유지보수비는 운영 시작일부터 매월 청구되며, 모니터링·오류 대응·경미한 수정을 포함합니다.</li>
          <li>복잡도 단가: 단순 0.7배 · 보통 1배 · 복잡 1.5배.</li>
        </ul>
      </footer>
    </article>
  );
}
