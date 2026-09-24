import { NotFoundState } from "@/pocs/online-education/components/states/NotFoundState";

export default function StudentNotFound() {
  return (
    <NotFoundState
      title="이 수강생을 찾을 수 없어요"
      text="정보가 삭제되었거나 다른 스쿨의 수강생일 수 있어요."
      href="/online-education/students"
      action="수강생 목록으로"
    />
  );
}
