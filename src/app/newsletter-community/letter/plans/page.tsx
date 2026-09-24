import type { Metadata } from "next";
import { PlansPage } from "@/pocs/newsletter-community/components/letter/PlansPage";
import { getLetterPlans } from "@/pocs/newsletter-community/server/queries";

export const metadata: Metadata = {
  title: "구독 안내",
  description: "무료·베이직·프로 구독료와 혜택을 비교하고 정기구독을 신청합니다.",
};

export default async function LetterPlansPage() {
  const { publication, plans, reader } = await getLetterPlans();
  return <PlansPage publication={publication} plans={plans} reader={reader} />;
}
