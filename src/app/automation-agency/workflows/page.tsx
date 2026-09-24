import type { Metadata } from "next";
import { param, parseId } from "@/pocs/automation-agency/components/params";
import { Notice } from "@/pocs/automation-agency/components/ui/Notice";
import { PageHeader, SectionHead } from "@/pocs/automation-agency/components/ui/PageHeader";
import ui from "@/pocs/automation-agency/components/ui/ui.module.css";
import styles from "@/pocs/automation-agency/components/workflows/builder.module.css";
import { NewWorkflowForm } from "@/pocs/automation-agency/components/workflows/NewWorkflowForm";
import { WorkflowList } from "@/pocs/automation-agency/components/workflows/WorkflowList";
import { fetchProjectOptions, fetchWorkflows } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "워크플로",
  description: "Make, Zapier, n8n, Apps Script 자동화 흐름을 노선도처럼 설계하고 프로젝트별로 저장하세요.",
};

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [workflows, projects] = await Promise.all([fetchWorkflows(), fetchProjectOptions()]);
  return (
    <>
      <PageHeader
        title="워크플로"
        lede="자동화 흐름을 노선도로 그려요. 트리거가 출발역, 액션이 정차역, 조건이 환승역이에요."
      />
      {param(params, "deleted") === "1" ? (
        <Notice tone="ok" className={ui.noticeGap}>
          워크플로를 삭제했어요.
        </Notice>
      ) : null}
      <div className={styles.listGrid}>
        <section aria-labelledby="wf-list-title">
          <SectionHead id="wf-list-title" title="노선 목록" note={`${workflows.length}개`} />
          <WorkflowList workflows={workflows} />
        </section>
        <section aria-labelledby="wf-new-title" className={ui.panelMuted}>
          <h2 id="wf-new-title" className={ui.sectionTitle}>
            새 워크플로
          </h2>
          <NewWorkflowForm projects={projects} defaultProjectId={parseId(param(params, "project") ?? "")} />
        </section>
      </div>
    </>
  );
}
