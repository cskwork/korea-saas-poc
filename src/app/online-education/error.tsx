"use client";

import { ErrorState } from "@/pocs/online-education/components/states/ErrorState";

export default function OnlineEducationError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState error={error} retry={retry} title="에듀마켓을 불러오지 못했어요" standalone />;
}
