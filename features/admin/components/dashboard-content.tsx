"use client";

import { StatsCard } from "@/features/admin/components/stats-card";
import { AnalyticsChart } from "@/features/admin/components/analytics-chart";
import { RecentApologies } from "@/features/admin/components/recent-apologies";
import { MessageSquare, Eye, TrendingUp, Users } from "lucide-react";

interface DashboardContentProps {
  stats: {
    totalApologies: number;
    totalViews: number;
    todayVisits: number;
    todaySubmissions: number;
    recentApologies: Array<{
      id: string;
      content: string;
      toWho: string | null;
      createdAt: Date;
      views: number;
    }>;
  };
  analytics: {
    analytics: Array<{
      date: Date;
      visits: number;
      submissions: number;
      views: number;
    }>;
  };
}

export function DashboardContent({ stats, analytics }: DashboardContentProps) {
  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your platform's performance and activity
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Apologies"
          value={stats.totalApologies}
          icon={MessageSquare}
          gradient="blue"
          index={0}
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          icon={Eye}
          gradient="green"
          index={1}
        />
        <StatsCard
          title="Today's Visits"
          value={stats.todayVisits}
          icon={Users}
          gradient="yellow"
          index={2}
        />
        <StatsCard
          title="Today's Submissions"
          value={stats.todaySubmissions}
          icon={TrendingUp}
          gradient="pink"
          index={3}
        />
      </div>

      <AnalyticsChart data={analytics.analytics} />

      <RecentApologies apologies={stats.recentApologies} />
    </div>
  );
}
