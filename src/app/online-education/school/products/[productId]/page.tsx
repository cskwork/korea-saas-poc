import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductLanding } from "@/pocs/online-education/components/school/ProductLanding";
import { getProduct, getStorefront } from "@/pocs/online-education/server/queries";

type Props = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProduct((await params).productId);
  return found ? { title: found.product.title, description: found.product.description } : { title: "자료를 찾을 수 없어요" };
}

export default async function SchoolProductPage({ params, searchParams }: Props) {
  const [{ productId }, query] = await Promise.all([params, searchParams]);
  const [found, store] = await Promise.all([getProduct(productId), getStorefront()]);
  if (!found || (found.product.status === "paused" && query.preview !== "1")) notFound();
  return <ProductLanding product={found.product} sales={found.sales} courses={store.courses.slice(0, 2)} />;
}
