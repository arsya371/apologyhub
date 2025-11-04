import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getIPSecurityService } from "@/server/services/ip-security";
import { getIPAllowlistService } from "@/server/services/ip-allowlist";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const securityService = getIPSecurityService();
    const allowlistService = getIPAllowlistService();

    const [securityStats, allowlistStats] = await Promise.all([
      securityService.getSecurityStats(days),
      allowlistService.getAllowlistStats(),
    ]);

    return NextResponse.json({
      ...securityStats,
      ...allowlistStats,
    });
  } catch (error) {
    console.error("Error fetching security stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch security stats" },
      { status: 500 }
    );
  }
}
