import { ListSkeleton } from "@/pocs/newsletter-community/components/shell/ListSkeleton";

export default function Loading() {
  return <ListSkeleton label="수입 장부를 불러오는 중" rows={8} />;
}
