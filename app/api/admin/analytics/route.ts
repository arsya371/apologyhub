import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { analyticsFilterSchema } from "@/lib/validations";
import { getAnalytics, getDashboardStats } from "@/server/queries/analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    if (params.dashboard === "true") {
      const stats = await getDashboardStats();
      return NextResponse.json(stats);
    }

    const validation = analyticsFilterSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const analytics = await getAnalytics(validation.data.period);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
