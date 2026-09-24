import Link from "next/link";
import { BookNotice } from "@/pocs/micro-saas/components/book/BookNotice";

export default function ReceiptNotFound() {
  return (
    <BookNotice>
      <h1>접수 기록을 찾을 수 없어요</h1>
      <p>예약한 브라우저에서만 접수증을 다시 볼 수 있어요.</p>
      <Link href="/micro-saas/book">예약 페이지로</Link>
    </BookNotice>
  );
}
