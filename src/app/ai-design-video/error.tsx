"use client";

import { StudioError } from "@/pocs/ai-design-video/components/StudioError";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <StudioError error={error} retry={retry} />;
}
