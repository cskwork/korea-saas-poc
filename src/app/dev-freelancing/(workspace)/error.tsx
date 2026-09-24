"use client";

import { ErrorView } from "@/pocs/dev-freelancing/components/ui/ErrorView";

export default function WorkspaceError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorView {...props} />;
}
