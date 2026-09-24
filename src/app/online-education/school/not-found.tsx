import { NotFoundState } from "@/pocs/online-education/components/states/NotFoundState";

export default function SchoolNotFound() {
  return (
    <NotFoundState
      title="지금은 볼 수 없는 페이지예요"
      text="아직 공개되지 않았거나 판매가 끝난 강의·자료일 수 있어요."
      href="/online-education/school"
      action="스쿨 둘러보기"
    />
  );
}
