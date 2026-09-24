import { FileSpreadsheet, FileText, NotebookText } from "lucide-react";
import type { ProductType } from "../../db/schema";

const ICONS = { notion: NotebookText, pdf: FileText, sheet: FileSpreadsheet } as const;

export function ProductTypeIcon({ type, size = 18 }: { type: ProductType; size?: number }) {
  const Icon = ICONS[type];
  return <Icon size={size} strokeWidth={1.8} aria-hidden />;
}
