import type { Metadata } from "next";
import { NewLinkScreen } from "@/pocs/affiliate-marketing/components/links/NewLinkScreen";
import { getNewLinkForm, shortLinkOrigin } from "@/pocs/affiliate-marketing/server/queries";

export const metadata: Metadata = {
  title: "새 링크 등록",
  description: "제휴 링크를 등록하고 클릭을 기록하는 짧은 링크를 만드세요.",
};

export default async function NewLinkPage() {
  const { programs } = await getNewLinkForm();
  return <NewLinkScreen programs={programs} origin={shortLinkOrigin()} />;
}
