import {
  Bot,
  CalendarClock,
  Database,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Globe,
  Mail,
  MessageCircle,
  MessagesSquare,
  Receipt,
  Send,
  ShoppingBag,
  Split,
  Store,
  Truck,
  Video,
  Webhook,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { AppId } from "../../domain/workflow";

const ICONS: Record<AppId, LucideIcon> = {
  schedule: CalendarClock,
  webhook: Webhook,
  gmail: Mail,
  google_forms: ClipboardList,
  sheets: FileSpreadsheet,
  drive: FolderOpen,
  slack: MessagesSquare,
  notion: FileText,
  kakao: MessageCircle,
  channeltalk: Send,
  smartstore: Store,
  coupang: ShoppingBag,
  delivery: Truck,
  ecount: Database,
  hometax: Receipt,
  openai: Bot,
  zoom: Video,
  http: Globe,
  router: Split,
  filter: Filter,
};

export function AppIcon({ app, size = 14 }: { app: string; size?: number }) {
  const Icon = ICONS[app as AppId] ?? Globe;
  return <Icon size={size} aria-hidden="true" />;
}
