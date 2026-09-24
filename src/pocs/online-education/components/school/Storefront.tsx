import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatWon } from "@/core/format";
import type { readStorefront } from "../../server/reads";
import { categoryLabel, discountPercent, productTypeLabel } from "../../domain/catalog";
import { formatRuntime } from "../../domain/duration";
import { ProductTypeIcon } from "../products/ProductTypeIcon";
import { CurriculumFingerprint } from "../timetable/CurriculumFingerprint";
import ui from "../ui/ui.module.css";
import styles from "./school.module.css";

type Data = Awaited<ReturnType<typeof readStorefront>>;

export function Storefront({ data }: { data: Data }) {
  const { school, courses, products } = data;
  return (
    <>
      <header className={styles.storeHead}>
        <h1 className={styles.storeTitle}>{school.name}</h1>
        <p className={styles.storeLede}>
          {school.creatorName} 강사가 직접 만든 강의 {courses.length}개와 자료 {products.length}개를 모았어요. 강의마다 내 시간표를 짜 보고 신청할 수 있어요.
        </p>
      </header>

      <section id="courses" aria-labelledby="store-courses" className={styles.storeSection}>
        <h2 id="store-courses" className={styles.blockTitle}>
          강의
        </h2>
        {courses.length === 0 ? (
          <p className={ui.emptyText}>곧 첫 강의가 열려요.</p>
        ) : (
          <ul role="list" className={styles.courseList}>
            {courses.map((course) => {
              const discount = discountPercent(course.listPrice, course.price);
              return (
                <li key={course.id}>
                  <Link href={`/online-education/school/courses/${course.id}`} className={styles.courseItem} data-color={course.color}>
                    <span className={styles.courseArt}>
                      <CurriculumFingerprint shape={course.shape} color={course.color} width={132} height={96} />
                    </span>
                    <span className={styles.courseBody}>
                      <span className={styles.courseName}>{course.title}</span>
                      <span className={styles.courseDesc}>{course.description}</span>
                      <span className={styles.courseFacts}>
                        {categoryLabel(course.category)} · 레슨 {course.lessonCount}개 · {formatRuntime(course.runtimeSeconds)} · 수강생{" "}
                        {course.studentCount.toLocaleString("ko-KR")}명
                      </span>
                    </span>
                    <span className={styles.coursePrice}>
                      <strong className={ui.num}>{course.price === 0 ? "무료" : formatWon(course.price)}</strong>
                      {discount > 0 ? <span className={styles.discount}>{discount}% 할인</span> : null}
                      <span className={styles.go}>
                        시간표 보기 <ArrowRight size={14} aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="products" aria-labelledby="store-products" className={styles.storeSection}>
        <h2 id="store-products" className={styles.blockTitle}>
          자료
        </h2>
        {products.length === 0 ? (
          <p className={ui.emptyText}>판매 중인 자료가 없어요.</p>
        ) : (
          <ul role="list" className={styles.productList}>
            {products.map((product) => (
              <li key={product.id}>
                <Link href={`/online-education/school/products/${product.id}`} className={styles.productItem}>
                  <span className={styles.productArt} aria-hidden>
                    <ProductTypeIcon type={product.type} size={22} />
                  </span>
                  <span className={styles.courseBody}>
                    <span className={styles.productName}>{product.title}</span>
                    <span className={styles.courseFacts}>{productTypeLabel(product.type)}</span>
                  </span>
                  <strong className={ui.num}>{formatWon(product.price)}</strong>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
