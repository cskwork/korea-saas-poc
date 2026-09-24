import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/pocs/online-education/components/products/ProductEditor";
import { getProduct } from "@/pocs/online-education/server/queries";

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProduct((await params).productId);
  return { title: found ? `상품 편집 — ${found.product.title}` : "상품을 찾을 수 없어요" };
}

export default async function ProductPage({ params }: Props) {
  const found = await getProduct((await params).productId);
  if (!found) notFound();
  return <ProductEditor product={found.product} sales={found.sales} revenue={found.revenue} />;
}
