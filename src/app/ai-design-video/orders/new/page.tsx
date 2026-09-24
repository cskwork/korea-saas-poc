import type { Metadata } from "next";
import { OrderForm } from "@/pocs/ai-design-video/components/orders/OrderForm";
import { SheetHeader } from "@/pocs/ai-design-video/components/SheetHeader";
import { isOrderType } from "@/pocs/ai-design-video/domain/catalog";
import { getOrderFormData } from "@/pocs/ai-design-video/server/queries";

export const metadata: Metadata = {
  title: "주문 접수",
  description: "작업 종류, 요청 사항, 레퍼런스, 마감일, 패키지를 받아 새 디자인·영상 주문을 접수해요.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { packages, today } = await getOrderFormData();
  const packageParam = typeof params.package === "string" ? params.package : undefined;
  const typeParam = typeof params.type === "string" && isOrderType(params.type) ? params.type : undefined;
  const chosen = packages.find((p) => p.id === packageParam);
  return (
    <>
      <SheetHeader
        title="주문 접수"
        lead={
          chosen
            ? `가격표에서 고른 ‘${chosen.name}’ 패키지로 채워 두었어요. 고객과 작업 내용을 적어 주세요.`
            : "고객이 보낸 의뢰를 작업 의뢰서로 옮겨 적어요. 접수하면 S#1 의뢰접수 단계에 새 컷이 생겨요."
        }
      />
      <OrderForm packages={packages} today={today} initialPackageId={chosen?.id} initialType={typeParam} />
    </>
  );
}
