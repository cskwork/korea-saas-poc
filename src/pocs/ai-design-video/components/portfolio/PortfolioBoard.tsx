import Link from "next/link";
import { Plus } from "lucide-react";
import { ORDER_TYPES, ORDER_TYPE_INFO, type OrderType } from "../../domain/catalog";
import type { PortfolioRecord } from "../../server/studio-data";
import { Frame } from "../frame/Frame";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import styles from "./portfolio.module.css";

interface PortfolioBoardProps {
  items: PortfolioRecord[];
  category?: OrderType;
}

/** Finished pieces pinned to a presentation board, each at its real format. */
export function PortfolioBoard({ items, category }: PortfolioBoardProps) {
  const shown = category ? items.filter((item) => item.category === category) : items;
  const count = (type: OrderType) => items.filter((item) => item.category === type).length;

  return (
    <>
      <SheetHeader
        title="포트폴리오"
        lead={
          <>
            납품한 작업을 실제 규격 그대로 모아 둔 보드예요. 고객에게 보여줄 때는 카테고리로 좁혀 보세요.{" "}
            <span className={ui.sampleTag}>모든 작업은 샘플</span>
          </>
        }
        actions={
          <Link href={paths.newPortfolio} className={[ui.button, ui.secondary].join(" ")}>
            <Plus size={16} aria-hidden="true" />
            작업 추가
          </Link>
        }
      >
        <HeaderCell label="전체" value={`${items.length}점`} href={paths.portfolio} current={!category} />
        {ORDER_TYPES.filter((type) => count(type) > 0 || type === category).map((type) => (
          <HeaderCell
            key={type}
            label={ORDER_TYPE_INFO[type].short}
            value={`${count(type)}점`}
            href={`${paths.portfolio}?category=${type}`}
            current={category === type}
          />
        ))}
      </SheetHeader>

      {shown.length > 0 ? (
        <div className={styles.boardWrap}>
          <ul role="list" className={styles.board}>
            {shown.map((item) => (
              <li key={item.id} className={styles.piece}>
                <div className={styles.pieceFrame}>
                  <Frame
                    type={item.category}
                    medium="ink"
                    height={180}
                    palette={item.palette}
                    headline={item.headline}
                  />
                </div>
                <div className={styles.pieceCaption}>
                  <Link href={paths.portfolioItem(item.id)} className={styles.pieceTitle}>
                    {item.title}
                  </Link>
                  <p className={styles.pieceMeta}>
                    {item.clientLabel} · {ORDER_TYPE_INFO[item.category].short} ·{" "}
                    {ORDER_TYPE_INFO[item.category].frame.aspect}
                  </p>
                  <p className={styles.pieceTools}>{item.tools.join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.emptyWrap}>
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>
              {category ? `${ORDER_TYPE_INFO[category].label} 작업이 아직 없어요` : "포트폴리오가 비어 있어요"}
            </p>
            <p className={ui.emptyText}>
              납품완료된 주문 화면에서 ‘포트폴리오에 올리기’를 누르면 작업명, 고객, 색상이 채워진 채로 여기에 올라와요.
              직접 추가할 수도 있어요.
            </p>
            <Link href={paths.newPortfolio} className={ui.button}>
              작업 추가
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
