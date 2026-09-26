import type { Metadata } from "next";
import { Headline } from "@/pocs/ai-content-agency/components/dashboard/Headline";
import { MonthLedger } from "@/pocs/ai-content-agency/components/dashboard/MonthLedger";
import { RecentDrafts } from "@/pocs/ai-content-agency/components/dashboard/RecentDrafts";
import { Stand } from "@/pocs/ai-content-agency/components/dashboard/Stand";
import { Throughput } from "@/pocs/ai-content-agency/components/dashboard/Throughput";
import { TierFlow } from "@/pocs/ai-content-agency/components/dashboard/TierFlow";
import styles from "@/pocs/ai-content-agency/components/dashboard/dashboard.module.css";
import { getDashboard } from "@/pocs/ai-content-agency/server/queries";

export const metadata: Metadata = {
  title: "현황",
  description: "오늘 마감, 검수 대기, 마감일까지 걸린 의뢰와 이번 달 납품 장부를 한눈에 봐요.",
};

export default async function DashboardPage() {
  const dashboard = await getDashboard();
  return (
    <>
      <Headline today={dashboard.today} counts={dashboard.headline} plan={dashboard.usage.plan} />
      <Stand timeline={dashboard.timeline} today={dashboard.today} />
      <div className={styles.lower}>
        <div className={styles.section}>
          <TierFlow counts={dashboard.pipeline} />
          <MonthLedger usage={dashboard.usage} output={dashboard.output} performance={dashboard.performance} />
        </div>
        <div className={styles.section}>
          <Throughput weeks={dashboard.throughput} />
          <RecentDrafts drafts={dashboard.recentDrafts} />
        </div>
      </div>
    </>
  );
}
