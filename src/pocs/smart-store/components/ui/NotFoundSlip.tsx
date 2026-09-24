import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { EmptyState } from "./EmptyState";
import ui from "./ui.module.css";

/** 404 inside the module: the id is unknown, or belongs to another workspace. */
export function NotFoundSlip({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className={ui.slip}>
      <EmptyState
        title={title}
        action={
          <Link href={href} className={clsx(ui.btn, ui.btnPop)}>
            <ArrowLeft size={16} strokeWidth={2} aria-hidden />
            {linkLabel}
          </Link>
        }
      >
        삭제되었거나 주소가 잘못되었어요. 데모 데이터를 초기화하면 이전에 보던 항목의 주소가 바뀌어요.
      </EmptyState>
    </div>
  );
}
