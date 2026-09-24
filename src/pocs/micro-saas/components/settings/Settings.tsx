import Link from "next/link";
import type { getSettings } from "../../server/queries";
import { planById } from "../../domain/plans";
import { formatClosedWeekdays, formatMinute } from "../../domain/time";
import { ResetDemoButton } from "../shell/ResetDemoButton";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import { ServicesEditor } from "./ServicesEditor";
import { ShopForm } from "./ShopForm";
import styles from "./settings.module.css";

type Data = Awaited<ReturnType<typeof getSettings>>;

/** The shop's own sheet: details and hours on the left, the service list on the right. */
export function Settings({ data }: { data: Data }) {
  const { shop, services } = data;
  const formKey = `${shop.updatedAt.getTime()}`;
  return (
    <div className={styles.grid}>
      <section className={ui.sheet} aria-labelledby="shop-title">
        <div className={ui.sheetHead}>
          <h2 id="shop-title">매장 정보</h2>
          <p className={ui.sheetNote}>
            {formatMinute(shop.openMinute)}–{formatMinute(shop.closeMinute)} · {formatClosedWeekdays(shop.closedWeekdays)}
          </p>
        </div>
        <div className={styles.body}>
          <ShopForm
            key={formKey}
            shop={{
              name: shop.name,
              category: shop.category,
              ownerName: shop.ownerName,
              phone: shop.phone,
              address: shop.address,
              openMinute: shop.openMinute,
              closeMinute: shop.closeMinute,
              seats: shop.seats,
              closedWeekdays: shop.closedWeekdays,
              cancelPolicy: shop.cancelPolicy,
            }}
          />
        </div>
      </section>

      <div className={styles.side}>
        <section className={ui.sheet} aria-labelledby="services-title">
          <div className={ui.sheetHead}>
            <h2 id="services-title">서비스</h2>
            <p className={ui.sheetNote}>예약 페이지에 {services.filter((s) => s.active).length}개 표시 중</p>
          </div>
          <ServicesEditor
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              durationMinutes: s.durationMinutes,
              price: s.price,
              active: s.active,
            }))}
          />
        </section>

        <section className={ui.sheet} aria-labelledby="more-title">
          <div className={ui.sheetHead}>
            <h2 id="more-title">요금제 · 데모</h2>
          </div>
          <ul className={styles.links}>
            <li>
              <Link href="/micro-saas/pricing">
                <span>
                  요금제 <strong>{planById(shop.plan).name}</strong> 사용 중
                </span>
                <Icon name="right" />
              </Link>
            </li>
            <li>
              <Link href="/micro-saas/book">
                <span>손님이 보는 예약 페이지</span>
                <Icon name="right" />
              </Link>
            </li>
            <li>
              <a href="/">
                <span>한국형 SaaS 10선 전체 보기</span>
                <Icon name="out" />
              </a>
            </li>
          </ul>
          <div className={styles.reset}>
            <p className={ui.hint}>
              이 매장과 예약, 고객은 모두 체험용 <strong>샘플 데이터</strong>예요. 처음 상태로 돌리려면 초기화하세요.
            </p>
            <ResetDemoButton />
          </div>
        </section>
      </div>
    </div>
  );
}
