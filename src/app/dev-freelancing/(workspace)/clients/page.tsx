import type { Metadata } from "next";
import { ClientList } from "@/pocs/dev-freelancing/components/clients/ClientList";
import { CLIENT_GRADES, type ClientGrade } from "@/pocs/dev-freelancing/domain/labels";
import type { ClientSort } from "@/pocs/dev-freelancing/server/data/clients";
import { getClients } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "고객",
  description: "고객별 누적 입금, 받을 돈, 진행 중인 프로젝트와 최근 활동을 한눈에 봅니다.",
};

const SORTS: ClientSort[] = ["recent", "revenue", "name"];

type Search = { q?: string; grade?: string; sort?: string };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 60);
  const grade = CLIENT_GRADES.includes(params.grade as ClientGrade) ? (params.grade as ClientGrade) : "";
  const sort = SORTS.includes(params.sort as ClientSort) ? (params.sort as ClientSort) : "recent";
  const { clients, all } = await getClients({ q, grade: grade || undefined, sort });
  return <ClientList clients={clients} all={all} filter={{ q, grade, sort }} />;
}
