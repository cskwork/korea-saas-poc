import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { formatWon } from "@/core/format";
import type { Product } from "../../db/schema";
import { productTypeLabel } from "../../domain/catalog";
import { CopyLinkButton } from "../ui/form";
import ui from "../ui/ui.module.css";
import { ProductForm } from "./ProductForm";
import { ProductRowActions } from "./ProductRowActions";
import { DeleteProduct } from "./DeleteProduct";
import styles from "./products.module.css";

/** New product (no `product`) or edit an existing one with its sales. */
export function ProductEditor({ product, sales, revenue }: { product?: Product; sales?: number; revenue?: number }) {
  const path = product ? `/online-education/school/products/${product.id}` : "";
  const pagePath = product?.status === "paused" ? `${path}?preview=1` : path;
  return (
    <>
      <Link href="/online-education/products" className={ui.back}>
        <ArrowLeft size={15} aria-hidden />
        디지털 상품
      </Link>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>{product ? product.title : "상품 등록"}</h1>
          <p className={ui.pageLede}>
            {product
              ? `${productTypeLabel(product.type)} · 판매 ${(sales ?? 0).toLocaleString("ko-KR")}건 · 매출 ${formatWon(revenue ?? 0)}`
              : "스쿨에 강의와 함께 진열될 자료를 올려요."}
          </p>
        </div>
        {product ? (
          <div className={ui.headerActions}>
            <Link href={pagePath} className={ui.button}>
              <Eye size={16} aria-hidden />
              판매 페이지
            </Link>
            {product.status === "on_sale" ? <CopyLinkButton path={path} label="판매 링크 복사" /> : null}
            <ProductRowActions id={product.id} status={product.status} showDelete={false} />
          </div>
        ) : null}
      </header>
      <div className={styles.editor}>
        <ProductForm
          productId={product?.id}
          defaults={product ?? { title: "", type: "notion", description: "", price: 0 }}
        />
        <aside className={styles.aside}>
          <h2>판매는 이렇게 기록돼요</h2>
          <p>판매 페이지에서 구매하면 구매자와 결제가 기록되고, 수익 분석의 디지털 상품 매출에 더해져요.</p>
          <p>데모라서 실제 결제와 파일 전달은 일어나지 않아요.</p>
        </aside>
      </div>
      {product ? <DeleteProduct id={product.id} /> : null}
    </>
  );
}
