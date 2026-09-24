import { X } from "lucide-react";
import Link from "next/link";
import { formatMonthDay } from "@/core/format";
import { addDays, type DateKey } from "../../domain/dates";
import { PROJECT_STATUS_LABEL } from "../../domain/labels";
import { formatDuration, hoursLabel, type WorkCalendar as Calendar } from "../../domain/time";
import type { BoardProject } from "../../server/data/projects";
import type { EntryRow, PickerProject } from "../../server/data/time";
import { WorkCalendar } from "../calendar/WorkCalendar";
import { buttonClass } from "../ui/button";
import { HourCellsBar } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import { Segments } from "../ui/Segments";
import ui from "../ui/ui.module.css";
import { EntryForm } from "./EntryForm";
import { EntryList } from "./EntryList";
import styles from "./TimeView.module.css";

const BASE = "/dev-freelancing/time";

interface TimeViewProps {
  calendar: Calendar;
  entries: EntryRow[];
  projects: PickerProject[];
  board: BoardProject[];
  today: DateKey;
  filter: { projectId: string; day: string; range: "week" | "month" | "all" };
}

export function TimeView({ calendar, entries, projects, board, today, filter }: TimeViewProps) {
  const href = (patch: Partial<TimeViewProps["filter"]>) => {
    const next = { ...filter, ...patch };
    const params = new URLSearchParams();
    if (next.projectId) params.set("project", next.projectId);
    if (next.day) params.set("day", next.day);
    else if (next.range !== "week") params.set("range", next.range);
    const query = params.toString();
    return query ? `${BASE}?${query}` : BASE;
  };
  const shown = entries.reduce((sum, e) => sum + e.minutes, 0);
  const lastWeek = calendar.weeks.flatMap((w) => w.days).filter((d) => d.key > addDays(today, -7) && !d.future);
  const active = board.filter((p) => p.status === "progress" || p.status === "review");
  const selectedProject = projects.find((p) => p.id === filter.projectId);

  return (
    <div className={styles.page}>
      <PageHeader
        title="시간 기록"
        description={`최근 7일 ${formatDuration(lastWeek.reduce((s, d) => s + d.minutes, 0))} · 52주 동안 ${hoursLabel(calendar.totalMinutes)}시간. 타이머는 화면 아래에 늘 있어요.`}
      />

      <section className={ui.region} aria-labelledby="tm-calendar">
        <div className={ui.regionHead}>
          <h2 id="tm-calendar" className={ui.regionTitle}>
            52주
          </h2>
          <p className={ui.regionNote}>칸을 누르거나 화살표 키로 옮겨 그날 기록을 봐요.</p>
        </div>
        <WorkCalendar calendar={calendar} mode="link" selected={filter.day || null} label="최근 52주 작업 기록" />
      </section>

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="tm-entries">
          <div className={ui.regionHead}>
            <h2 id="tm-entries" className={ui.regionTitle}>
              {filter.day ? formatMonthDay(`${filter.day}T12:00:00+09:00`) : "기록"}
            </h2>
            <p className={ui.regionNote}>
              {entries.length}건 · <span className={ui.measure}>{formatDuration(shown)}</span>
            </p>
          </div>
          <div className={styles.filters}>
            {filter.day ? (
              <Link href={href({ day: "" })} className={buttonClass("secondary", { small: true })} scroll={false}>
                <X size={14} aria-hidden="true" />
                날짜 선택 해제
              </Link>
            ) : (
              <Segments
                label="기간"
                items={[
                  { href: href({ range: "week" }), label: "최근 7일", current: filter.range === "week" },
                  { href: href({ range: "month" }), label: "최근 30일", current: filter.range === "month" },
                  { href: href({ range: "all" }), label: "전체", current: filter.range === "all" },
                ]}
              />
            )}
            <form method="get" className={styles.projectFilter}>
              {filter.day ? <input type="hidden" name="day" value={filter.day} /> : null}
              {!filter.day && filter.range !== "week" ? <input type="hidden" name="range" value={filter.range} /> : null}
              <label className={styles.srOnly} htmlFor="tm-project">
                프로젝트
              </label>
              <select id="tm-project" name="project" className={ui.select} defaultValue={filter.projectId}>
                <option value="">모든 프로젝트</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button type="submit" className={buttonClass("secondary", { small: true })}>
                보기
              </button>
            </form>
          </div>
          {entries.length === 0 ? (
            <EmptyState title={selectedProject ? `${selectedProject.title}에 기록이 없어요` : "이 기간에 기록이 없어요"}>
              화면 아래 타이머로 시작하거나 오른쪽 양식으로 지난 작업을 적어 두세요.
            </EmptyState>
          ) : (
            <EntryList entries={entries} projects={projects} today={today} />
          )}
        </section>

        <aside className={styles.aside}>
          <section className={styles.panel} aria-labelledby="tm-manual">
            <h2 id="tm-manual" className={ui.regionTitle}>
              직접 기록
            </h2>
            <EntryForm projects={projects} today={today} />
          </section>
          <section className={ui.region} aria-labelledby="tm-projects">
            <h2 id="tm-projects" className={ui.regionTitle}>
              프로젝트별 시간
            </h2>
            {active.length === 0 ? (
              <p className={ui.muted}>진행 중인 프로젝트가 없어요.</p>
            ) : (
              <ul role="list" className={styles.totals}>
                {active.map((project) => (
                  <li key={project.id}>
                    <div className={styles.totalHead}>
                      <Link href={`/dev-freelancing/projects/${project.id}`} className={ui.rowLink}>
                        {project.title}
                      </Link>
                      <span className={ui.muted}>{PROJECT_STATUS_LABEL[project.status]}</span>
                    </div>
                    <HourCellsBar estimatedHours={project.estimatedHours} trackedMinutes={project.trackedMinutes} maxCells={40} size={8} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
