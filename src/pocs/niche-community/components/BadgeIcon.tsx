import { Flag, Flame, Footprints, Gem, MapPin, MessagesSquare, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import type { BadgeKey } from "../domain/badges";

const ICONS: Record<BadgeKey, LucideIcon> = {
  operator: ShieldCheck,
  premium: Gem,
  founder: Flag,
  firstPost: Footprints,
  writer: PenLine,
  popular: Flame,
  commenter: MessagesSquare,
  regular: MapPin,
};

export function BadgeIcon({ badge, size = 16, className }: { badge: BadgeKey; size?: number; className?: string }) {
  const Icon = ICONS[badge];
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
