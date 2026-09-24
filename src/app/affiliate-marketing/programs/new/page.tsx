import type { Metadata } from "next";
import { NewProgramScreen } from "@/pocs/affiliate-marketing/components/programs/ProgramEditScreens";

export const metadata: Metadata = {
  title: "프로그램 추가",
  description: "가입한 제휴 프로그램의 수수료 구조와 정산 조건을 메모해 두세요.",
};

export default function NewProgramPage() {
  return <NewProgramScreen />;
}
