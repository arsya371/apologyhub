import { prisma } from "../db/client";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function getAnalytics(period: "day" | "week" | "month" = "week") {
  const now = new Date();
  const days = period === "day" ? 1 : period === "week" ? 7 : 30;
  const startDate = startOfDay(subDays(now, days - 1));
  const endDate = endOfDay(now);

  const analytics = await prisma.analytics.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  const totals = analytics.reduce(
    (acc, curr) => ({
      visits: acc.visits + curr.visits,
      submissions: acc.submissions + curr.submissions,
      views: acc.views + curr.views,
    }),
    { visits: 0, submissions: 0, views: 0 }
  );

  return {
    analytics,
    totals,
    period,
  };
}

export async function getDashboardStats() {
  const [apologyStats, todayAnalytics, recentApologies] = await Promise.all([
    prisma.apology.aggregate({
      _count: true,
      _sum: {
        views: true,
      },
    }),
    prisma.analytics.findUnique({
      where: {
        date: startOfDay(new Date()),
      },
    }),
    prisma.apology.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        toWho: true,
        createdAt: true,
        views: true,
      },
    }),
  ]);

  return {
    totalApologies: apologyStats._count,
    totalViews: apologyStats._sum.views || 0,
    todayVisits: todayAnalytics?.visits || 0,
    todaySubmissions: todayAnalytics?.submissions || 0,
    recentApologies,
  };
}

export async function getActivityLogs(limit = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
