"use client";

import { ErrorState } from "@/pocs/online-education/components/states/ErrorState";

export default function StudioError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorState error={error} retry={retry} />;
}
