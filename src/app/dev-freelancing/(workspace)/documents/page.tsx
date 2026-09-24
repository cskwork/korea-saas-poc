import type { Metadata } from "next";
import { DocumentsList } from "@/pocs/dev-freelancing/components/documents/DocumentsList";
import { getDocuments } from "@/pocs/dev-freelancing/server/queries";

export const metadata: Metadata = {
  title: "견적 · 청구",
  description: "견적서와 인보이스를 상태별로 모아 보고, 받을 돈과 답을 기다리는 견적을 확인합니다.",
};

type Search = { tab?: string; status?: string };

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [params, data] = await Promise.all([searchParams, getDocuments()]);
  const tab = params.tab === "invoices" ? "invoices" : "estimates";
  return <DocumentsList tab={tab} status={params.status ?? ""} estimates={data.estimates} invoices={data.invoices} today={data.today} />;
}
