import clsx from "clsx";
import { ISSUE_STATUS_LABEL, type IssueStatus } from "../../domain/issues";
import ui from "../ui/ui.module.css";

/** 초안 is dashed (unfinished), 발행 예약 outlined, 발행 solid ink. */
export function StatusTag({ status }: { status: IssueStatus }) {
  return (
    <span className={clsx(ui.tag, status === "published" && ui.tagSolid, status === "draft" && ui.tagDashed)}>
      {ISSUE_STATUS_LABEL[status]}
    </span>
  );
}
