import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem, ServicePlan } from "../../server/data/showcase";
import { buttonClass } from "../ui/button";
import { PageHeader } from "../ui/PageHeader";
import { PlanEditor } from "./PlanEditor";
import { PortfolioEditor } from "./PortfolioEditor";
import styles from "./Showcase.module.css";

const publicLink = (
  <a href="/dev-freelancing/profile" className={buttonClass("secondary")} target="_blank" rel="noopener">
    공개 페이지 보기 <ArrowUpRight size={14} aria-hidden="true" />
  </a>
);

export function PortfolioView({
  items,
  candidates,
  projects,
}: {
  items: PortfolioItem[];
  candidates: { id: string; title: string; description: string; company: string | null }[];
  projects: { id: string; title: string }[];
}) {
  const published = items.filter((item) => item.published).length;
  return (
    <div className={styles.page}>
      <PageHeader title="포트폴리오" description={`${items.length}개 중 ${published}개가 공개 페이지에 보여요. 순서도 공개 페이지 그대로예요.`} actions={publicLink} />
      <PortfolioEditor items={items} candidates={candidates} projects={projects} />
    </div>
  );
}

export function PricingView({ plans }: { plans: ServicePlan[] }) {
  return (
    <div className={styles.page}>
      <PageHeader title="요금표" description="공개 페이지에 보이는 서비스 요금이에요. 금액은 시작 가격이고, 실제 견적은 범위에 따라 달라져요." actions={publicLink} />
      <PlanEditor plans={plans} />
    </div>
  );
}
