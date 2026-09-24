import { formatDate } from "@/core/format";
import { ARTICLE_KIND_LABEL, CONTENT_SOURCE_LABEL } from "../../domain/catalog";
import type { ArticleRecord } from "../../server/content";
import { Band, Chip, Page, ui } from "../ui/primitives";
import { DraftWorkbench } from "./DraftWorkbench";
import styles from "./content.module.css";

export function ArticleScreen({ article, created, fellBack }: { article: ArticleRecord; created: boolean; fellBack: boolean }) {
  return (
    <>
      <Band title={article.title} back={{ href: "/affiliate-marketing/content", label: "콘텐츠 보관함" }}>
        <p className={styles.entryMeta}>
          <Chip tone="ink">{ARTICLE_KIND_LABEL[article.kind]}</Chip>
          <Chip tone={article.source === "claude" ? "solid" : "muted"}>{CONTENT_SOURCE_LABEL[article.source]}</Chip>
          <span>
            {formatDate(article.createdAt)} 작성 · {formatDate(article.updatedAt, { dateStyle: "medium", timeStyle: "short" })} 수정
          </span>
        </p>
      </Band>
      <Page>
        {created ? (
          <p role="status" className={`${ui.noticeOk} ${ui.stamp}`}>
            {article.source === "claude" ? "Claude가 초안을 썼어요." : "기본 템플릿으로 초안을 만들었어요."} 보관함에 저장했으니 고친 뒤 복사해 쓰세요.
          </p>
        ) : null}
        {fellBack ? (
          <p role="status" className={ui.noticeInfo}>
            Claude 응답을 받지 못했거나 오늘 쓸 수 있는 AI 생성 횟수를 다 써서 기본 템플릿으로 만들었어요.
          </p>
        ) : null}
        <DraftWorkbench key={article.id} id={article.id} title={article.title} body={article.body} />
      </Page>
    </>
  );
}
