import type { Metadata } from "next";
import { aiStatus } from "@/core/ai";
import { SocialScreen } from "@/pocs/affiliate-marketing/components/content/SocialScreen";
import { getSocialHome } from "@/pocs/affiliate-marketing/server/queries";

/** Post generation may call Claude from this page's server action. */
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "SNS 게시물",
  description: "인스타그램, 블로그, X, 스레드용 제휴 게시물을 채널 태그가 붙은 짧은 링크와 함께 한 번에 만드세요.",
};

export default async function SocialPage() {
  const { posts, options } = await getSocialHome();
  return <SocialScreen posts={posts} options={options} aiEnabled={aiStatus().enabled} />;
}
