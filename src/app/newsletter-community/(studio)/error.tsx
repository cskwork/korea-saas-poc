"use client";

import { ErrorPage } from "@/pocs/newsletter-community/components/shell/StatusPages";

export default function StudioError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorPage error={error} retry={retry} />;
}
