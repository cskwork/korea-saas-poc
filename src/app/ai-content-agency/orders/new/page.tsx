import type { Metadata } from "next";
import Link from "next/link";
import { OrderForm } from "@/pocs/ai-content-agency/components/orders/OrderForm";
import styles from "@/pocs/ai-content-agency/components/orders/orders.module.css";
import { BackLink } from "@/pocs/ai-content-agency/components/ui/BackLink";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { KIND_LABEL } from "@/pocs/ai-content-agency/domain/content";
import { addBusinessDays } from "@/pocs/ai-content-agency/domain/dates";
import { PLANS } from "@/pocs/ai-content-agency/domain/plans";
import { createOrderAction } from "@/pocs/ai-content-agency/server/actions";
import { getNewOrderContext } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "의뢰서 쓰기",
  description: "블로그·상품 설명·광고 카피 의뢰를 받아 마감일과 함께 게시대에 걸어요.",
};

export default async function NewOrderPage() {
  const { plan: planId, used, today } = await getNewOrderContext();
  const plan = PLANS[planId];
  const left = plan.monthlyQuota === null ? null : Math.max(0, plan.monthlyQuota - used);
  return (
    <>
      <BackLink href={"/ai-content-agency/orders"}>의뢰 게시대</BackLink>
      <PageHeader
        title="의뢰서 쓰기"
        lead="고객이 원하는 것을 적어 두면, 접수 단계에 걸리고 마감일까지 게시대에서 챙길 수 있어요."
      />
      <div className={styles.requestLayout}>
        <OrderForm
          action={createOrderAction}
          minDate={today}
          allowedKinds={plan.kinds}
          submitLabel="의뢰서 접수"
          defaults={{
            clientName: "",
            industry: "",
            contactName: "",
            contactEmail: "",
            kind: "blog",
            topic: "",
            brief: "",
            keywords: [],
            tone: "friendly",
            length: "medium",
            dueDate: addBusinessDays(today, 3),
          }}
        />
        <aside className={styles.aside} aria-label="접수 안내">
          <div className={styles.asideBox}>
            <strong>{plan.name} 요금제</strong>
            <span>
              {left === null
                ? `이번 달 ${used}건 접수 · 건수 제한 없음`
                : `이번 달 ${used}건 접수 · ${left}건 더 받을 수 있어요`}
            </span>
            <span>받는 유형: {plan.kinds.map((k) => KIND_LABEL[k]).join(", ")}</span>
            <Link href="/ai-content-agency/pricing">요금제 보기</Link>
          </div>
          <div className={styles.asideBox}>
            <strong>접수 뒤에는</strong>
            <span>
              의뢰는 접수 → 작성중 → 검수 → 납품완료 순서로 옮겨져요. 상세 페이지에서 버튼 한 번이면 AI가 첫 시안을
              쓰고, 에디터가 검수한 원고만 납품돼요.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
