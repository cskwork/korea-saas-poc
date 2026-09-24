import type { Metadata } from "next";
import { PortfolioForm, type PortfolioDraft } from "@/pocs/ai-design-video/components/portfolio/PortfolioForm";
import { SheetHeader } from "@/pocs/ai-design-video/components/SheetHeader";
import { isOrderType } from "@/pocs/ai-design-video/domain/catalog";
import { getPortfolioDraftFromOrder } from "@/pocs/ai-design-video/server/queries";
import { z } from "zod";

export const metadata: Metadata = { title: "포트폴리오 작업 추가", robots: { index: false } };

const EMPTY: PortfolioDraft = {
  title: "",
  category: "thumbnail",
  clientLabel: "",
  headline: "",
  summary: "",
  tools: [],
  palette: [],
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { order, category } = await searchParams;
  const fromOrder =
    typeof order === "string" && z.uuid().safeParse(order).success ? await getPortfolioDraftFromOrder(order) : null;
  const draft: PortfolioDraft = fromOrder ?? {
    ...EMPTY,
    category: typeof category === "string" && isOrderType(category) ? category : EMPTY.category,
  };
  return (
    <>
      <SheetHeader
        title="포트폴리오 작업 추가"
        lead={
          fromOrder
            ? "납품한 주문의 내용으로 채워 두었어요. 고객 이름을 공개하지 않으려면 업종으로 바꿔 주세요."
            : "완성한 작업을 보드에 올려요. 색상과 대표 문구로 작업의 인상을 남겨요."
        }
      />
      <PortfolioForm draft={draft} />
    </>
  );
}
