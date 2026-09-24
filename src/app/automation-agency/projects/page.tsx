import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { param } from "@/pocs/automation-agency/components/params";
import { ProjectFilters, ProjectTable } from "@/pocs/automation-agency/components/projects/ProjectList";
import { parseProjectFilter } from "@/pocs/automation-agency/components/projects/params";
import { buttonClass } from "@/pocs/automation-agency/components/ui/classes";
import { Notice } from "@/pocs/automation-agency/components/ui/Notice";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import ui from "@/pocs/automation-agency/components/ui/ui.module.css";
import { fetchProjects } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "고객 자동화 프로젝트를 대기부터 유지보수까지 역별로 관리하고 마감과 유지보수 상태를 확인하세요.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = parseProjectFilter(params);
  const { projects, counts } = await fetchProjects(filter);
  return (
    <>
      <PageHeader
        title="프로젝트"
        lede="수주한 자동화를 역마다 한 칸씩 전진시켜요. 배포를 마치면 유지보수 순환선에 합류해요."
        actions={
          <Link href="/automation-agency/projects/new" className={buttonClass("primary")}>
            <Plus size={16} aria-hidden="true" />새 프로젝트
          </Link>
        }
      />
      {param(params, "deleted") === "1" ? (
        <Notice tone="ok" className={ui.noticeGap}>
          프로젝트를 삭제했어요.
        </Notice>
      ) : null}
      <ProjectFilters filter={filter} counts={counts} />
      <ProjectTable projects={projects} filter={filter} />
    </>
  );
}
