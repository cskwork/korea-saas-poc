import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { param, parseId } from "@/pocs/automation-agency/components/params";
import { ProjectDetail } from "@/pocs/automation-agency/components/projects/ProjectDetail";
import { STAGE_LABEL } from "@/pocs/automation-agency/domain/stages";
import { fetchPackageOptions, fetchProject } from "@/pocs/automation-agency/server/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseId((await params).id);
  const project = id ? await fetchProject(id) : undefined;
  return project
    ? { title: `${project.clientName} · 프로젝트`, description: `${STAGE_LABEL[project.stage]} 단계의 자동화 프로젝트` }
    : { title: "프로젝트를 찾을 수 없어요" };
}

const FLASH: Record<string, string> = {
  saved: "프로젝트를 만들었어요. 대기 역에서 출발해요.",
  updated: "프로젝트를 저장했어요.",
  converted: "수락된 견적을 프로젝트로 옮겼어요. 일정과 담당자를 정해 주세요.",
};

export default async function ProjectPage({ params, searchParams }: Props) {
  const id = parseId((await params).id);
  const [project, packages, query] = await Promise.all([
    id ? fetchProject(id) : undefined,
    fetchPackageOptions(),
    searchParams,
  ]);
  if (!project) notFound();
  const flash = Object.keys(FLASH).find((key) => param(query, key) === "1");
  return <ProjectDetail project={project} packages={packages} flash={flash ? FLASH[flash] : undefined} />;
}
