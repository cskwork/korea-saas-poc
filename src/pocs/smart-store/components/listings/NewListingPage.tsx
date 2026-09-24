import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import detail from "../sourcing/detail.module.css";
import { PageHead } from "../ui/PageHead";
import { ManualListingForm } from "./ManualListingForm";

export function NewListingPage({ writer }: { writer: "claude" | "template" }) {
  return (
    <>
      <Link href="/smart-store/listings" className={detail.back}>
        <ArrowLeft size={14} strokeWidth={2} aria-hidden /> 등록 상품
      </Link>
      <PageHead
        title="직접 입력해 등록"
        lede={
          <>
            소싱 목록에 없는 상품을 등록해요. 소싱 목록에 있는 상품은{" "}
            <Link href="/smart-store/sourcing">도매 소싱</Link>에서 한 번에 등록할 수 있어요.
          </>
        }
      />
      <ManualListingForm writer={writer} />
    </>
  );
}
