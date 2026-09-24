import type { Metadata } from "next";
import { ProductEditor } from "@/pocs/online-education/components/products/ProductEditor";

export const metadata: Metadata = {
  title: "상품 등록",
  description: "노션 템플릿, PDF, 스프레드시트 같은 디지털 상품을 등록해요.",
};

export default function NewProductPage() {
  return <ProductEditor />;
}
