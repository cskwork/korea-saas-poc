import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { formatWon } from "@/core/format";
import type { Product } from "../../db/schema";
import type { CourseSummary } from "../../server/reads";
import { PRODUCT_TYPES } from "../../domain/catalog";
import { ProductTypeIcon } from "../products/ProductTypeIcon";
import { CurriculumFingerprint } from "../timetable/CurriculumFingerprint";
import ui from "../ui/ui.module.css";
import { PurchasePanel } from "./PurchasePanel";
import styles from "./school.module.css";

export function ProductLanding({ product, sales, courses }: { product: Product; sales: number; courses: CourseSummary[] }) {
  const type = PRODUCT_TYPES.find((t) => t.value === product.type) ?? PRODUCT_TYPES[0];
  const onSale = product.status === "on_sale";
  return (
    <article className={styles.landing}>
      <div className={styles.hero}>
        {!onSale ? (
          <p className={styles.previewBanner} role="note">
            <Eye size={16} aria-hidden />
            판매를 멈춘 자료예요. 스쿨에는 보이지 않아요. <Link href={`/online-education/products/${product.id}`}>상품 편집으로</Link>
          </p>
        ) : null}
        <span className={styles.productHeroArt} aria-hidden>
          <ProductTypeIcon type={product.type} size={30} />
        </span>
        <h1 className={styles.courseTitle}>{product.title}</h1>
        <p className={styles.courseLede}>{product.description}</p>
        <ul role="list" className={styles.facts}>
          <li>{type.label}</li>
          <li>{type.format}로 전달</li>
          <li>{sales.toLocaleString("ko-KR")}명이 구매</li>
        </ul>
      </div>
      <aside className={styles.rail} aria-label="구매">
        {onSale ? (
          <PurchasePanel productId={product.id} price={product.price} format={type.format} />
        ) : (
          <p className={ui.emptyText}>지금은 구매할 수 없어요.</p>
        )}
      </aside>
      {courses.length > 0 ? (
        <div className={styles.body}>
          <section aria-labelledby="related-title">
            <h2 id="related-title" className={styles.blockTitle}>
              함께 들으면 좋은 강의
            </h2>
            <ul role="list" className={styles.courseList}>
              {courses.map((course) => (
                <li key={course.id}>
                  <Link href={`/online-education/school/courses/${course.id}`} className={styles.courseItem} data-color={course.color}>
                    <span className={styles.courseArt}>
                      <CurriculumFingerprint shape={course.shape} color={course.color} width={96} height={72} />
                    </span>
                    <span className={styles.courseBody}>
                      <span className={styles.courseName}>{course.title}</span>
                      <span className={styles.courseDesc}>{course.description}</span>
                    </span>
                    <span className={styles.coursePrice}>
                      <strong className={ui.num}>{formatWon(course.price)}</strong>
                      <span className={styles.go}>
                        보기 <ArrowRight size={14} aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
      {onSale ? (
        <a href="#buy" className={styles.mobileCta}>
          <span className={ui.num}>{formatWon(product.price)}</span>
          <span>구매하기</span>
        </a>
      ) : null}
    </article>
  );
}
