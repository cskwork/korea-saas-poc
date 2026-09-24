import type { Metadata } from "next";
import { FeedPage } from "@/pocs/niche-community/components/FeedPage";
import { meta } from "@/pocs/niche-community/meta";
import { getFeedPage } from "@/pocs/niche-community/server/queries";

export const metadata: Metadata = {
  // The layout's title template only applies to child segments, so the feed sets its own.
  title: { absolute: `${meta.name} · 초기 창업가 커뮤니티` },
  description: "초기 창업가들이 숫자와 경험으로 나누는 글. 채널별로 보고, 검색하고, 대외비 글은 프리미엄 멤버십으로 엽니다.",
};

export default async function NicheCommunityFeedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getFeedPage(await searchParams);
  return <FeedPage data={data} />;
}
