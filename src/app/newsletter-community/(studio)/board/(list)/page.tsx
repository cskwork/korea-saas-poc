import type { Metadata } from "next";
import { BoardList } from "@/pocs/newsletter-community/components/board/BoardList";
import { PageHeader } from "@/pocs/newsletter-community/components/shell/PageHeader";
import { getBoard } from "@/pocs/newsletter-community/server/queries";
import { boardQuery } from "@/pocs/newsletter-community/server/schemas";

export const metadata: Metadata = {
  title: "독자 마당",
  description: "유료 구독자와 나누는 게시판. 공지를 올리고, 글을 고정하고, 댓글로 답합니다.",
};

export default async function StudioBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = boardQuery.parse(await searchParams);
  const { posts, counts, actor } = await getBoard("studio", category);
  return (
    <>
      <PageHeader
        title="독자 마당"
        lead="유료 구독자가 글을 쓰고 모두가 읽는 게시판이에요. 에디터는 공지를 쓰고, 글을 맨 위에 고정하거나 지울 수 있어요."
      />
      <BoardList base="/newsletter-community/board" as="editor" posts={posts} counts={counts} category={category} actor={actor} />
    </>
  );
}
