"use client";

import { SegmentError } from "@/pocs/smart-store/components/ui/SegmentError";

export default function SmartStoreError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <SegmentError error={error} retry={retry} />;
}
