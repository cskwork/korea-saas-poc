import type { Metadata } from "next";
import { Desk } from "@/pocs/newsletter-community/components/desk/Desk";
import { getDesk } from "@/pocs/newsletter-community/server/queries";

export const metadata: Metadata = {
  title: "편집실",
  description: "다음 호의 표지, 발행 목차, 판권과 발행 부수를 한 화면에서 봅니다.",
};

export default async function DeskPage() {
  const desk = await getDesk();
  return <Desk desk={desk} />;
}
