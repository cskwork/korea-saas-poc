"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Calculator, ChartNoAxesColumn, PackageSearch, ReceiptText, SearchCheck, Store, Tags } from "lucide-react";
import styles from "./nav.module.css";

const ITEMS = [
  { href: "/smart-store", label: "오늘", icon: Store, exact: true },
  { href: "/smart-store/sourcing", label: "소싱", icon: PackageSearch },
  { href: "/smart-store/listings", label: "등록 상품", icon: Tags },
  { href: "/smart-store/orders", label: "주문", icon: ReceiptText, badge: "waiting" },
  { href: "/smart-store/calculator", label: "마진 계산", icon: Calculator },
  { href: "/smart-store/keywords", label: "키워드", icon: SearchCheck },
  { href: "/smart-store/analytics", label: "매출", icon: ChartNoAxesColumn },
] as const;

export function NavLinks({ waiting }: { waiting: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="스마트셀러 메뉴">
      <ul className={styles.list}>
        {ITEMS.map((item) => {
          const current = "exact" in item ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(styles.link, current && styles.current)}
                aria-current={current ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                <span className={styles.label}>{item.label}</span>
                {"badge" in item && waiting > 0 ? (
                  <span className={styles.count} aria-label={`발주 대기 ${waiting}건`}>
                    {waiting}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
