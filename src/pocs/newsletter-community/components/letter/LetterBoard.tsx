import Link from "next/link";
import type { BoardActor, BoardCategory } from "../../domain/board";
import type { PostDetail, PostSummary } from "../../server/store/board";
import { BoardList } from "../board/BoardList";
import { PostView } from "../board/PostView";
import { buttonClass } from "../ui/button";
import { SampleReaderButton } from "./ReaderControls";
import styles from "./letter.module.css";

const BASE = "/newsletter-community/letter/board";

/** What a reader who cannot post sees instead of the composer. */
function Locked({ actor }: { actor: BoardActor | null }) {
  const message =
    actor?.role === "member"
      ? actor.active
        ? `${actor.name}님은 무료 구독 중이에요. 베이직 이상이면 글과 댓글을 쓸 수 있어요.`
        : `${actor.name}님의 구독은 해지된 상태예요. 다시 구독하면 글을 쓸 수 있어요.`
      : "누구나 읽을 수 있고, 베이직 이상 구독자는 글과 댓글을 쓸 수 있어요.";
  return (
    <div className={styles.lockedNotice}>
      <strong>독자 마당은 유료 구독자의 자리예요</strong>
      <p>{message}</p>
      <div className={styles.lockedActions}>
        <Link href="/newsletter-community/letter/plans#subscribe" className={buttonClass("primary", "sm")}>
          구독 안내
        </Link>
        <SampleReaderButton label="샘플 독자로 써 보기" />
      </div>
    </div>
  );
}

export function LetterBoard({
  posts,
  counts,
  actor,
  category,
}: {
  posts: PostSummary[];
  counts: Record<BoardCategory, number>;
  actor: BoardActor | null;
  category?: BoardCategory;
}) {
  return (
    <div className={styles.boardPage}>
      <header className={styles.plansHead}>
        <h1 className={styles.pageTitle}>독자 마당</h1>
        <p className={styles.pageLead}>에디터의 공지와 구독자들의 이야기, 질문이 모이는 곳이에요.</p>
      </header>
      <BoardList base={BASE} as="reader" posts={posts} counts={counts} category={category} actor={actor} locked={<Locked actor={actor} />} />
    </div>
  );
}

export function LetterPost({ post, actor }: { post: PostDetail; actor: BoardActor | null }) {
  return (
    <div className={styles.boardPage}>
      <PostView post={post} actor={actor} base={BASE} as="reader" locked={<Locked actor={actor} />} />
    </div>
  );
}
