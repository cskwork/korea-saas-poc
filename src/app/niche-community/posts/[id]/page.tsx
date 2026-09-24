import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostPage } from "@/pocs/niche-community/components/PostPage";
import { getPostPage } from "@/pocs/niche-community/server/queries";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const data = await getPostPage((await params).id, await searchParams);
  if (!data) notFound();
  return {
    title: data.post.title,
    description: data.post.locked
      ? `${data.post.channel.name} · 프리미엄 멤버에게 공개된 글`
      : (data.post.body ?? "").replace(/\s+/g, " ").slice(0, 120),
  };
}

export default async function NicheCommunityPostPage({ params, searchParams }: Props) {
  const data = await getPostPage((await params).id, await searchParams);
  if (!data) notFound();
  return <PostPage data={data} />;
}
