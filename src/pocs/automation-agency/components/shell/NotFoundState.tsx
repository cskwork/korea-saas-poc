import Link from "next/link";
import { EmptyLine } from "../ui/EmptyLine";
import { buttonClass } from "../ui/classes";
import { BASE_PATH } from "./stations";

export function NotFoundState() {
  return (
    <EmptyLine
      title="없는 역이에요"
      action={
        <Link href={BASE_PATH} className={buttonClass("primary")}>
          운행 현황으로
        </Link>
      }
    >
      삭제되었거나 주소가 바뀌었어요. 목록에서 다시 찾아 주세요.
    </EmptyLine>
  );
}
