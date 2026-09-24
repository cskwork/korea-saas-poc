import type { ProgramRow } from "../../server/programs";
import { Band, Page } from "../ui/primitives";
import { LinkForm } from "./LinkForm";
import styles from "./links.module.css";

export function NewLinkScreen({ programs, origin }: { programs: ProgramRow[]; origin: string }) {
  return (
    <>
      <Band
        title="새 링크 등록"
        back={{ href: "/affiliate-marketing/links", label: "링크 진열대" }}
        lead="제휴 프로그램에서 받은 링크를 등록하면, 클릭을 기록한 뒤 그 링크로 보내 주는 짧은 링크가 생겨요."
      />
      <Page>
        <div className={styles.formLayout}>
          <div className={styles.formPanel}>
            <LinkForm programs={programs} />
          </div>
          <aside className={styles.aside} aria-labelledby="how-it-works">
            <h2 id="how-it-works">짧은 링크는 이렇게 동작해요</h2>
            <ul>
              <li>
                방문자가 <b>{origin.replace(/^https?:\/\//, "")}/affiliate-marketing/go/코드</b>를 누르면 클릭을 기록하고 제휴 링크로
                이동시켜요.
              </li>
              <li>링크 끝에 채널 태그(예: ?c=ig)를 붙이면 인스타그램처럼 리퍼러가 없는 곳의 클릭도 채널별로 나뉘어요.</li>
              <li>SNS 미리보기 봇과 검색 로봇의 요청은 클릭으로 세지 않아요.</li>
              <li>한 번 만든 코드는 바꿀 수 없어요. 이미 글에 붙인 링크가 깨지지 않게 하기 위해서예요.</li>
            </ul>
          </aside>
        </div>
      </Page>
    </>
  );
}
