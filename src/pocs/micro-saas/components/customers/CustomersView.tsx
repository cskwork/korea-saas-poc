import Link from "next/link";
import { formatWon } from "@/core/format";
import type { getCustomerDetail, getCustomers } from "../../server/queries";
import type { CustomerSort } from "../../server/store/customers";
import { STATUS_LABEL } from "../../domain/status";
import { formatDayLabel, formatMinute, relativeDayLabel } from "../../domain/time";
import { EmptyState } from "../world/EmptyState";
import { Icon } from "../world/Icon";
import { Mark } from "../world/Stamp";
import ui from "../world/ui.module.css";
import { CustomerActions } from "./CustomerActions";
import { CustomerForm } from "./CustomerForm";
import { CustomerSearch } from "./CustomerSearch";
import styles from "./customers.module.css";

type ListData = Awaited<ReturnType<typeof getCustomers>>;
type DetailData = Awaited<ReturnType<typeof getCustomerDetail>>;

/** The customer card file: search and list on the left, one customer's record on the right. */
export function CustomersView({
  list,
  query,
  sort,
  detail,
}: {
  list: ListData;
  query: string;
  sort: CustomerSort;
  detail?: DetailData;
}) {
  const keep = new URLSearchParams({ ...(query ? { q: query } : {}), ...(sort !== "visits" ? { sort } : {}) }).toString();
  const count = query ? `${list.rows.length}명` : `전체 ${list.total}명`;

  return (
    <div className={`${styles.grid}${detail ? ` ${styles.hasDetail}` : ""}`}>
      <section className={`${ui.sheet} ${styles.listSheet}`} aria-label="고객 목록">
        <CustomerSearch query={query} sort={sort} count={count} />
        {list.rows.length === 0 ? (
          query ? (
            <p className={ui.emptyLine}>‘{query}’에 맞는 고객이 없어요. 이름 일부나 연락처 숫자로 찾아 보세요.</p>
          ) : (
            <EmptyState title="아직 고객이 없어요" action={null}>
              예약을 적거나 손님이 예약 페이지에서 예약하면 고객이 자동으로 등록돼요.
            </EmptyState>
          )
        ) : (
          <ul className={styles.list}>
            {list.rows.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/micro-saas/customers/${c.id}${keep ? `?${keep}` : ""}`}
                  className={styles.customer}
                  aria-current={detail?.customer.id === c.id ? "true" : undefined}
                  scroll={false}
                >
                  <span className={styles.mark} aria-hidden="true">
                    {c.name.charAt(0)}
                  </span>
                  <span className={styles.main}>
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.phone}>{c.phone}</span>
                  </span>
                  <span className={styles.side}>
                    <span className={styles.visits}>{c.visits}회 방문</span>
                    <span className={styles.last}>
                      {c.nextVisit
                        ? `다음 ${relativeDayLabel(c.nextVisit, list.clock.date)}`
                        : c.lastVisit
                          ? `최근 ${formatDayLabel(c.lastVisit)}`
                          : "방문 전"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <details className={styles.register}>
          <summary className={`${ui.btn} ${ui.line} ${ui.block}`}>
            <Icon name="plus" />
            <span>고객 직접 등록</span>
          </summary>
          <div className={styles.registerBody}>
            <CustomerForm />
          </div>
        </details>
      </section>

      {detail ? (
        <CustomerDetail detail={detail} backHref={`/micro-saas/customers${keep ? `?${keep}` : ""}`} />
      ) : (
        <section className={`${ui.sheet} ${styles.placeholder}`} aria-label="고객 상세">
          <p className={ui.emptyLine}>목록에서 고객을 고르면 방문 기록과 메모가 여기에 펼쳐져요.</p>
        </section>
      )}
    </div>
  );
}

function CustomerDetail({ detail, backHref }: { detail: DetailData; backHref: string }) {
  const { customer, history, summary, clock } = detail;
  const record = { id: customer.id, name: customer.name, phone: customer.phone, memo: customer.memo };
  return (
    <section className={`${ui.sheet} ${styles.detail}`} aria-labelledby="customer-name">
      <div className={ui.sheetHead}>
        <h2 id="customer-name">{customer.name}</h2>
        <Link href={backHref} className={ui.iconBtn} aria-label="고객 상세 닫기" scroll={false}>
          <Icon name="x" />
        </Link>
      </div>
      <dl className={ui.formRows}>
        <div>
          <dt>연락처</dt>
          <dd>
            <a href={`tel:${customer.phone.replaceAll("-", "")}`}>{customer.phone}</a>
          </dd>
        </div>
        <div>
          <dt>총 방문</dt>
          <dd>
            {summary.visits}회 · 누적 {formatWon(summary.spent)}
          </dd>
        </div>
        <div>
          <dt>마지막 방문</dt>
          <dd>{summary.lastVisit ? formatDayLabel(summary.lastVisit) : "아직 없음"}</dd>
        </div>
        <div>
          <dt>다음 예약</dt>
          <dd>
            {summary.next
              ? `${relativeDayLabel(summary.next.date, clock.date)} ${formatMinute(summary.next.startMinute)}`
              : "없음"}
          </dd>
        </div>
        <div>
          <dt>취소</dt>
          <dd>{summary.cancellations}회</dd>
        </div>
        <div>
          <dt>메모</dt>
          <dd className={styles.memo}>{customer.memo || <span className={styles.muted}>없음</span>}</dd>
        </div>
      </dl>

      <CustomerActions customer={record} bookings={history.length} />

      <h3 className={ui.subHead}>방문 기록</h3>
      {history.length === 0 ? (
        <p className={ui.emptyLine}>아직 예약 기록이 없어요.</p>
      ) : (
        <ol className={styles.history}>
          {history.slice(0, 30).map((b) => (
            <li key={b.id} className={b.status === "cancelled" ? styles.void : undefined}>
              <Link href={`/micro-saas/bookings/${b.id}`} className={styles.hService}>
                {b.serviceName}
              </Link>
              <span className={styles.hDate}>
                {formatDayLabel(b.date)} {formatMinute(b.startMinute)}
              </span>
              <span className={styles.hStatus}>
                <Mark status={b.status} />
                {STATUS_LABEL[b.status]}
              </span>
            </li>
          ))}
        </ol>
      )}
      {history.length > 30 ? <p className={styles.more}>최근 30건만 보여요. 전체 {history.length}건.</p> : null}

      <details className={styles.register}>
        <summary className={`${ui.btn} ${ui.line} ${ui.block}`}>
          <Icon name="pencil" />
          <span>정보 고치기</span>
        </summary>
        <div className={styles.registerBody}>
          <CustomerForm key={`${record.name}|${record.phone}|${record.memo}`} customer={record} />
        </div>
      </details>
    </section>
  );
}
