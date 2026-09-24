import type { Metadata } from "next";
import { ProductList } from "@/pocs/online-education/components/products/ProductList";
import { getProducts } from "@/pocs/online-education/server/queries";

export const metadata: Metadata = {
  title: "디지털 상품",
  description: "노션 템플릿, PDF, 스프레드시트를 등록하고 판매량과 매출을 확인해요.",
};

type Params = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const data = await getProducts(params);
  const created = typeof params.created === "string" ? `“${params.created}” 상품을 등록했어요. 스쿨에 바로 진열돼요.` : undefined;
  const deleted = typeof params.deleted === "string" ? `“${params.deleted}” 상품을 삭제했어요. 판매 기록은 수익 분석에 남아요.` : undefined;
  return <ProductList {...data} notice={created ?? deleted} now={new Date()} />;
}
