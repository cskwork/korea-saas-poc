import clsx from "clsx";
import { formatNumber, formatWon } from "@/core/format";
import { longDay, shortDay, type DateKey } from "../../domain/dates";
import { LINE_UNIT_LABEL } from "../../domain/labels";
import { lineAmount, wonInWords, type DocumentTotals, type LineItem, type TaxMode } from "../../domain/money";
import theme from "../theme.module.css";
import styles from "./PaperSheet.module.css";

export interface SheetSupplier {
  displayName: string;
  businessName: string;
  businessNumber: string | null;
  email: string;
  phone: string;
  bankAccount: string;
}

export interface SheetDocument {
  kind: "estimate" | "invoice";
  number: string | null;
  title: string;
  issuedOn: DateKey;
  deadline: DateKey;
  clientName: string | null;
  clientCompany: string | null;
  lines: LineItem[];
  taxMode: TaxMode;
  totals: DocumentTotals;
  notes: string;
  paidOn?: DateKey | null;
}

const spaced = (text: string) => text.split("").join(" ");

/**
 * The document the client receives: a Korean 견적서 / 인보이스 on white paper, with 공급자·수신,
 * the amount in words, line items and the real tax outcome (3.3% 원천징수 or 10% 부가세).
 */
export function PaperSheet({ doc, supplier, className }: { doc: SheetDocument; supplier: SheetSupplier; className?: string }) {
  const { totals } = doc;
  const heading = doc.kind === "estimate" ? "견적서" : "청구서";
  const recipient = doc.clientCompany || doc.clientName;
  return (
    <article className={clsx(theme.sheetTokens, styles.sheet, className)} aria-label={`${heading} 미리보기`}>
      {doc.paidOn ? (
        <div className={styles.seal} aria-label={`입금완료 ${longDay(doc.paidOn)}`}>
          <span>입금완료</span>
          <span className={styles.sealDate}>{shortDay(doc.paidOn)}</span>
        </div>
      ) : null}
      <header className={styles.head}>
        <h2 className={styles.heading}>{spaced(heading)}</h2>
        <dl className={styles.docMeta}>
          <div>
            <dt>번호</dt>
            <dd className={styles.measure}>{doc.number ?? "저장하면 매겨져요"}</dd>
          </div>
          <div>
            <dt>발행일</dt>
            <dd>{longDay(doc.issuedOn)}</dd>
          </div>
          <div>
            <dt>{doc.kind === "estimate" ? "유효기간" : "입금 기한"}</dt>
            <dd>{longDay(doc.deadline)}</dd>
          </div>
        </dl>
      </header>

      <p className={styles.subject}>
        <span>건명</span>
        {doc.title || "제목을 입력하세요"}
      </p>

      <div className={styles.parties}>
        <section className={styles.party}>
          <h3>수신</h3>
          <p className={styles.partyName}>{recipient ? `${recipient} 귀하` : "고객을 선택하세요"}</p>
          {doc.clientCompany && doc.clientName ? <p>담당 {doc.clientName}</p> : null}
        </section>
        <section className={styles.party}>
          <h3>공급자</h3>
          <dl className={styles.supplier}>
            <div>
              <dt>상호</dt>
              <dd>{supplier.businessName || supplier.displayName}</dd>
            </div>
            <div>
              <dt>성명</dt>
              <dd>{supplier.displayName}</dd>
            </div>
            <div>
              <dt>사업자</dt>
              <dd>{supplier.businessNumber ?? "미등록 (사업소득)"}</dd>
            </div>
            {supplier.phone || supplier.email ? (
              <div>
                <dt>연락처</dt>
                <dd>{[supplier.phone, supplier.email].filter(Boolean).join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <p className={styles.amount}>
        <span className={styles.amountLabel}>{doc.kind === "estimate" ? "견적 금액" : "청구 금액"}</span>
        <span className={styles.amountWords}>일금 {wonInWords(totals.billed)}원정</span>
        <span className={styles.amountFigure}>(₩{formatNumber(totals.billed)})</span>
        <span className={styles.amountNote}>
          {doc.taxMode === "vat" ? "부가세 포함" : doc.taxMode === "withholding" ? "원천징수 전 금액" : "세금 없음"}
        </span>
      </p>

      <table className={styles.items}>
        <thead>
          <tr>
            <th scope="col" className={styles.no}>
              No
            </th>
            <th scope="col">항목</th>
            <th scope="col" className={styles.qty}>
              수량
            </th>
            <th scope="col" className={styles.price}>
              단가
            </th>
            <th scope="col" className={styles.money}>
              금액
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.lines.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.emptyLine}>
                항목을 추가하면 여기에 나타나요
              </td>
            </tr>
          ) : (
            doc.lines.map((line, index) => (
              <tr key={index}>
                <td className={styles.no}>{index + 1}</td>
                <td>
                  {line.title || "이름 없는 항목"}
                  <span className={styles.lineCalc}>
                    {formatNumber(line.quantity, 2)}
                    {LINE_UNIT_LABEL[line.unit]} × {formatWon(line.unitPrice)}
                  </span>
                </td>
                <td className={styles.qty}>
                  {formatNumber(line.quantity, 2)}
                  {LINE_UNIT_LABEL[line.unit]}
                </td>
                <td className={styles.price}>{formatNumber(line.unitPrice)}</td>
                <td className={styles.money}>{formatNumber(lineAmount(line))}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <dl className={styles.totals}>
        <div>
          <dt>소계</dt>
          <dd>{formatNumber(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 ? (
          <div>
            <dt>할인</dt>
            <dd>−{formatNumber(totals.discount)}</dd>
          </div>
        ) : null}
        <div>
          <dt>공급가액</dt>
          <dd>{formatNumber(totals.supply)}</dd>
        </div>
        {doc.taxMode === "vat" ? (
          <div>
            <dt>부가세 10%</dt>
            <dd>{formatNumber(totals.vat)}</dd>
          </div>
        ) : null}
        <div className={styles.grand}>
          <dt>청구 합계</dt>
          <dd>₩{formatNumber(totals.billed)}</dd>
        </div>
        {doc.taxMode === "withholding" ? (
          <>
            <div className={styles.minor}>
              <dt>원천징수 3.3% (소득세 {formatNumber(totals.incomeTax)} · 지방소득세 {formatNumber(totals.localTax)})</dt>
              <dd>−{formatNumber(totals.withholding)}</dd>
            </div>
            <div className={styles.net}>
              <dt>실입금액</dt>
              <dd>₩{formatNumber(totals.payout)}</dd>
            </div>
          </>
        ) : null}
        {totals.hours > 0 ? (
          <div className={styles.minor}>
            <dt>시간 항목 합계</dt>
            <dd>{formatNumber(totals.hours, 2)}시간</dd>
          </div>
        ) : null}
      </dl>

      <footer className={styles.foot}>
        {doc.notes ? (
          <p>
            <strong>비고</strong> {doc.notes}
          </p>
        ) : null}
        {doc.kind === "invoice" && supplier.bankAccount ? (
          <p>
            <strong>입금 계좌</strong> {supplier.bankAccount}
          </p>
        ) : null}
        {doc.kind === "estimate" ? <p>본 견적서는 {longDay(doc.deadline)}까지 유효합니다.</p> : null}
        {doc.taxMode === "withholding" ? <p>사업소득 3.3%를 원천징수한 뒤 실입금액을 보내 주세요.</p> : null}
        <p className={styles.madeWith}>DevFlow 데모 작업공간에서 작성한 문서</p>
      </footer>
    </article>
  );
}
