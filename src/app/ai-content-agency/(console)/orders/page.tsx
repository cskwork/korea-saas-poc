import type { Metadata } from "next";
import { Board } from "@/pocs/ai-content-agency/components/orders/Board";
import { BoardFilters } from "@/pocs/ai-content-agency/components/orders/BoardFilters";
import { PageHeader } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { getOrderBoard, parseKind, parseQuery } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "의뢰 게시대",
  description: "접수부터 납품완료까지, 모든 의뢰를 단계별로 걸어 두고 마감일 순으로 챙겨요.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = parseQuery(params.q);
  const kind = parseKind(params.kind);
  const { orders, today } = await getOrderBoard({ q, kind });
  return (
    <>
      <PageHeader
        title="의뢰 게시대"
        lead="의뢰는 단계마다 한 줄씩 걸려요. 마감일이 가까운 순서로 왼쪽부터 걸리고, 버튼 하나로 다음 단계로 옮겨요. 납품은 의뢰에서 보낼 원고를 골라서 해요."
      />
      <BoardFilters q={q} kind={kind} total={orders.length} />
      <Board orders={orders} today={today} showAllDelivered={params.all === "1"} filtered={Boolean(q || kind)} />
    </>
  );
}
