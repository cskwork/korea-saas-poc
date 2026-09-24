import type { CalculationEntry } from "../../server/data/calculations";
import { PageHead } from "../ui/PageHead";
import { CalcHistory } from "./CalcHistory";
import { CalculatorForm, type CalculatorInitial } from "./CalculatorForm";

export function CalculatorPage({
  initial,
  history,
  now,
}: {
  initial: CalculatorInitial;
  history: CalculationEntry[];
  now: Date;
}) {
  return (
    <>
      <PageHead
        title="마진 계산"
        lede="카테고리별 네이버 수수료(3.5%~7.0%)와 도매처 배송비를 빼고 개당·월 남는 돈을 계산해요. 수수료율은 이 도구의 기준표예요."
      />
      <CalculatorForm key={JSON.stringify(initial)} initial={initial} />
      <CalcHistory entries={history} now={now} />
    </>
  );
}
