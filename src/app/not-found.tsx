import type { Metadata } from "next";
import { NotFoundPage } from "@/hub/NotFoundPage";

export const metadata: Metadata = { title: "찾는 가게가 없어요" };

export default function NotFound() {
  return <NotFoundPage />;
}
