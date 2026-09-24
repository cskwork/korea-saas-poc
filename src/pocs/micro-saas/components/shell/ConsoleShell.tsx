import type { ReactNode } from "react";
import type { Service, Shop } from "../../db/schema";
import { NewBookingButton, NewBookingProvider } from "../booking/NewBooking";
import { SealLogo } from "../world/Stamp";
import { ToastProvider } from "../world/Toast";
import ui from "../world/ui.module.css";
import world from "../world/world.module.css";
import { LegacyHashRedirect, NavLinks, PageTitle } from "./NavLinks";
import { ResetDemoButton } from "./ResetDemoButton";
import styles from "./shell.module.css";

/** The owner's console: ruled spine (tab bar on phones), sticky title bar, and the new-booking slip. */
export function ConsoleShell({
  shop,
  services,
  today,
  children,
}: {
  shop: Shop;
  services: Service[];
  today: string;
  children: ReactNode;
}) {
  return (
    <ToastProvider aboveTabBar>
      <NewBookingProvider
        services={services}
        hours={{ openMinute: shop.openMinute, closeMinute: shop.closeMinute }}
        today={today}
      >
        <a className={world.skipLink} href="#main">
          본문으로 건너뛰기
        </a>
        <LegacyHashRedirect />
        <div className={styles.app}>
          <nav className={styles.spine} aria-label="주 메뉴">
            <div className={styles.brand}>
              <SealLogo className={styles.brandSeal} label="예약잇다" />
              <div>
                <p className={styles.brandName}>예약잇다</p>
                <p className={styles.brandSub}>소상공인 예약 관리</p>
              </div>
            </div>
            <NavLinks />
            <div className={styles.owner}>
              <div className={styles.ownerMark} aria-hidden="true">
                {shop.ownerName.charAt(0)}
              </div>
              <div className={styles.ownerText}>
                <p className={styles.ownerName}>{shop.ownerName}님</p>
                <p className={styles.ownerShop}>
                  {shop.name} <span className={ui.tag}>샘플</span>
                </p>
              </div>
              <ResetDemoButton variant="icon" />
            </div>
            <a className={styles.hubLink} href="/">
              한국형 SaaS 10선 전체 보기
            </a>
          </nav>

          <main id="main" className={styles.main} tabIndex={-1}>
            <header className={styles.topbar}>
              <div className={styles.topbarTitle}>
                <SealLogo className={styles.sealMini} grain={false} />
                <PageTitle />
              </div>
              <NewBookingButton compact />
            </header>
            <div className={styles.page}>{children}</div>
          </main>
        </div>
      </NewBookingProvider>
    </ToastProvider>
  );
}
