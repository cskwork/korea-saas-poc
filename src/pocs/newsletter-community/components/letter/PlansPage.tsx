import { Check, Minus } from "lucide-react";
import { formatNumber } from "@/core/format";
import type { Reader } from "../../server/context";
import type { Plan, Publication } from "../../server/store/publication";
import { ReplyCard } from "./ReplyCard";
import styles from "./letter.module.css";

const FAQ = [
  {
    q: "언제든 구독을 멈출 수 있나요?",
    a: "네. 해지하면 다음 결제일부터 요금이 나가지 않고, 그때까지는 유료 호를 계속 읽을 수 있어요. (이 데모에서는 에디터가 명부에서 해지 처리해요.)",
  },
  {
    q: "무료로 구독하다가 유료로 바꿀 수 있나요?",
    a: "같은 이메일로 유료 플랜을 신청하면 등급만 바뀌어요. 지난 유료 호도 바로 열려요.",
  },
  {
    q: "독자 마당에는 누가 글을 쓸 수 있나요?",
    a: "베이직과 프로 구독자, 그리고 에디터가 글과 댓글을 쓸 수 있어요. 무료 구독자는 읽을 수 있어요.",
  },
  {
    q: "결제는 어떻게 하나요?",
    a: "이 레터는 펴냄의 데모라서 결제가 연동되어 있지 않아요. 신청서를 보내면 결제 없이 바로 구독자로 기록돼요.",
  },
];

/** 구독료 표: the plans compared perk by perk, then the reply card and questions. */
export function PlansPage({ publication, plans, reader }: { publication: Publication; plans: Plan[]; reader: Reader | null }) {
  const perks = [...new Set(plans.flatMap((plan) => plan.perks))];
  // Tiers are cumulative: a plan includes every perk of the plans below it.
  const includes = (index: number, perk: string) => plans.slice(0, index + 1).some((plan) => plan.perks.includes(perk));
  return (
    <div className={styles.plans}>
      <header className={styles.plansHead}>
        <h1 className={styles.pageTitle}>구독 안내</h1>
        <p className={styles.pageLead}>{publication.description}</p>
      </header>

      <div className={styles.rateWrap}>
        <table className={styles.rateTable}>
          <caption className={styles.rateCaption}>{publication.name} 구독료 (월 기준)</caption>
          <thead>
            <tr>
              <td />
              {plans.map((plan) => (
                <th key={plan.tier} scope="col">
                  <span className={styles.rateName}>{plan.name}</span>
                  <span className={styles.ratePrice}>
                    {plan.price === 0 ? "0원" : `${formatNumber(plan.price)}원`}
                    {plan.price > 0 && <small> / 월</small>}
                  </span>
                  <span className={styles.rateSummary}>{plan.summary}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perks.map((perk) => (
              <tr key={perk}>
                <th scope="row">{perk}</th>
                {plans.map((plan, index) => (
                  <td key={plan.tier}>
                    {includes(index, perk) ? (
                      <Check size={18} aria-label="포함" />
                    ) : (
                      <Minus size={18} aria-label="없음" className={styles.rateNo} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.plansBottom}>
        <ReplyCard
          id="subscribe"
          plans={plans.map(({ tier, name, price, summary }) => ({ tier, name, price, summary }))}
          publicationName={publication.name}
          defaultTier={reader?.tier === "free" ? "basic" : "free"}
          defaults={reader ? { name: reader.name, email: reader.email } : undefined}
        />
        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.faqTitle}>
            자주 묻는 질문
          </h2>
          {FAQ.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}
