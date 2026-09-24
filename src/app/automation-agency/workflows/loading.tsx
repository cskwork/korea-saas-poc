import { TableSkeleton } from "@/pocs/automation-agency/components/shell/Skeletons";

export default function Loading() {
  return <TableSkeleton label="워크플로를 불러오는 중이에요" rows={4} />;
}
