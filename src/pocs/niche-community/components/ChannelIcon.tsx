import {
  BookOpen,
  Briefcase,
  ChartColumn,
  Code,
  Coffee,
  Coins,
  GraduationCap,
  Lightbulb,
  Megaphone,
  MessageCircle,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ChannelIconKey } from "../domain/inputs";

export const CHANNEL_ICON_COMPONENTS: Record<ChannelIconKey, LucideIcon> = {
  message: MessageCircle,
  rocket: Rocket,
  code: Code,
  megaphone: Megaphone,
  coins: Coins,
  graduation: GraduationCap,
  briefcase: Briefcase,
  users: Users,
  lightbulb: Lightbulb,
  chart: ChartColumn,
  book: BookOpen,
  coffee: Coffee,
};

export const CHANNEL_ICON_LABELS: Record<ChannelIconKey, string> = {
  message: "말풍선",
  rocket: "로켓",
  code: "코드",
  megaphone: "확성기",
  coins: "동전",
  graduation: "학사모",
  briefcase: "서류가방",
  users: "사람들",
  lightbulb: "전구",
  chart: "차트",
  book: "책",
  coffee: "커피",
};

export function ChannelIcon({ icon, size = 16, className }: { icon: ChannelIconKey; size?: number; className?: string }) {
  const Icon = CHANNEL_ICON_COMPONENTS[icon] ?? MessageCircle;
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
