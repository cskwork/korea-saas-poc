import type { Metadata } from "next";
import { PortfolioBoard } from "@/pocs/ai-design-video/components/portfolio/PortfolioBoard";
import { isOrderType } from "@/pocs/ai-design-video/domain/catalog";
import { getPortfolio } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "썸네일, 배너, 상세페이지, 숏폼, 영상, 로고 작업을 실제 규격 그대로 모은 샘플 포트폴리오.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await searchParams;
  const valid = typeof category === "string" && isOrderType(category) ? category : undefined;
  return <PortfolioBoard items={await getPortfolio()} category={valid} />;
}
