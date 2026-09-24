import type { Metadata } from "next";
import { Generator } from "@/pocs/ai-content-agency/components/drafts/Generator";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { getAiMode, getOpenOrders } from "@/pocs/ai-content-agency/server/queries";

/** Generation runs in this route's server action. */
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "시안 쓰기",
  description: "블로그 포스트, 상품 설명, 광고 카피 시안을 말투·분량·키워드에 맞춰 AI로 쓰고 원고함에 저장해요.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function WritePage({ searchParams }: { searchParams: SearchParams }) {
  const { order } = await searchParams;
  const orders = await getOpenOrders();
  return (
    <>
      <PageHeader
        title="시안 쓰기"
        lead="조건을 적으면 AI가 첫 시안을 써요. 쓴 시안은 원고함에 v1로 저장되고, 에디터가 고치거나 다시 쓸 때마다 버전이 쌓여요."
      />
      <Generator
        orders={orders.map(({ id, number, clientName, kind, topic, keywords, tone, length }) => ({
          id,
          number,
          clientName,
          kind,
          topic,
          keywords,
          tone,
          length,
        }))}
        initialOrderId={typeof order === "string" ? order : null}
        aiMode={getAiMode()}
      />
    </>
  );
}
