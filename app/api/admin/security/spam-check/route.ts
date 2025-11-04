import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getCloudflareBlocker } from "@/server/services/cloudflare-blocker";
import { getRequestStats, isSuspiciousActivity } from "@/server/services/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get("ipAddress");

    if (!ipAddress) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      );
    }

    const stats = getRequestStats(ipAddress);
    const suspiciousCheck = isSuspiciousActivity(ipAddress, {
      shortTermThreshold: 30,
      mediumTermThreshold: 80,
      longTermThreshold: 150,
    });

    const blocker = getCloudflareBlocker();
    const requestMap: Record<string, number[]> = {};
    const isSpam = blocker.detectSpam(ipAddress, requestMap, 20);

    return NextResponse.json({
      ipAddress,
      stats,
      suspicious: suspiciousCheck.suspicious,
      suspiciousReason: suspiciousCheck.reason,
      requestCounts: suspiciousCheck.requestCounts,
      isSpam,
    });
  } catch (error) {
    console.error("Error checking spam status:", error);
    return NextResponse.json(
      { error: "Failed to check spam status" },
      { status: 500 }
    );
  }
}
