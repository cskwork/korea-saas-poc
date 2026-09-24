"use client";

import { Printer } from "lucide-react";
import { buttonClass } from "../ui/buttons";

export function PrintButton() {
  return (
    <button type="button" className={buttonClass("quiet")} onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" />
      인쇄·PDF 저장
    </button>
  );
}
