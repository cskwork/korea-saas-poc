import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberPage } from "@/pocs/niche-community/components/MemberPage";
import { getMemberPage } from "@/pocs/niche-community/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getMemberPage((await params).id);
  if (!data) notFound();
  const { member, earned } = data.profile;
  return {
    title: `${member.nickname}의 프로필`,
    description: `${member.headline || "스타트업 빌더스 멤버"} · 뱃지 ${earned.length}개`,
  };
}

export default async function NicheCommunityMemberPage({ params }: Props) {
  const data = await getMemberPage((await params).id);
  if (!data) notFound();
  return <MemberPage data={data} />;
}
