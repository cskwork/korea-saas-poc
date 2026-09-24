import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditProgramScreen } from "@/pocs/affiliate-marketing/components/programs/ProgramEditScreens";
import { isUuid } from "@/pocs/affiliate-marketing/server/params";
import { getProgramDetail } from "@/pocs/affiliate-marketing/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const program = isUuid(id) ? await getProgramDetail(id) : null;
  return program ? { title: `${program.name} 조건`, description: `${program.name}의 수수료 구조와 정산 조건을 고치세요.` } : { title: "프로그램을 찾을 수 없어요" };
}

export default async function ProgramPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const program = await getProgramDetail(id);
  if (!program) notFound();
  return <EditProgramScreen program={program} />;
}
