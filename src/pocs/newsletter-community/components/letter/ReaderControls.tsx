"use client";

import { useTransition } from "react";
import { BookOpen, LogOut } from "lucide-react";
import { readAsSampleMember, stopReading } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { useToast } from "../ui/Toaster";

/** Forget the reader cookie on this browser. */
export function StopReadingButton() {
  const [pending, startTransition] = useTransition();
  const { report } = useToast();
  return (
    <button
      type="button"
      className={buttonClass("quiet", "sm")}
      disabled={pending}
      onClick={() => startTransition(async () => report(await stopReading({})))}
    >
      <LogOut size={14} aria-hidden />
      그만 읽기
    </button>
  );
}

/** Demo shortcut: read as a sample 프로 member without subscribing. */
export function SampleReaderButton({ label = "샘플 프로 독자로 읽어 보기" }: { label?: string }) {
  const [pending, startTransition] = useTransition();
  const { report } = useToast();
  return (
    <button
      type="button"
      className={buttonClass("secondary", "sm")}
      disabled={pending}
      onClick={() => startTransition(async () => report(await readAsSampleMember({})))}
    >
      <BookOpen size={14} aria-hidden />
      {pending ? "바꾸는 중…" : label}
    </button>
  );
}
