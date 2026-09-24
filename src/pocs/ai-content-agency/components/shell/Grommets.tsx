import styles from "./shell.module.css";

/** The four eyelets punched through a banner's hem. The parent must be positioned. */
export function Grommets({ className }: { className?: string }) {
  return (
    <span className={className ? `${styles.grommets} ${className}` : styles.grommets} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
