import { ListSkeleton } from "@/pocs/newsletter-community/components/shell/ListSkeleton";

export default function Loading() {
  return <ListSkeleton label="구독자 명부를 불러오는 중" rows={10} />;
}
