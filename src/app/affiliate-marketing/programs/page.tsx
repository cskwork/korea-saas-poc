import type { Metadata } from "next";
import { ProgramsScreen } from "@/pocs/affiliate-marketing/components/programs/ProgramsScreen";
import { flag } from "@/pocs/affiliate-marketing/server/params";
import { getProgramComparison } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "제휴 프로그램 비교",
  description: "쿠팡 파트너스, 텐핑, 네이버 애드포스트 등 제휴 프로그램의 조건과 실제 측정된 성과를 나란히 비교하세요.",
};

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const report = await getProgramComparison();
  return <ProgramsScreen report={report} saved={flag(params, "saved")} deleted={flag(params, "deleted")} />;
}
