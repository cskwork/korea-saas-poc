import type { Metadata } from "next";
import { LetterBoard } from "@/pocs/newsletter-community/components/letter/LetterBoard";
import { getBoard } from "@/pocs/newsletter-community/server/queries";
import { boardQuery } from "@/pocs/newsletter-community/server/schemas";

export const metadata: Metadata = {
  title: "독자 마당",
  description: "유료 구독자들이 일과 고민을 나누는 게시판입니다.",
};

export default async function LetterBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = boardQuery.parse(await searchParams);
  const board = await getBoard("letter", category);
  return <LetterBoard {...board} category={category} />;
}
