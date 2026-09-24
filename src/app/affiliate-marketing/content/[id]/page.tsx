import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleScreen } from "@/pocs/affiliate-marketing/components/content/ArticleScreen";
import { flag, isUuid } from "@/pocs/affiliate-marketing/server/params";
import { getArticleDetail } from "@/pocs/affiliate-marketing/server/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = isUuid(id) ? await getArticleDetail(id) : null;
  return article ? { title: article.title, description: "보관함에 저장한 콘텐츠 초안을 고치고 복사하세요." } : { title: "초안을 찾을 수 없어요" };
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const article = await getArticleDetail(id);
  if (!article) notFound();
  const query = await searchParams;
  return <ArticleScreen article={article} created={flag(query, "created")} fellBack={flag(query, "fallback")} />;
}
