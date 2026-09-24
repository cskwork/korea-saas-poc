import type { Plan, Publication } from "../../server/store/publication";
import { SectionHead } from "../ui/SectionHead";
import { PlanForm, PublicationForm, ResetDemoButton } from "./SettingsForms";
import styles from "./settings.module.css";

export function Settings({ publication, plans }: { publication: Publication; plans: Plan[] }) {
  return (
    <div className={styles.layout}>
      <section aria-labelledby="settings-publication">
        <SectionHead id="settings-publication" title="레터 정보" />
        <PublicationForm
          values={{
            name: publication.name,
            description: publication.description,
            editorName: publication.editorName,
            sendHour: publication.sendHour,
            revenueGoal: publication.revenueGoal,
            paidGoal: publication.paidGoal,
          }}
        />
      </section>
      <section aria-labelledby="settings-plans">
        <SectionHead id="settings-plans" title="구독 플랜" aside={<a href="/newsletter-community/letter/plans">구독 안내 보기</a>} />
        <div className={styles.plans}>
          {plans.map((plan) => (
            <PlanForm key={plan.tier} plan={{ tier: plan.tier, name: plan.name, price: plan.price, summary: plan.summary, perks: plan.perks }} />
          ))}
        </div>
      </section>
      <section aria-labelledby="settings-reset" id="reset">
        <SectionHead id="settings-reset" title="데모 데이터" />
        <div className={styles.reset}>
          <p>
            이 편집실은 방문한 브라우저마다 따로 만들어진 샘플이에요. 이것저것 바꿔 본 뒤 처음 상태로 돌아가고 싶을 때 쓰세요.
          </p>
          <ResetDemoButton />
        </div>
      </section>
    </div>
  );
}
