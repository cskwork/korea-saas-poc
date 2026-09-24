import { ChevronDown } from "lucide-react";
import type { readPlan } from "../../server/reads";
import { formatDate } from "@/core/format";
import { formatLimit, PLAN_FAQ, planPrice } from "../../domain/plans";
import { ResetDemoButton } from "../shell/ResetDemoButton";
import ui from "../ui/ui.module.css";
import { PlanPicker } from "./PlanPicker";
import { SchoolForm } from "./SchoolForm";
import styles from "./plans.module.css";

type PlanData = Awaited<ReturnType<typeof readPlan>>;

export function PlansPage({ data }: { data: PlanData }) {
  const { school, usage, plan } = data;
  const price = planPrice(school.plan, school.billing);
  const meters = [
    { label: "강의", used: usage.courses, limit: plan.limits.courses, unit: "개" },
    { label: "수강생", used: usage.students, limit: plan.limits.students, unit: "명" },
    { label: "디지털 상품", used: usage.products, limit: plan.limits.products, unit: "개" },
  ];

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>요금제·설정</h1>
          <p className={ui.pageLede}>
            지금은 <strong>{plan.name}</strong> 요금제 ({school.billing === "yearly" ? "연간" : "월간"} ·{" "}
            {price.perMonth === 0 ? "무료" : `월 ${price.perMonth.toLocaleString("ko-KR")}원`}) · {formatDate(school.planChangedAt)}부터
          </p>
        </div>
      </header>

      <div className={ui.stack}>
        <section aria-labelledby="usage-title">
          <div className={ui.sectionHead}>
            <h2 id="usage-title" className={ui.sectionTitle}>
              사용량
            </h2>
          </div>
          <ul role="list" className={styles.meters}>
            {meters.map((meter) => {
              const ratio = Number.isFinite(meter.limit) ? (meter.limit === 0 ? (meter.used > 0 ? 1 : 0) : meter.used / meter.limit) : 0;
              const over = meter.used > meter.limit;
              return (
                <li key={meter.label} className={styles.meter} data-over={over || undefined}>
                  <span className={styles.meterLabel}>{meter.label}</span>
                  <span className={styles.meterValue}>
                    <strong className={ui.num}>{meter.used.toLocaleString("ko-KR")}</strong> / {formatLimit(meter.limit, meter.unit)}
                  </span>
                  <span className={ui.progress} role="img" aria-label={`${meter.label} ${meter.used} / ${formatLimit(meter.limit, meter.unit)}`}>
                    <span className={styles.meterFill} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
                  </span>
                  {over ? <span className={styles.meterWarn}>한도를 넘었어요. 요금제를 올려 주세요.</span> : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="plans-title">
          <div className={ui.sectionHead}>
            <h2 id="plans-title" className={ui.sectionTitle}>
              요금제 비교
            </h2>
          </div>
          <p className={styles.note}>데모라서 요금제를 바꿔도 실제 결제는 일어나지 않아요. 강의·상품 한도는 바로 적용돼요.</p>
          <PlanPicker current={school.plan} billing={school.billing} />
        </section>

        <section aria-labelledby="faq-title" className={styles.faq}>
          <div className={ui.sectionHead}>
            <h2 id="faq-title" className={ui.sectionTitle}>
              자주 묻는 질문
            </h2>
          </div>
          {PLAN_FAQ.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary>
                {item.q}
                <ChevronDown size={16} aria-hidden className={styles.faqIcon} />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>

        <section aria-labelledby="school-title" className={ui.panel}>
          <div className={ui.sectionHead}>
            <h2 id="school-title" className={ui.sectionTitle}>
              스쿨 정보
            </h2>
          </div>
          <SchoolForm school={school} />
        </section>

        <section className={ui.dangerZone} aria-labelledby="demo-title">
          <div>
            <h2 id="demo-title" className={ui.sectionTitle}>
              데모 데이터
            </h2>
            <p>강의, 수강생, 상품, 결제를 처음 샘플 상태로 되돌려요. 다른 방문자의 데이터에는 영향이 없어요.</p>
          </div>
          <ResetDemoButton />
        </section>
      </div>
    </>
  );
}
