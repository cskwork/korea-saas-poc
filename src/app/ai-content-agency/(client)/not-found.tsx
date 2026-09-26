import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";

export default function DeliveryNotFound() {
  return (
    <Empty title="이 납품서를 찾을 수 없어요.">
      <p>주소가 바뀌었거나 납품이 취소됐을 수 있어요. 보내 준 담당자에게 새 주소를 받아 주세요.</p>
    </Empty>
  );
}
