/** Route helpers for the module (shared by server and client components). */
export const BASE = "/ai-design-video";

export const paths = {
  today: BASE,
  orders: `${BASE}/orders`,
  newOrder: `${BASE}/orders/new`,
  order: (id: string) => `${BASE}/orders/${id}`,
  editOrder: (id: string) => `${BASE}/orders/${id}/edit`,
  portfolio: `${BASE}/portfolio`,
  newPortfolio: `${BASE}/portfolio/new`,
  portfolioItem: (id: string) => `${BASE}/portfolio/${id}`,
  editPortfolioItem: (id: string) => `${BASE}/portfolio/${id}/edit`,
  tools: `${BASE}/tools`,
  revenue: `${BASE}/revenue`,
  pricing: `${BASE}/pricing`,
} as const;

export const NAV_ITEMS = [
  { href: paths.today, label: "오늘" },
  { href: paths.orders, label: "주문" },
  { href: paths.portfolio, label: "포트폴리오" },
  { href: paths.tools, label: "AI 도구" },
  { href: paths.revenue, label: "수익" },
  { href: paths.pricing, label: "가격표" },
] as const;
