import type { Metadata } from "next";
import { ProjectDetail } from "@/pocs/dev-freelancing/components/projects/ProjectDetail";
import { getProject, getShell } from "@/pocs/dev-freelancing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await getProject((await params).id);
  return { title: project.title, description: `${project.title}의 마일스톤, 시간 기록, 견적서와 인보이스.` };
}

export default async function ProjectPage({ params }: Props) {
  const [detail, shell] = await Promise.all([getProject((await params).id), getShell()]);
  return <ProjectDetail data={detail} clients={detail.clients} pickers={shell.projects} today={detail.today} />;
}
