import Link from "next/link";
import ui from "./ui.module.css";

export function NotFoundSlide() {
  return (
    <div className={`${ui.page} ${ui.pageNarrow}`}>
      <section className={ui.stageSlide} aria-labelledby="nc-missing-title">
        <h1 id="nc-missing-title" className={ui.stageSlideTitle}>
          찾는 슬라이드가 없어요
        </h1>
        <p className={ui.stageSlideText}>
          삭제된 글이나 모임, 또는 이 커뮤니티에 없는 멤버일 수 있어요. 데모 데이터를 초기화했다면 주소가 바뀌었을 거예요.
        </p>
        <div className={ui.stageSlideActions}>
          <Link href="/niche-community" className={`${ui.button} ${ui.stageSlidePrimary}`}>
            피드로 가기
          </Link>
          <Link href="/niche-community/meetups" className={`${ui.button} ${ui.stageSlideSecondary}`}>
            모임 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
