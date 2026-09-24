import type { ProgramRow } from "../../server/programs";
import { Band, Page } from "../ui/primitives";
import { DeleteProgram, ProgramForm } from "./ProgramForm";
import styles from "./programs.module.css";

const BACK = { href: "/affiliate-marketing/programs", label: "프로그램 비교" };

export function NewProgramScreen() {
  return (
    <>
      <Band title="프로그램 추가" back={BACK} lead="가입한 제휴 프로그램의 조건을 메모해 두면 링크를 만들 때 기본 수수료가 채워지고, 비교표에 성과가 쌓여요." />
      <Page>
        <div className={styles.formPanel}>
          <ProgramForm />
        </div>
      </Page>
    </>
  );
}

export function EditProgramScreen({ program }: { program: ProgramRow }) {
  return (
    <>
      <Band title={`${program.name} 조건`} back={BACK} lead="조건을 바꿔도 이미 만든 링크의 수수료는 그대로예요. 링크별 수수료는 링크 화면에서 바꾸세요." />
      <Page>
        <div className={styles.formPanel}>
          <ProgramForm program={program} />
        </div>
        <div className={styles.danger}>
          <p>연결된 링크가 있으면 삭제할 수 없어요. 링크를 다른 프로그램으로 옮긴 뒤 삭제하세요.</p>
          <DeleteProgram id={program.id} name={program.name} />
        </div>
      </Page>
    </>
  );
}
