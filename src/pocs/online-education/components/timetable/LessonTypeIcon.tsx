import { CircleHelp, FileText, Play } from "lucide-react";
import type { LessonType } from "../../db/schema";

const ICONS = { video: Play, text: FileText, quiz: CircleHelp } as const;

export function LessonTypeIcon({ type, size = 13 }: { type: LessonType; size?: number }) {
  const Icon = ICONS[type];
  return <Icon size={size} strokeWidth={2.2} aria-hidden />;
}
