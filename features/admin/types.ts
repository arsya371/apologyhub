export interface DashboardStats {
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
}

export interface AnalyticsData {
  analytics: Array<{
    id: string;
    date: Date;
    visits: number;
    submissions: number;
    views: number;
  }>;
  totals: {
    visits: number;
    submissions: number;
    views: number;
  };
  period: "day" | "week" | "month";
}

export interface Settings {
  id: string;
  siteName: string;
  announcement: string | null;
  showAnnouncement: boolean;
  maxApologyLength: number;
  enableModeration: boolean;
  
  // SEO Fields
  siteDescription: string | null;
  siteKeywords: string | null;
  siteUrl: string | null;
  ogImage: string | null;
  twitterHandle: string | null;
  twitterCard: string | null;
  
  updatedAt: Date;
}
