import type { Metadata } from "next";
import { LetterPost } from "@/pocs/newsletter-community/components/letter/LetterBoard";
import { excerpt } from "@/pocs/newsletter-community/domain/markup";
import { getPostDetail } from "@/pocs/newsletter-community/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await getPostDetail("letter", (await params).id);
  return { title: `${post.title} · 독자 마당`, description: excerpt(post.body, 120) };
}

export default async function LetterPostPage({ params }: Props) {
  const { post, actor } = await getPostDetail("letter", (await params).id);
  return <LetterPost post={post} actor={actor} />;
}
