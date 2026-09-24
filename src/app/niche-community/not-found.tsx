import type { Metadata } from "next";
import { NotFoundSlide } from "@/pocs/niche-community/components/NotFoundSlide";

export const metadata: Metadata = { title: "찾을 수 없어요" };

export default function NicheCommunityNotFound() {
  return <NotFoundSlide />;
}
