import { seoulDateKey } from "@/core/format";
import { findPlan, planMonthlyPrice, type Billing } from "../../domain/pricing";
import { daysBetween } from "../../domain/dashboard";
import { INDUSTRY_LABEL } from "../../domain/labels";
import type { PackageOption } from "../../server/data/catalog";
import type { DiagnosisWithRoi } from "../../server/data/diagnoses";
import type { QuoteDetail } from "../../server/data/quotes";
import type { DraftLine, QuoteDraft } from "./QuoteBuilder";

/**
 * A new quote's starting point from where the user came from: a catalogue package,
 * a pricing plan, or a saved ROI diagnosis.
 */
export function newQuoteDraft(options: {
  packages: PackageOption[];
  packageId?: string;
  planId?: string;
  billing?: Billing;
  diagnosis?: DiagnosisWithRoi;
}): QuoteDraft {
  const lines: DraftLine[] = [];
  const pkg = options.packageId ? options.packages.find((p) => p.id === options.packageId && !p.archived) : undefined;
  if (pkg) {
    lines.push({
      key: pkg.id,
      packageId: pkg.id,
      name: pkg.name,
      complexity: "normal",
      quantity: 1,
      unitSetupFee: pkg.setupFee,
      unitMonthlyFee: pkg.monthlyFee,
    });
  }
  const plan = findPlan(options.planId);
  if (plan) {
    const billing = options.billing ?? "monthly";
    lines.push({
      key: `plan-${plan.id}`,
      packageId: null,
      name: `${plan.name} 플랜 유지보수 (${billing === "annual" ? "연간 결제" : "월간 결제"})`,
      complexity: "normal",
      quantity: 1,
      unitSetupFee: 0,
      unitMonthlyFee: planMonthlyPrice(plan, billing),
    });
  }
  const d = options.diagnosis;
  return {
    clientName: d?.clientName ?? "",
    contactName: d?.contactName ?? "",
    issuedOn: seoulDateKey(),
    validDays: 30,
    notes: d
      ? `ROI 진단 기준: ${INDUSTRY_LABEL[d.industry]} · 주 ${d.weeklyHours}시간 반복 업무 중 ${d.automationRate}% 자동화, 월 약 ${Math.round(d.result.monthlyHoursSaved)}시간 절감 예상.`
      : "",
    diagnosisId: d?.id,
    lines,
  };
}

export function editQuoteDraft(quote: QuoteDetail): QuoteDraft {
  return {
    id: quote.id,
    clientName: quote.clientName,
    contactName: quote.contactName,
    issuedOn: quote.issuedOn,
    validDays: Math.min(90, Math.max(7, daysBetween(quote.issuedOn, quote.validUntil))),
    notes: quote.notes,
    lines: quote.items.map((item) => ({
      key: item.id,
      packageId: item.packageId,
      name: item.name,
      complexity: item.complexity,
      quantity: item.quantity,
      unitSetupFee: item.unitSetupFee,
      unitMonthlyFee: item.unitMonthlyFee,
    })),
  };
}
