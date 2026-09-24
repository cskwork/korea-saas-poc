import type { Metadata } from "next";
import { MembershipPage } from "@/pocs/niche-community/components/MembershipPage";
import { getMembershipPage } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  title: "멤버십",
  description: "무료와 프리미엄(월 9,900원) 플랜 비교. 프리미엄은 대외비 채널과 멤버 전용 모임을 엽니다. 결제는 데모 기록으로만 남습니다.",
};

export default async function NicheCommunityMembershipPage() {
  return <MembershipPage data={await getMembershipPage()} />;
}
