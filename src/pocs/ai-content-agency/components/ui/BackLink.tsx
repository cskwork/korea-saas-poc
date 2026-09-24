import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./ui.module.css";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.back}>
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
