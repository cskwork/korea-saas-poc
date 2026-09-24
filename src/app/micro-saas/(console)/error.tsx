"use client";

import { ErrorSheet } from "@/pocs/micro-saas/components/world/Fallbacks";

export default function ConsoleError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorSheet retry={retry} digest={error.digest} />;
}
