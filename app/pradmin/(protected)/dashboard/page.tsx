import { DashboardContent } from "@/features/admin/components/dashboard-content";
import { getDashboardStats, getAnalytics } from "@/server/queries/analytics";

export const metadata = {
  title: "Dashboard - Admin Panel",
  description: "Admin dashboard",
};

export default async function DashboardPage() {
  const [stats, analytics] = await Promise.all([
    getDashboardStats(),
    getAnalytics("week"),
  ]);

  return <DashboardContent stats={stats} analytics={analytics} />;
}
