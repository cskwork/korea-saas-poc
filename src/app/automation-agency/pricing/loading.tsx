import { TableSkeleton } from "@/pocs/automation-agency/components/shell/Skeletons";

export default function Loading() {
  return <TableSkeleton label="요금제를 불러오는 중이에요" rows={3} />;
}
