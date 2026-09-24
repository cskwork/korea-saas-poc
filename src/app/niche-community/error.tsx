"use client";

import { ErrorSlide } from "@/pocs/niche-community/components/ErrorSlide";

export default function NicheCommunityError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorSlide digest={error.digest} onRetry={retry} />;
}
