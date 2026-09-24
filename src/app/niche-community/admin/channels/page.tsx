import type { Metadata } from "next";
import { ChannelAdminPage } from "@/pocs/niche-community/components/ChannelAdminPage";
import { OperatorGate } from "@/pocs/niche-community/components/OperatorGate";
import { getChannelAdminPage, getOperatorPersona } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: "채널 관리",
  description: "커뮤니티 채널의 순서, 이름, 아이콘, 공개 범위를 관리하고 채널을 열거나 닫습니다.",
};

export default async function NicheCommunityChannelsAdminPage() {
  const page = await getChannelAdminPage();
  if (!page.operator) return <OperatorGate viewer={page.viewer} operator={await getOperatorPersona()} />;
  return <ChannelAdminPage channels={page.channels} now={page.now} />;
}
