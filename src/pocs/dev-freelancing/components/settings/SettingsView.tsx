import { RotateCcw } from "lucide-react";
import { resetDemo } from "../../server/actions";
import type { Profile } from "../../server/data/profile";
import { ActionButton } from "../ui/ActionButton";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { SettingsForm } from "./SettingsForm";
import styles from "./Settings.module.css";

export function SettingsView({ profile }: { profile: Profile }) {
  return (
    <div className={styles.page}>
      <PageHeader title="설정" description="바꾼 값은 새로 만드는 문서부터 적용돼요. 이미 만든 견적서와 인보이스는 그대로예요." />
      <SettingsForm profile={profile} />
      <section className={styles.reset} aria-labelledby="st-reset">
        <h2 id="st-reset" className={ui.regionTitle}>
          데모 데이터 초기화
        </h2>
        <p className={ui.muted}>
          이 작업공간의 고객, 프로젝트, 문서, 시간 기록을 모두 지우고 처음의 샘플 데이터로 되돌려요. 다른 방문자의 작업공간에는 영향이 없어요.
        </p>
        <ActionButton action={resetDemo} payload={{}} variant="danger" confirm="지금까지 바꾼 내용이 모두 사라져요. 초기화할까요?" confirmLabel="초기화" pendingLabel="되돌리는 중…">
          <RotateCcw size={14} aria-hidden="true" />
          샘플 데이터로 되돌리기
        </ActionButton>
      </section>
    </div>
  );
}
