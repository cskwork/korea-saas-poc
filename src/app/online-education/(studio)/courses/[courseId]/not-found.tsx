import { NotFoundState } from "@/pocs/online-education/components/states/NotFoundState";

export default function CourseNotFound() {
  return (
    <NotFoundState
      title="이 강의를 찾을 수 없어요"
      text="삭제되었거나 다른 스쿨의 강의일 수 있어요. 강의 목록에서 다시 골라 주세요."
      href="/online-education/courses"
      action="강의 목록으로"
    />
  );
}
