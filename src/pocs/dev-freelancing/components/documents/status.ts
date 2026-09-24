import type { EstimateStatus, InvoiceStatus } from "../../domain/documents";
import type { ProjectStatus } from "../../domain/pipeline";
import type { CellState } from "../ui/Cells";

/** How each workflow state reads as a square: opened, in motion, done — or late. */

export function invoiceCell(status: InvoiceStatus, overdue: number): CellState {
  if (status === "paid") return "solid";
  if (overdue > 0) return "warn";
  return status === "awaiting" ? "partial" : "hollow";
}

export function estimateCell(status: EstimateStatus, expired = false): CellState {
  if (status === "invoiced") return "bright";
  if (status === "accepted") return "solid";
  if (status === "declined") return "empty";
  if (status === "sent") return expired ? "warn" : "partial";
  return "hollow";
}

export function projectCell(status: ProjectStatus): CellState {
  if (status === "done") return "solid";
  if (status === "inquiry") return "hollow";
  return "partial";
}
