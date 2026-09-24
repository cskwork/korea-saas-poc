import { NotFoundView } from "@/pocs/dev-freelancing/components/ui/NotFoundView";

export default function ProjectNotFound() {
  return <NotFoundView title="프로젝트를 찾을 수 없어요" href="/dev-freelancing/projects" back="프로젝트 보드로" />;
}
