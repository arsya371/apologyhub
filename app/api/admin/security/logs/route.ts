import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getIPSecurityService } from "@/server/services/ip-security";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ipAddress = searchParams.get("ipAddress");
    const severity = searchParams.get("severity") || undefined;
    const action = searchParams.get("action") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");

    const securityService = getIPSecurityService();

    let logs;
    if (ipAddress) {
      logs = await securityService.getSecurityLogs(ipAddress, limit);
    } else {
      logs = await securityService.getAllSecurityLogs({
        severity,
        action,
        limit,
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching security logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch security logs" },
      { status: 500 }
    );
  }
}
