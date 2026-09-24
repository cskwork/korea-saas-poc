import type { Metadata } from "next";
import { MembersPage } from "@/pocs/niche-community/components/MembersPage";
import { getMembersPage } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: "멤버",
  description: "스타트업 빌더스의 멤버들. 운영자, 프리미엄, 무료 멤버를 나눠 보고 이름이나 하는 일로 찾습니다.",
};

export default async function NicheCommunityMembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MembersPage data={await getMembersPage(await searchParams)} />;
}
