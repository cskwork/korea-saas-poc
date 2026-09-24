import type { Metadata } from "next";
import { PostView } from "@/pocs/newsletter-community/components/board/PostView";
import { excerpt } from "@/pocs/newsletter-community/domain/markup";
import { getPostDetail } from "@/pocs/newsletter-community/server/queries";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await getPostDetail("studio", (await params).id);
  return { title: `${post.title} · 독자 마당`, description: excerpt(post.body, 120) };
}

export default async function StudioPostPage({ params }: Props) {
  const { post, actor } = await getPostDetail("studio", (await params).id);
  return <PostView post={post} actor={actor} base="/newsletter-community/board" as="editor" />;
}
