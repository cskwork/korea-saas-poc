"use client";

import { ErrorState } from "@/pocs/automation-agency/components/shell/ErrorState";

export default function AutomationAgencyError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorState error={error} retry={retry} />;
}
