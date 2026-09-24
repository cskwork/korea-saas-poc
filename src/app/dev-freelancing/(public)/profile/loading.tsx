import { PaperRoot } from "@/pocs/dev-freelancing/components/ModuleRoot";
import { PageSkeleton } from "@/pocs/dev-freelancing/components/ui/Skeleton";

export default function Loading() {
  return (
    <PaperRoot>
      <div style={{ padding: "48px 20px", maxWidth: 1160, margin: "0 auto" }}>
        <PageSkeleton variant="overview" />
      </div>
    </PaperRoot>
  );
}
