import type { Metadata } from "next";
import { RevenueLedgers } from "@/pocs/newsletter-community/components/revenue/Ledgers";
import { RevenueSummary } from "@/pocs/newsletter-community/components/revenue/RevenueSummary";
import { PageHeader } from "@/pocs/newsletter-community/components/shell/PageHeader";
import { getRevenue } from "@/pocs/newsletter-community/server/queries";

export const metadata: Metadata = {
  title: "수입 장부",
  description: "구독료, 광고, 멤버십 수입을 행 단위 기록에서 계산해 월별로 봅니다.",
};

export default async function RevenuePage() {
  const overview = await getRevenue();
  return (
    <>
      <PageHeader
        title="수입 장부"
        lead="구독료는 명부의 유료 구독자와 플랜 가격에서, 광고와 멤버십은 아래 장부의 기록에서 계산해요."
      />
      <RevenueSummary overview={overview} />
      <RevenueLedgers deals={overview.deals} sales={overview.sales} />
    </>
  );
}
