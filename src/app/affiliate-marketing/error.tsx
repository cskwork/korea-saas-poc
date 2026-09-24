"use client";

import { ErrorPanel } from "@/pocs/affiliate-marketing/components/ui/ErrorPanel";

export default function AffiliateMarketingError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPanel error={error} retry={retry} />;
}
