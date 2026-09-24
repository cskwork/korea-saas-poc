import type { Metadata } from "next";
import { BoardView } from "@/pocs/dev-freelancing/components/projects/BoardView";
import { getBoard } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "문의부터 완료까지, 프로젝트를 칸반 보드에서 끌어 옮기며 관리합니다.",
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ projects, clients, today }, params] = await Promise.all([getBoard(), searchParams]);
  return <BoardView projects={projects} clients={clients} today={today} openNew={params.new === "1"} />;
}
