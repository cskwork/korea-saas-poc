import Link from "next/link";
import clsx from "clsx";
import { Check, Eye, PencilRuler, Plus, Search } from "lucide-react";
import { formatWon } from "@/core/format";
import type { CourseFilters, CourseSummary } from "../../server/reads";
import { categoryLabel, discountPercent } from "../../domain/catalog";
import { formatRuntime } from "../../domain/duration";
import { CurriculumFingerprint } from "../timetable/CurriculumFingerprint";
import { AutoSubmitSelect } from "../ui/form";
import { hrefWith } from "../ui/query";
import ui from "../ui/ui.module.css";
import { CourseRowActions } from "./CourseRowActions";
import styles from "./courses.module.css";

const BASE = "/online-education/courses";

export function CourseList({
  all,
  rows,
  filters,
  deleted,
}: {
  all: CourseSummary[];
  rows: CourseSummary[];
  filters: CourseFilters;
  deleted?: string;
}) {
  const current = { q: filters.q, status: filters.status, sort: filters.sort };
  const published = all.filter((c) => c.status === "published").length;
  const tabs = [
    { label: "전체", value: undefined, count: all.length },
    { label: "게시 중", value: "published", count: published },
    { label: "초안", value: "draft", count: all.length - published },
  ];

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>강의</h1>
          <p className={ui.pageLede}>
            강의 {all.length}개 · 게시 중 {published}개 · 초안 {all.length - published}개
          </p>
        </div>
        <Link href={`${BASE}/new`} className={clsx(ui.button, ui.primary)}>
          <Plus size={16} aria-hidden />새 강의 만들기
        </Link>
      </header>

      {deleted ? (
        <p className={clsx(ui.notice, ui.success, styles.flash)} role="status">
          <Check size={16} aria-hidden />“{deleted}” 강의를 삭제했어요. 결제 기록은 수익 분석에 그대로 남아요.
        </p>
      ) : null}

      {all.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>첫 강의를 만들어 보세요</p>
          <p className={ui.emptyText}>
            제목과 가격만 정하면 초안이 만들어져요. 그다음 섹션과 레슨을 시간표처럼 쌓고, 준비가 되면 게시해서 스쿨에서 수강 신청을 받으세요.
          </p>
          <Link href={`${BASE}/new`} className={clsx(ui.button, ui.primary)}>
            <Plus size={16} aria-hidden />새 강의 만들기
          </Link>
        </div>
      ) : (
        <>
          <div className={ui.toolbar}>
            <nav className={ui.tabs} aria-label="게시 상태">
              {tabs.map((tab) => (
                <Link
                  key={tab.label}
                  href={hrefWith(BASE, current, { status: tab.value })}
                  className={ui.tab}
                  aria-current={filters.status === tab.value ? "page" : undefined}
                >
                  {tab.label} <span className={ui.tabCount}>{tab.count}</span>
                </Link>
              ))}
            </nav>
            <form className={styles.filterForm} action={BASE} role="search">
              {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
              <label className={ui.search}>
                <span className={ui.srOnly}>강의 검색</span>
                <Search size={16} aria-hidden />
                <input className={ui.input} type="search" name="q" defaultValue={filters.q} placeholder="강의 제목으로 찾기" />
              </label>
              <label className={styles.sortField}>
                <span className={ui.srOnly}>정렬</span>
                <AutoSubmitSelect name="sort" defaultValue={filters.sort ?? "recent"}>
                  <option value="recent">최근 만든 순</option>
                  <option value="students">수강생 많은 순</option>
                  <option value="revenue">매출 높은 순</option>
                  <option value="title">제목 순</option>
                </AutoSubmitSelect>
              </label>
              <button type="submit" className={clsx(ui.button, ui.small)}>
                찾기
              </button>
            </form>
          </div>

          {rows.length === 0 ? (
            <div className={ui.empty}>
              <p className={ui.emptyTitle}>조건에 맞는 강의가 없어요</p>
              <p className={ui.emptyText}>검색어나 게시 상태를 바꿔 보세요.</p>
              <Link href={BASE} className={ui.button}>
                필터 지우기
              </Link>
            </div>
          ) : (
            <ul role="list" className={styles.list}>
              {rows.map((course) => {
                const discount = discountPercent(course.listPrice, course.price);
                return (
                  <li key={course.id} className={styles.row}>
                    <CurriculumFingerprint shape={course.shape} color={course.color} />
                    <div className={styles.main}>
                      <h2 className={styles.title}>
                        <Link href={`${BASE}/${course.id}`}>{course.title}</Link>
                      </h2>
                      <p className={styles.meta}>
                        <span className={ui.badge} data-tone={course.status === "published" ? "live" : undefined}>
                          {course.status === "published" ? "게시 중" : "초안"}
                        </span>
                        <span>{categoryLabel(course.category)}</span>
                        <span>
                          섹션 {course.sectionCount} · 레슨 {course.lessonCount} · {formatRuntime(course.runtimeSeconds)}
                        </span>
                        {course.previewCount > 0 ? <span>미리보기 {course.previewCount}개</span> : null}
                      </p>
                    </div>
                    <dl className={styles.figures}>
                      <div>
                        <dt>판매가</dt>
                        <dd className={ui.num}>
                          {course.price === 0 ? "무료" : formatWon(course.price)}
                          {discount > 0 ? <span className={styles.discount}>{discount}%</span> : null}
                        </dd>
                      </div>
                      <div>
                        <dt>수강생</dt>
                        <dd className={ui.num}>{course.studentCount.toLocaleString("ko-KR")}명</dd>
                      </div>
                      <div>
                        <dt>누적 매출</dt>
                        <dd className={ui.num}>{formatWon(course.revenue)}</dd>
                      </div>
                    </dl>
                    <div className={styles.actions}>
                      <Link href={`${BASE}/${course.id}`} className={clsx(ui.button, ui.small)}>
                        <PencilRuler size={14} aria-hidden />
                        커리큘럼 편집
                      </Link>
                      <Link
                        href={`/online-education/school/courses/${course.id}${course.status === "draft" ? "?preview=1" : ""}`}
                        className={clsx(ui.button, ui.small, ui.ghost)}
                      >
                        <Eye size={14} aria-hidden />
                        {course.status === "draft" ? "미리보기" : "스쿨 페이지"}
                      </Link>
                      <CourseRowActions id={course.id} status={course.status} students={course.studentCount} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
