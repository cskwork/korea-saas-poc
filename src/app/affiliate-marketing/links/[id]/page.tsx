import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkDetailScreen } from "@/pocs/affiliate-marketing/components/links/LinkDetailScreen";
import { flag, isUuid } from "@/pocs/affiliate-marketing/server/params";
import { getLinkDetail, getLinkName, shortLinkOrigin } from "@/pocs/affiliate-marketing/server/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const name = isUuid(id) ? await getLinkName(id) : null;
  return name
    ? { title: name, description: `${name} 제휴 링크의 클릭, 채널, 판매와 수수료 기록이에요.` }
    : { title: "링크를 찾을 수 없어요" };
}

export default async function LinkDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const detail = await getLinkDetail(id);
  if (!detail) notFound();
  const { programs, today, ...report } = detail;
  return (
    <LinkDetailScreen report={report} programs={programs} today={today} origin={shortLinkOrigin()} created={flag(await searchParams, "created")} />
  );
}
