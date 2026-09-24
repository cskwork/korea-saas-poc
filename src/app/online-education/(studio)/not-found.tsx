import { NotFoundState } from "@/pocs/online-education/components/states/NotFoundState";

export default function StudioNotFound() {
  return (
    <NotFoundState
      title="찾는 화면이 없어요"
      text="주소가 바뀌었거나 삭제된 항목일 수 있어요. 시간표에서 다시 찾아봐 주세요."
      href="/online-education"
      action="시간표로 가기"
    />
  );
}
