import type { Metadata } from "next";
import { PortfolioView } from "@/pocs/dev-freelancing/components/showcase/ShowcaseViews";
import { getPortfolio } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "완료한 프로젝트를 스택, 역할, 결과와 함께 정리해 공개 페이지에 보여 줍니다.",
};

export default async function PortfolioPage() {
  const data = await getPortfolio();
  return <PortfolioView items={data.items} candidates={data.candidates} projects={data.projects} />;
}
