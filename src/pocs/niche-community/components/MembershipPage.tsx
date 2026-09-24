import { Check, Minus } from "lucide-react";
import { formatDate, formatWon } from "@/core/format";
import { FREE_DAILY_POST_LIMIT, PREMIUM_PRICE_WON } from "../domain/rules";
import { changeTierAction, switchPersonaAction } from "../server/actions";
import type { getMembershipPage } from "../server/queries";
import { ActionButton, ConfirmButton } from "./ActionButtons";
import styles from "./membership.module.css";
import ui from "./ui.module.css";

type MembershipData = Awaited<ReturnType<typeof getMembershipPage>>;

type Cell = boolean | string;
const FEATURES: { label: string; free: Cell; premium: Cell }[] = [
  { label: "열린 채널 4곳 읽기·쓰기", free: true, premium: true },
  { label: "하루에 쓸 수 있는 글", free: `${FREE_DAILY_POST_LIMIT}개`, premium: "제한 없음" },
  { label: "댓글과 좋아요", free: true, premium: true },
  { label: "공개 모임 (데모데이, 모각작)", free: true, premium: true },
  { label: "대외비 채널: 투자·펀딩, 멘토링", free: false, premium: true },
  { label: "대외비 글 읽기와 발행", free: false, premium: true },
  { label: "멤버 전용 모임 (투자 유치 오피스아워)", free: false, premium: true },
  { label: "프리미엄 뱃지", free: false, premium: true },
];

function Mark({ value }: { value: Cell }) {
  if (typeof value === "string") return <span className={styles.cellText}>{value}</span>;
  return value ? (
    <Check size={18} className={styles.yes} aria-label="포함" />
  ) : (
    <Minus size={18} className={styles.no} aria-label="없음" />
  );
}

/** The business-model slide: one table, two plans, and the acting member's own billing record. */
export function MembershipPage({ data }: { data: MembershipData }) {
  const { viewer, membership, personas } = data;
  const operator = viewer.role === "operator";
  const premium = !operator && viewer.tier === "premium";
  const period = membership?.period ?? null;
  const freeSample = personas.find((person) => person.role === "member" && person.tier === "free");
  const premiumSample = personas.find((person) => person.role === "member" && person.tier === "premium");

  return (
    <div className={`${ui.page} ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={ui.pageTitle}>월 {formatWon(PREMIUM_PRICE_WON)}이면 대외비 채널과 멤버 전용 모임이 열립니다</h1>
        <p className={ui.pageLead}>
          무료로 열린 채널을 읽고 쓰다가, 투자와 멘토링 이야기가 필요해질 때 프리미엄으로 바꾸세요. 언제든 무료로 돌아갈 수 있어요.
        </p>
      </header>

      <section className={`${ui.slide} ${styles.plans}`} aria-label="플랜 비교">
        <table className={styles.table}>
          <caption className={ui.srOnly}>무료 플랜과 프리미엄 플랜 비교</caption>
          <thead>
            <tr>
              <td className={styles.corner} />
              <th scope="col" className={styles.planHead} data-current={!operator && !premium}>
                <span className={styles.planName}>무료</span>
                <span className={styles.price}>
                  0원<span className={styles.per}> / 월</span>
                </span>
                {!operator && !premium ? <span className={`${ui.tag} ${ui.tagInk}`}>지금 플랜</span> : null}
              </th>
              <th scope="col" className={`${styles.planHead} ${styles.premiumHead}`} data-current={premium}>
                <span className={styles.planName}>프리미엄</span>
                <span className={styles.price}>
                  {formatWon(PREMIUM_PRICE_WON)}
                  <span className={styles.per}> / 월</span>
                </span>
                {premium ? <span className={`${ui.tag} ${ui.tagAccent}`}>지금 플랜</span> : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => (
              <tr key={feature.label}>
                <th scope="row" className={styles.feature}>
                  {feature.label}
                </th>
                <td className={styles.cell}>
                  <Mark value={feature.free} />
                </td>
                <td className={`${styles.cell} ${styles.premiumCell}`}>
                  <Mark value={feature.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${ui.slide} ${styles.status}`} aria-labelledby="nc-my-plan">
        <h2 id="nc-my-plan" className={ui.sectionTitle}>
          {operator
            ? "운영자 명찰에는 멤버십이 없어요"
            : premium
              ? `${viewer.nickname} 님은 프리미엄 멤버예요`
              : `${viewer.nickname} 님은 무료 플랜이에요`}
        </h2>
        {operator ? (
          <>
            <p className={styles.statusText}>
              결제와 등급 변경은 멤버 명찰로 바꿔서 체험해 보세요. 운영자는 대시보드에서 전체 매출과 이탈을 봐요.
            </p>
            <div className={styles.actions}>
              {freeSample ? (
                <ActionButton run={switchPersonaAction.bind(null, { memberId: freeSample.id })} pendingLabel="바꾸는 중…">
                  무료 멤버 {freeSample.nickname} 명찰 달기
                </ActionButton>
              ) : null}
              {premiumSample ? (
                <ActionButton run={switchPersonaAction.bind(null, { memberId: premiumSample.id })} pendingLabel="바꾸는 중…">
                  프리미엄 멤버 {premiumSample.nickname} 명찰 달기
                </ActionButton>
              ) : null}
            </div>
          </>
        ) : premium ? (
          <>
            <p className={styles.statusText}>
              {period
                ? `이번 결제 기간은 ${formatDate(period.periodStart)}부터 ${formatDate(period.periodEnd)}까지예요. 다음 결제는 기간이 끝난 다음 날 기록돼요.`
                : "결제 기간 정보를 찾지 못했어요."}{" "}
              무료로 바꾸면 데모에서는 바로 적용되고, 대외비 채널이 다시 잠겨요.
            </p>
            <ConfirmButton
              run={changeTierAction.bind(null, { change: "downgrade" })}
              question="무료 플랜으로 바꿀까요? 대외비 채널과 멤버 전용 모임 신청이 잠겨요. 이미 낸 결제는 환불되지 않아요 (데모)."
              confirmLabel="무료로 바꾸기"
              className={ui.button}
            >
              무료 플랜으로 바꾸기
            </ConfirmButton>
          </>
        ) : (
          <>
            <p className={styles.statusText}>
              프리미엄으로 바꾸면 {formatWon(PREMIUM_PRICE_WON)} 결제 한 건이 기록되고 바로 대외비 채널이 열려요. 데모라 실제로 청구되지
              않아요.
            </p>
            <ConfirmButton
              run={changeTierAction.bind(null, { change: "upgrade" })}
              question={`월 ${formatWon(PREMIUM_PRICE_WON)} 프리미엄을 시작할까요? 결제는 데모 기록으로만 남아요.`}
              confirmLabel="프리미엄 시작"
              className={`${ui.button} ${ui.accent}`}
            >
              프리미엄 시작하기
            </ConfirmButton>
          </>
        )}
      </section>

      {!operator && membership ? (
        <section className={styles.history} aria-labelledby="nc-payments">
          <h2 id="nc-payments" className={ui.sectionTitle}>
            결제 기록 {membership.payments.length}건
          </h2>
          {membership.payments.length ? (
            <table className={styles.ledger}>
              <caption className={ui.srOnly}>{viewer.nickname} 님의 결제 기록</caption>
              <thead>
                <tr>
                  <th scope="col">결제일</th>
                  <th scope="col">이용 기간</th>
                  <th scope="col" className={styles.amount}>
                    금액
                  </th>
                </tr>
              </thead>
              <tbody>
                {membership.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paidAt)}</td>
                    <td>
                      {formatDate(payment.periodStart)} – {formatDate(payment.periodEnd)}
                    </td>
                    <td className={styles.amount}>{formatWon(payment.amountWon)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={ui.status}>아직 결제 기록이 없어요. 프리미엄을 시작하면 여기에 쌓여요.</p>
          )}
          {membership.changes.length ? (
            <p className={styles.changes}>
              등급 변경:{" "}
              {membership.changes
                .map((change) => `${formatDate(change.occurredAt)} ${change.kind === "upgrade" ? "프리미엄 시작" : "무료로 변경"}`)
                .join(" · ")}
            </p>
          ) : null}
          <p className={styles.demoNote}>모든 결제는 데모 기록이에요. 실제 카드나 계좌로 청구되지 않습니다.</p>
        </section>
      ) : null}
    </div>
  );
}
