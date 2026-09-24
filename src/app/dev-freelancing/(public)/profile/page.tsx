import type { Metadata } from "next";
import { PublicProfile } from "@/pocs/dev-freelancing/components/profile/PublicProfile";
import { getPublicProfile } from "@/pocs/dev-freelancing/server/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPublicProfile();
  return {
    title: `${profile.displayName} — 포트폴리오 · 요금 · 견적 문의`,
    description: profile.headline || "웹·앱 개발 프리랜서의 작업, 요금표와 견적 문의.",
  };
}

export default async function PublicProfilePage() {
  return <PublicProfile data={await getPublicProfile()} />;
}
