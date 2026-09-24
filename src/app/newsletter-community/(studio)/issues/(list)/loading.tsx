import { ListSkeleton } from "@/pocs/newsletter-community/components/shell/ListSkeleton";

export default function Loading() {
  return <ListSkeleton label="발행 목록을 불러오는 중" rows={8} />;
}
