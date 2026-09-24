import styles from "./ui.module.css";

/** Button content that swaps to a spinner and a pending label while an action runs. */
export function PendingLabel({ pending, idle, busy, icon }: { pending: boolean; idle: string; busy: string; icon?: React.ReactNode }) {
  return pending ? (
    <>
      <span className={styles.spinner} aria-hidden="true" />
      {busy}
    </>
  ) : (
    <>
      {icon}
      {idle}
    </>
  );
}
