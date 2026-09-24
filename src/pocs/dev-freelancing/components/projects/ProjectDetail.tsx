import { ArrowLeft, ArrowRight, FilePlus2, ReceiptText, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatWon } from "@/core/format";
import { dDay, longDay } from "../../domain/dates";
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL } from "../../domain/labels";
import { effectiveHourlyRate } from "../../domain/revenue";
import { formatDuration } from "../../domain/time";
import { deleteProject } from "../../server/actions";
import type { ClientOption } from "../../server/data/clients";
import type { ProjectDetail as ProjectDetailData } from "../../server/data/projects";
import type { PickerProject } from "../../server/data/time";
import { DocumentRows } from "../documents/DocumentRows";
import { projectCell } from "../documents/status";
import { EntryForm } from "../time/EntryForm";
import { EntryList } from "../time/EntryList";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { HourCellsBar, StateLabel } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { Milestones } from "./Milestones";
import { ProjectEditor } from "./ProjectEditor";
import styles from "./ProjectDetail.module.css";

const BASE = "/dev-freelancing";

export function ProjectDetail({
  data,
  clients,
  pickers,
  today,
}: {
  data: ProjectDetailData;
  clients: ClientOption[];
  pickers: PickerProject[];
  today: string;
}) {
  const { project } = data;
  const client = project.clientCompany || project.clientName;
  const finished = project.status === "done";
  const rate = effectiveHourlyRate(finished && data.paid > 0 ? data.paid : project.budget, project.trackedMinutes);
  const query = new URLSearchParams({ project: project.id, ...(project.clientId ? { client: project.clientId } : {}) }).toString();

  return (
    <div className={styles.page}>
      <Link href={`${BASE}/projects`} className={ui.textLink}>
        <ArrowLeft size={14} aria-hidden="true" /> 프로젝트 보드
      </Link>
      <PageHeader
        title={project.title}
        description={
          <span className={styles.headMeta}>
            <StateLabel state={projectCell(project.status)}>{PROJECT_STATUS_LABEL[project.status]}</StateLabel>
            {project.clientId ? (
              <Link href={`${BASE}/clients/${project.clientId}`} className={ui.textLink}>
                {client}
              </Link>
            ) : (
              <span>고객 미지정</span>
            )}
            <span>우선순위 {PRIORITY_LABEL[project.priority]}</span>
          </span>
        }
        actions={
          <>
            <Link href={`${BASE}/estimates/new?${query}`} className={buttonClass("secondary", { small: true })}>
              <FilePlus2 size={14} aria-hidden="true" />
              견적서
            </Link>
            <Link href={`${BASE}/invoices/new?${query}`} className={buttonClass("secondary", { small: true })}>
              <ReceiptText size={14} aria-hidden="true" />
              인보이스
            </Link>
            <ActionButton action={deleteProject} payload={{ id: project.id }} variant="danger" small confirm="프로젝트와 마일스톤, 시간 기록을 모두 지울까요?" confirmLabel="삭제">
              <Trash2 size={14} aria-hidden="true" />
              삭제
            </ActionButton>
          </>
        }
      />

      <ProjectEditor
        clients={clients}
        project={{
          id: project.id,
          title: project.title,
          clientId: project.clientId,
          status: project.status,
          priority: project.priority,
          budget: project.budget,
          startOn: project.startOn,
          dueOn: project.dueOn,
          description: project.description,
        }}
      />

      <dl className={styles.facts}>
        <div>
          <dt>예산</dt>
          <dd>{project.budget > 0 ? formatWon(project.budget) : "미정"}</dd>
        </div>
        <div>
          <dt>청구 · 입금</dt>
          <dd>
            {formatWon(data.billed)} <span className={ui.muted}>/ {formatWon(data.paid)}</span>
          </dd>
        </div>
        <div>
          <dt>추적한 시간</dt>
          <dd className={ui.measure}>{formatDuration(project.trackedMinutes)}</dd>
        </div>
        <div>
          <dt>{finished && data.paid > 0 ? "실효 시급 (입금 ÷ 시간)" : "지금까지 시급 (예산 ÷ 시간)"}</dt>
          <dd>{rate === null ? "—" : `${formatWon(rate)}/시간`}</dd>
        </div>
        <div>
          <dt>일정</dt>
          <dd>
            {project.startOn ? longDay(project.startOn) : "시작일 없음"}
            {project.dueOn ? ` → ${longDay(project.dueOn)} (${dDay(project.dueOn, today)})` : ""}
          </dd>
        </div>
      </dl>

      <section className={ui.region} aria-labelledby="pd-hours">
        <div className={ui.regionHead}>
          <h2 id="pd-hours" className={ui.regionTitle}>
            시간 칸
          </h2>
          <p className={ui.regionNote}>마일스톤 예상 시간이 빈 칸, 기록한 시간이 채운 칸이에요.</p>
        </div>
        <HourCellsBar estimatedHours={project.estimatedHours} trackedMinutes={project.trackedMinutes} maxCells={96} size={14} />
      </section>

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="pd-milestones">
          <div className={ui.regionHead}>
            <h2 id="pd-milestones" className={ui.regionTitle}>
              마일스톤
            </h2>
            <p className={ui.regionNote}>
              {project.milestonesDone}/{project.milestonesTotal} 완료
            </p>
          </div>
          <Milestones projectId={project.id} milestones={data.milestones} today={today} />
        </section>

        <section className={ui.region} aria-labelledby="pd-time">
          <div className={ui.regionHead}>
            <h2 id="pd-time" className={ui.regionTitle}>
              시간 기록
            </h2>
          </div>
          <div className={styles.entryForm}>
            <EntryForm projects={pickers} today={today} fixedProjectId={project.id} compact />
          </div>
          {data.entries.length === 0 ? (
            <EmptyState title="아직 기록한 시간이 없어요">아래 타이머로 시작하거나 위 양식으로 지난 작업을 기록하세요.</EmptyState>
          ) : (
            <>
              <EntryList entries={data.entries.slice(0, 8)} projects={pickers} today={today} showProject={false} />
              {data.entries.length > 8 ? (
                <Link href={`${BASE}/time?project=${project.id}&range=all`} className={ui.textLink}>
                  이 프로젝트의 기록 모두 보기 <ArrowRight size={14} aria-hidden="true" />
                </Link>
              ) : null}
            </>
          )}
        </section>
      </div>

      <section className={ui.region} aria-labelledby="pd-docs">
        <div className={ui.regionHead}>
          <h2 id="pd-docs" className={ui.regionTitle}>
            견적서 · 인보이스
          </h2>
        </div>
        {data.estimates.length + data.invoices.length === 0 ? (
          <EmptyState
            title="연결된 문서가 없어요"
            action={
              <Link href={`${BASE}/estimates/new?${query}`} className={buttonClass("secondary", { small: true })}>
                견적서 만들기
              </Link>
            }
          >
            이 프로젝트로 견적서를 만들면 수락 후 인보이스로 바꿀 수 있어요.
          </EmptyState>
        ) : (
          <DocumentRows estimates={data.estimates} invoices={data.invoices} today={today} />
        )}
      </section>

      {project.description ? (
        <section className={ui.region} aria-labelledby="pd-memo">
          <h2 id="pd-memo" className={ui.regionTitle}>
            메모
          </h2>
          <p className={styles.memo}>{project.description}</p>
        </section>
      ) : null}
    </div>
  );
}
