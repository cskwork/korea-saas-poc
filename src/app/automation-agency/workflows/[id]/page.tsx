import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseId } from "@/pocs/automation-agency/components/params";
import { PageHeader, SectionHead } from "@/pocs/automation-agency/components/ui/PageHeader";
import ui from "@/pocs/automation-agency/components/ui/ui.module.css";
import { Builder } from "@/pocs/automation-agency/components/workflows/Builder";
import { DeleteWorkflow } from "@/pocs/automation-agency/components/workflows/DeleteWorkflow";
import { fetchProjectOptions, fetchWorkflow } from "@/pocs/automation-agency/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const workflow = id ? await fetchWorkflow(id) : undefined;
  return workflow
    ? { title: `${workflow.name} · 워크플로`, description: workflow.description || "워크플로 노선도 편집" }
    : { title: "워크플로를 찾을 수 없어요" };
}

export default async function WorkflowPage({ params }: Props) {
  const id = parseId((await params).id);
  const [workflow, projects] = await Promise.all([id ? fetchWorkflow(id) : undefined, fetchProjectOptions()]);
  if (!workflow) notFound();
  return (
    <>
      <PageHeader back={{ href: "/automation-agency/workflows", label: "워크플로 목록" }} title="노선도 편집" />
      <Builder
        workflow={{
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          platform: workflow.platform,
          projectId: workflow.projectId,
          graph: workflow.graph,
        }}
        projects={projects}
      />
      <section className={ui.section} aria-labelledby="wf-danger">
        <SectionHead id="wf-danger" title="노선 관리" />
        <DeleteWorkflow id={workflow.id} />
      </section>
    </>
  );
}
