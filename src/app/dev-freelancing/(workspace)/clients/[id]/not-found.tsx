import { NotFoundView } from "@/pocs/dev-freelancing/components/ui/NotFoundView";

export default function ClientNotFound() {
  return <NotFoundView title="고객을 찾을 수 없어요" href="/dev-freelancing/clients" back="고객 목록으로" />;
}
