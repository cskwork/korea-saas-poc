"use client";

import { BookNotice } from "@/pocs/micro-saas/components/book/BookNotice";
import { ErrorSheet } from "@/pocs/micro-saas/components/world/Fallbacks";

export default function BookError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <BookNotice>
      <ErrorSheet retry={retry} digest={error.digest} />
    </BookNotice>
  );
}
