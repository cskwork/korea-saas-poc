import type { Metadata } from "next";
import { EMPTY_PROJECT, ProjectForm } from "@/pocs/automation-agency/components/projects/ProjectForm";
import { PageHeader } from "@/pocs/automation-agency/components/ui/PageHeader";
import { fetchPackageOptions } from "@/pocs/automation-agency/server/queries";

export const metadata: Metadata = {
  title: "새 프로젝트",
  description: "고객 자동화 프로젝트를 등록합니다.",
};

export default async function NewProjectPage() {
  const packages = await fetchPackageOptions();
  return (
    <>
      <PageHeader
        back={{ href: "/automation-agency/projects", label: "프로젝트 목록" }}
        title="새 프로젝트"
        lede="고객과 패키지, 일정을 정하면 대기 역에서 출발해요."
      />
      <ProjectForm values={EMPTY_PROJECT} packages={packages} />
    </>
  );
}
