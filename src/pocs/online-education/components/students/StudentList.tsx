import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { formatDate, formatWon } from "@/core/format";
import { STUDENTS_PAGE_SIZE, type readStudents, type StudentFilters } from "../../server/reads";
import { AutoSubmitSelect } from "../ui/form";
import { hrefWith } from "../ui/query";
import ui from "../ui/ui.module.css";
import { EnrollmentProgress } from "./EnrollmentProgress";
import styles from "./students.module.css";

const BASE = "/online-education/students";

type Data = Awaited<ReturnType<typeof readStudents>> & { filters: StudentFilters };

export function StudentList({ data, deleted }: { data: Data; deleted?: string }) {
  const { summary, rows, filters, courses, total, page, pageCount } = data;
  const current = {
    q: filters.q,
    filter: filters.filter,
    course: filters.courseId,
    sort: filters.sort,
  };
  const tabs = [
    { label: "전체", value: undefined },
    { label: "수강 중", value: "learning" },
    { label: `뒤처짐 ${summary.behind}`, value: "behind" },
    { label: "수료", value: "completed" },
    { label: "상품만 구매", value: "buyers" },
  ];
  const activeFilter = filters.filter === "all" ? undefined : filters.filter;

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>수강생</h1>
          <p className={ui.pageLede}>
            수강생 <span className={ui.num}>{summary.students.toLocaleString("ko-KR")}</span>명 · 상품 구매자 포함{" "}
            <span className={ui.num}>{summary.learners.toLocaleString("ko-KR")}</span>명 · 평균 진도율{" "}
            <span className={ui.num}>{summary.averageProgress}%</span> · 누적 결제{" "}
            <span className={ui.num}>{formatWon(summary.totalPaid)}</span>
          </p>
        </div>
      </header>

      {deleted ? (
        <p className={clsx(ui.notice, ui.success, styles.flash)} role="status">
          <Check size={16} aria-hidden />
          {deleted}님의 정보를 삭제했어요. 결제 기록은 수익 분석에 남아요.
        </p>
      ) : null}

      <div className={ui.toolbar}>
        <nav className={ui.tabs} aria-label="수강 상태">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={hrefWith(BASE, { ...current, page: undefined }, { filter: tab.value })}
              className={ui.tab}
              aria-current={activeFilter === tab.value ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <form className={styles.filters} action={BASE} role="search">
        {activeFilter ? <input type="hidden" name="filter" value={activeFilter} /> : null}
        <label className={ui.search}>
          <span className={ui.srOnly}>이름이나 이메일로 찾기</span>
          <Search size={16} aria-hidden />
          <input className={ui.input} type="search" name="q" defaultValue={filters.q} placeholder="이름이나 이메일" />
        </label>
        <label className={styles.selectField}>
          <span className={ui.srOnly}>강의</span>
          <AutoSubmitSelect name="course" defaultValue={filters.courseId ?? ""}>
            <option value="">모든 강의</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </AutoSubmitSelect>
        </label>
        <label className={styles.selectField}>
          <span className={ui.srOnly}>정렬</span>
          <AutoSubmitSelect name="sort" defaultValue={filters.sort ?? "recent"}>
            <option value="recent">최근 가입 순</option>
            <option value="paid">결제액 많은 순</option>
            <option value="progress">진도율 높은 순</option>
            <option value="name">이름 순</option>
          </AutoSubmitSelect>
        </label>
        <button type="submit" className={clsx(ui.button, ui.small)}>
          찾기
        </button>
      </form>

      {rows.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>{summary.learners === 0 ? "아직 수강생이 없어요" : "조건에 맞는 수강생이 없어요"}</p>
          <p className={ui.emptyText}>
            {summary.learners === 0
              ? "강의를 게시하고 스쿨 링크를 나누면, 수강 신청한 사람이 여기에 진도와 함께 쌓여요."
              : "검색어나 필터를 바꿔 보세요."}
          </p>
          {summary.learners > 0 ? (
            <Link href={BASE} className={ui.button}>
              필터 지우기
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className={ui.tableWrap}>
            <table className={clsx(ui.table, styles.table)}>
              <thead>
                <tr>
                  <th scope="col">수강생</th>
                  <th scope="col">수강 강의와 진도</th>
                  <th scope="col" className={ui.right}>
                    결제액
                  </th>
                  <th scope="col" className={ui.right}>
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td data-label="수강생">
                      <Link href={`${BASE}/${row.id}`} className={styles.name}>
                        {row.name}
                      </Link>
                      <span className={styles.email}>{row.email}</span>
                    </td>
                    <td data-label="수강 강의">
                      {row.enrollments.length === 0 ? (
                        <span className={styles.quiet}>디지털 상품 {row.purchases}건 구매</span>
                      ) : (
                        <ul role="list" className={styles.enrollments}>
                          {row.enrollments.map((enrollment) => (
                            <li key={enrollment.id} data-color={enrollment.color} className={styles.enrollment}>
                              <span className={ui.courseChip}>
                                <span>{enrollment.courseTitle}</span>
                              </span>
                              <EnrollmentProgress progress={enrollment.progress} expected={enrollment.expected} pace={enrollment.pace} compact />
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td data-label="결제액" className={clsx(ui.right, ui.num, styles.strong)}>
                      {formatWon(row.totalPaid)}
                    </td>
                    <td data-label="가입일" className={clsx(ui.right, ui.num, styles.date)}>
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className={ui.pagination} aria-label="페이지">
            <span>
              {total.toLocaleString("ko-KR")}명 중 {((page - 1) * STUDENTS_PAGE_SIZE + 1).toLocaleString("ko-KR")}–
              {Math.min(page * STUDENTS_PAGE_SIZE, total).toLocaleString("ko-KR")}
            </span>
            <span className={ui.headerActions}>
              {page > 1 ? (
                <Link href={hrefWith(BASE, current, { page: String(page - 1) })} className={clsx(ui.button, ui.small)}>
                  <ChevronLeft size={14} aria-hidden />
                  이전
                </Link>
              ) : null}
              <span className={ui.num}>
                {page} / {pageCount}
              </span>
              {page < pageCount ? (
                <Link href={hrefWith(BASE, current, { page: String(page + 1) })} className={clsx(ui.button, ui.small)}>
                  다음
                  <ChevronRight size={14} aria-hidden />
                </Link>
              ) : null}
            </span>
          </nav>
        </>
      )}
    </>
  );
}
