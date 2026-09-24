import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { formatDate } from "@/core/format";
import { ORDER_TYPE_INFO } from "../../domain/catalog";
import type { PortfolioRecord } from "../../server/studio-data";
import { Frame } from "../frame/Frame";
import { paths } from "../paths";
import { SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import { DeletePortfolioButton } from "./DeletePortfolioButton";
import styles from "./portfolio.module.css";

export function PortfolioDetail({ item }: { item: PortfolioRecord }) {
  const info = ORDER_TYPE_INFO[item.category];
  const tall = info.frame.ratio[1] > info.frame.ratio[0];
  return (
    <>
      <SheetHeader
        title={item.title}
        lead={
          <>
            {item.clientLabel} · {info.label} <span className={ui.sampleTag}>샘플 작업</span>
          </>
        }
        actions={
          <>
            <Link href={`${paths.newOrder}?type=${item.category}`} className={ui.button}>
              이런 작업 의뢰하기
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href={paths.editPortfolioItem(item.id)} className={[ui.button, ui.secondary].join(" ")}>
              <Pencil size={15} aria-hidden="true" />
              수정
            </Link>
          </>
        }
      />
      <div className={styles.detail}>
        <div className={styles.detailFrame}>
          <div className={styles.detailFrameInner}>
            <Frame
              type={item.category}
              medium="ink"
              height={tall ? 460 : 300}
              maxWidth={560}
              palette={item.palette}
              headline={item.headline}
              label={`${item.title} 시안 — ${info.frame.aspect}, 대표 문구 ‘${item.headline}’`}
            />
          </div>
        </div>
        <div className={styles.detailBody}>
          {item.summary && <p className={styles.summary}>{item.summary}</p>}
          <dl className={styles.facts}>
            <div>
              <dt>대표 문구</dt>
              <dd>{item.headline}</dd>
            </div>
            <div>
              <dt>규격</dt>
              <dd>
                {info.frame.aspect} · {info.frame.size}
              </dd>
            </div>
            <div>
              <dt>사용 도구</dt>
              <dd>{item.tools.length > 0 ? item.tools.join(", ") : "기록 없음"}</dd>
            </div>
            <div>
              <dt>색상</dt>
              <dd>
                <ul role="list" className={styles.swatches}>
                  {item.palette.map((color) => (
                    <li key={color} className={styles.swatch}>
                      <span className={styles.chip} style={{ background: color }} aria-hidden="true" />
                      {color.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>올린 날</dt>
              <dd>{formatDate(item.createdAt)}</dd>
            </div>
            {item.orderId && (
              <div>
                <dt>원 주문</dt>
                <dd>
                  <Link href={paths.order(item.orderId)}>주문 보기</Link>
                </dd>
              </div>
            )}
          </dl>
          <div className={styles.actions}>
            <DeletePortfolioButton id={item.id} title={item.title} />
          </div>
        </div>
      </div>
    </>
  );
}
