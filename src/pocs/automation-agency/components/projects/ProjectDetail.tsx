import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate, formatKrw } from "@/core/format";
import { INDUSTRY_LABEL } from "../../domain/labels";
import type { ProjectDetail as ProjectData } from "../../server/data/projects";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { Notice } from "../ui/Notice";
import { PageHeader, SectionHead } from "../ui/PageHeader";
import { LineBadge, MaintenanceTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import { DeleteProject } from "./DeleteProject";
import { MaintenanceControls } from "./MaintenanceControls";
import { ProjectForm, type PackageChoice } from "./ProjectForm";
import { StageLine } from "./StageLine";
import styles from "./projects.module.css";

const day = (value: string | null) => (value ? formatDate(`${value}T00:00:00+09:00`) : "—");

export function ProjectDetail({
  project,
  packages,
  flash,
}: {
  project: ProjectData;
  packages: PackageChoice[];
  flash?: string;
}) {
  return (
    <>
      <PageHeader
        back={{ href: `${BASE_PATH}/projects`, label: "프로젝트 목록" }}
        title={project.clientName}
        lede={`${INDUSTRY_LABEL[project.industry]} · ${project.packages.length > 0 ? project.packages.map((p) => p.name).join(", ") : "패키지 미지정"}`}
      />
      {flash ? (
        <Notice tone="ok" className={ui.noticeGap}>
          {flash}
        </Notice>
      ) : null}

      <StageLine id={project.id} stage={project.stage} />

      <div className={styles.detailGrid}>
        <section aria-labelledby="pj-facts">
          <SectionHead id="pj-facts" title="운행 정보" />
          <dl className={ui.facts}>
            <div className={ui.fact}>
              <dt>구축비</dt>
              <dd>{formatKrw(project.setupFee)}</dd>
            </div>
            <div className={ui.fact}>
              <dt>월 유지보수비</dt>
              <dd>{formatKrw(project.monthlyFee)}</dd>
            </div>
            <div className={ui.fact}>
              <dt>담당</dt>
              <dd>{project.assignee || "미배정"}</dd>
            </div>
            <div className={ui.fact}>
              <dt>기간</dt>
              <dd className={styles.small}>
                {day(project.startDate)} ~ {day(project.dueDate)}
              </dd>
            </div>
          </dl>
          {project.notes ? <p className={styles.notes}>{project.notes}</p> : null}
          {project.quote ? (
            <p className={styles.linkLine}>
              견적{" "}
              <Link href={`${BASE_PATH}/quotes/${project.quote.id}`} className={ui.textLink}>
                {project.quote.number}
              </Link>
              에서 전환한 프로젝트예요.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="pj-maint" className={ui.panelMuted}>
          <h2 id="pj-maint" className={ui.sectionTitle}>
            유지보수 순환선
          </h2>
          <p className={styles.maintLine}>
            <MaintenanceTag status={project.maintenanceStatus} />
            {project.maintenanceStartedOn ? <span>시작 {day(project.maintenanceStartedOn)}</span> : null}
            {project.maintenanceEndedOn ? <span>종료 {day(project.maintenanceEndedOn)}</span> : null}
          </p>
          <p className={ui.hint}>운행 중일 때만 월 {formatKrw(project.monthlyFee)}이 정기 수익(MRR)에 들어가요.</p>
          <MaintenanceControls id={project.id} status={project.maintenanceStatus} />
        </section>
      </div>

      <section className={ui.section} aria-labelledby="pj-wf">
        <SectionHead id="pj-wf" title="워크플로">
          <Link
            href={`${BASE_PATH}/workflows?project=${project.id}`}
            className={buttonClass("secondary", { small: true })}
          >
            <Plus size={15} aria-hidden="true" />
            워크플로 만들기
          </Link>
        </SectionHead>
        {project.workflows.length === 0 ? (
          <p className={ui.muted}>이 프로젝트에 연결된 워크플로가 없어요.</p>
        ) : (
          <ul className={styles.wfList}>
            {project.workflows.map((w) => (
              <li key={w.id}>
                <LineBadge platform={w.platform} showLabel={false} />
                <Link href={`${BASE_PATH}/workflows/${w.id}`} className={ui.rowLink}>
                  {w.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={ui.section} aria-labelledby="pj-edit">
        <SectionHead id="pj-edit" title="프로젝트 수정" />
        <ProjectForm
          key={project.updatedAt.toISOString()}
          packages={packages}
          values={{
            id: project.id,
            clientName: project.clientName,
            industry: project.industry,
            stage: project.stage,
            progress: project.progress,
            assignee: project.assignee,
            startDate: project.startDate,
            dueDate: project.dueDate,
            notes: project.notes,
            packageIds: project.packages.map((p) => p.id),
            setupFee: project.setupFee,
            monthlyFee: project.monthlyFee,
            maintenanceStatus: project.maintenanceStatus,
            maintenanceStartedOn: project.maintenanceStartedOn,
          }}
        />
      </section>

      <section className={ui.section} aria-labelledby="pj-danger">
        <SectionHead id="pj-danger" title="프로젝트 관리" />
        <DeleteProject id={project.id} clientName={project.clientName} />
      </section>
    </>
  );
}
