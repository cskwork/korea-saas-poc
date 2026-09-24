import type { Metadata } from "next";
import { CaseBoard, CaseFilters } from "@/pocs/ai-content-agency/components/portfolio/CaseBoard";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { getCases, parseIndustry, parseKind } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "사례",
  description: "업종별로 모아 본 블로그·상품 설명·광고 카피 작업 사례. 납품한 의뢰를 사례로 올릴 수 있어요.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PortfolioPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const industry = parseIndustry(params.industry);
  const kind = parseKind(params.kind);
  const { items, industryCounts, total } = await getCases({ industry, kind });
  return (
    <>
      <PageHeader
        title="사례 게시판"
        lead="샘플 표시가 붙은 사례는 예시로 만든 작업이에요. 납품을 마친 의뢰를 올리면 실제 원고와 함께 여기에 걸려요."
      />
      <CaseFilters industry={industry} kind={kind} counts={industryCounts} total={total} />
      <CaseBoard items={items} filtered={Boolean(industry || kind)} />
    </>
  );
}
