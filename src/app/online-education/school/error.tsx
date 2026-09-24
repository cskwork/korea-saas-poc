"use client";

import { ErrorState } from "@/pocs/online-education/components/states/ErrorState";

export default function SchoolError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState error={error} retry={retry} title="스쿨 페이지를 불러오지 못했어요" />;
}
