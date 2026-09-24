import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ui from "./ui.module.css";

export function PageHeader({
  title,
  lede,
  actions,
  back,
}: {
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className={ui.pageHead}>
      <div>
        {back ? (
          <Link href={back.href} className={ui.backLink}>
            <ChevronLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <h1 className={ui.title}>{title}</h1>
        {lede ? <p className={ui.lede}>{lede}</p> : null}
      </div>
      {actions ? <div className={ui.actions}>{actions}</div> : null}
    </header>
  );
}

export function SectionHead({
  title,
  note,
  id,
  children,
}: {
  title: string;
  note?: ReactNode;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className={ui.sectionHead}>
      <h2 className={ui.sectionTitle} id={id}>
        {title}
      </h2>
      {note ? <p className={ui.sectionNote}>{note}</p> : null}
      {children}
    </div>
  );
}
