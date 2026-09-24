import type { CSSProperties } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Search } from "lucide-react";
import { formatDate, formatKrw, seoulDateKey } from "@/core/format";
import type { Stage } from "../../db/schema";
import { daysBetween, dDay } from "../../domain/dashboard";
import { STAGE_LABEL, STAGES } from "../../domain/stages";
import type { ProjectFilter, ProjectListItem } from "../../server/data/projects";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { EmptyLine } from "../ui/EmptyLine";
import { MaintenanceTag, StageTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./projects.module.css";

const PROJECTS = `${BASE_PATH}/projects`;

function hrefWith(filter: ProjectFilter, patch: Partial<ProjectFilter>) {
  const next = { ...filter, ...patch };
  const params = new URLSearchParams();
  if (next.stage) params.set("stage", next.stage);
  if (next.q) params.set("q", next.q);
  if (next.sort && next.sort !== "due") params.set("sort", next.sort);
  const query = params.toString();
  return query ? `${PROJECTS}?${query}` : PROJECTS;
}

/** Station filter (the line itself), search and sort. */
export function ProjectFilters({ filter, counts }: { filter: ProjectFilter; counts: Record<Stage, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className={styles.filters}>
      <nav aria-label="역별 보기">
        <ul className={styles.stationFilter}>
          <li>
            <Link
              href={hrefWith(filter, { stage: undefined })}
              className={ui.chip}
              aria-current={!filter.stage ? "true" : undefined}
            >
              전체 <span className={ui.chipCount}>{total}</span>
            </Link>
          </li>
          {STAGES.map((stage) => (
            <li key={stage}>
              <Link
                href={hrefWith(filter, { stage })}
                className={ui.chip}
                aria-current={filter.stage === stage ? "true" : undefined}
              >
                <span className={clsx(ui.stageDot, stage === "maintenance" && ui.stageDotLoop)} aria-hidden="true" />
                {STAGE_LABEL[stage]} <span className={ui.chipCount}>{counts[stage]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <form action={PROJECTS} className={styles.search} role="search">
        {filter.stage ? <input type="hidden" name="stage" value={filter.stage} /> : null}
        <label htmlFor="pj-q" className={ui.srOnly}>
          고객명 검색
        </label>
        <input
          id="pj-q"
          name="q"
          type="search"
          className={ui.input}
          defaultValue={filter.q}
          placeholder="고객명으로 검색"
        />
        <label htmlFor="pj-sort" className={ui.srOnly}>
          정렬
        </label>
        <select id="pj-sort" name="sort" className={ui.select} defaultValue={filter.sort ?? "due"}>
          <option value="due">마감일순</option>
          <option value="recent">최근 수정순</option>
          <option value="client">고객명순</option>
        </select>
        <button type="submit" className={buttonClass("primary")}>
          <Search size={16} aria-hidden="true" />
          찾기
        </button>
      </form>
    </div>
  );
}

export function ProjectTable({ projects, filter }: { projects: ProjectListItem[]; filter: ProjectFilter }) {
  const today = seoulDateKey();
  if (projects.length === 0) {
    return (
      <EmptyLine
        title={filter.stage || filter.q ? "조건에 맞는 프로젝트가 없어요" : "아직 프로젝트가 없어요"}
        action={
          <Link href={`${PROJECTS}/new`} className={buttonClass("primary")}>
            새 프로젝트
          </Link>
        }
      >
        {filter.stage
          ? `‘${STAGE_LABEL[filter.stage]}’ 역에 머문 프로젝트가 없어요.`
          : "견적이 수락되면 프로젝트로 전환하거나 직접 만들어 보세요."}
      </EmptyLine>
    );
  }
  return (
    <table className={clsx(ui.table, ui.stack)}>
      <thead>
        <tr>
          <th scope="col">고객</th>
          <th scope="col">현재 역</th>
          <th scope="col">담당</th>
          <th scope="col" className={ui.num}>
            마감
          </th>
          <th scope="col" className={ui.num}>
            유지보수
          </th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => {
          const days = p.dueDate && p.stage !== "maintenance" ? daysBetween(today, p.dueDate) : null;
          return (
            <tr key={p.id}>
              <td className={ui.wide}>
                <Link href={`${PROJECTS}/${p.id}`} className={ui.rowLink}>
                  {p.clientName}
                </Link>
                <span className={ui.sub}>
                  {p.packages.length > 0 ? p.packages.map((pkg) => pkg.name).join(" · ") : "패키지 미지정"}
                </span>
              </td>
              <td data-label="현재 역">
                <StageTag stage={p.stage} />
                <span
                  className={styles.progress}
                  style={{ "--p": `${p.progress}%` } as CSSProperties}
                  aria-label={`진행률 ${p.progress}%`}
                >
                  <span className={styles.progressFill} />
                </span>
              </td>
              <td data-label="담당">{p.assignee || <span className={ui.muted}>미배정</span>}</td>
              <td data-label="마감" className={ui.num}>
                {p.dueDate ? (
                  formatDate(`${p.dueDate}T00:00:00+09:00`, { month: "short", day: "numeric" })
                ) : (
                  <span className={ui.muted}>—</span>
                )}
                {days !== null ? <span className={clsx(ui.sub, days < 0 && styles.late)}>{dDay(days)}</span> : null}
              </td>
              <td data-label="유지보수" className={ui.num}>
                <MaintenanceTag status={p.maintenanceStatus} />
                {p.monthlyFee > 0 ? <span className={ui.sub}>월 {formatKrw(p.monthlyFee)}</span> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
