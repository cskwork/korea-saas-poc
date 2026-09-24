import type { Metadata } from "next";
import { MeetupsPage } from "@/pocs/niche-community/components/MeetupsPage";
import { getMeetupsPage } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: "모임",
  description: "월간 데모데이, 토요일 모각작, 프리미엄 오피스아워. 다가오는 모임에 참석 신청하고 지난 모임 기록을 봅니다.",
};

export default async function NicheCommunityMeetupsPage() {
  return <MeetupsPage data={await getMeetupsPage()} />;
}
