import type { Metadata } from "next";
import { formatDate } from "@/core/format";
import { InquiryForm } from "@/pocs/ai-content-agency/components/pricing/InquiryForm";
import { WithdrawInquiry } from "@/pocs/ai-content-agency/components/pricing/WithdrawInquiry";
import { PlanPoles } from "@/pocs/ai-content-agency/components/pricing/PlanPoles";
import styles from "@/pocs/ai-content-agency/components/pricing/pricing.module.css";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { PLANS } from "@/pocs/ai-content-agency/domain/plans";
import { getPricing } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "요금제",
  description:
    "스타터 월 29만원, 프로 월 79만원, 엔터프라이즈 맞춤 견적. 한 달에 맡길 의뢰 수와 콘텐츠 유형으로 골라요.",
};

export default async function PricingPage() {
  const { plan, used, history, inquiries, openKinds } = await getPricing();
  const current = PLANS[plan];
  return (
    <>
      <PageHeader
        title="요금제"
        lead="한 달에 맡길 의뢰 수와 콘텐츠 유형으로 골라요. 요금제는 언제든 바꿀 수 있고, 바꾼 기록은 아래에 남아요."
      />
      <p className={styles.usage}>
        <strong>{current.name}</strong>
        <span>
          이번 달 의뢰 {used}건{current.monthlyQuota === null ? " · 건수 제한 없음" : ` / ${current.monthlyQuota}건`}
        </span>
      </p>
      <PlanPoles current={plan} used={used} openKinds={openKinds} />
      <p className={styles.demoNote}>데모 요금제예요. 요금제를 바꾸면 선택만 기록되고 결제는 이뤄지지 않아요.</p>

      <div className={styles.lower}>
        <section className={styles.panel} aria-labelledby="inquiry-title">
          <h2 id="inquiry-title" className={styles.panelTitle}>
            엔터프라이즈 견적 문의
          </h2>
          <p>여러 브랜드나 채널을 한꺼번에 맡기려면 규모를 알려 주세요. 문의 내용은 이 작업실에 저장돼요.</p>
          <InquiryForm />
          {inquiries.length > 0 ? (
            <ul className={styles.history} role="list" aria-label="남긴 문의">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <span>
                    {inquiry.companyName} · 월 {inquiry.monthlyVolume}건
                  </span>
                  <time dateTime={inquiry.createdAt.toISOString()}>
                    {formatDate(inquiry.createdAt, { month: "long", day: "numeric" })}
                  </time>
                  <WithdrawInquiry inquiryId={inquiry.id} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className={styles.panel} aria-labelledby="history-title">
          <h2 id="history-title" className={styles.panelTitle}>
            요금제 변경 기록
          </h2>
          <ul className={styles.history} role="list">
            {history.map((change) => (
              <li key={change.id}>
                <span>{PLANS[change.plan].name}</span>
                <time dateTime={change.createdAt.toISOString()}>
                  {formatDate(change.createdAt, { dateStyle: "medium" })}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
