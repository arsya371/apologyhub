import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getIPSecurityService } from "@/server/services/ip-security";
import { z } from "zod";

const blockIPSchema = z.object({
  ipAddress: z.string().min(7),
  reason: z.string().min(3),
  expiresAt: z.string().optional(),
  blockInCloudflare: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const securityService = getIPSecurityService();
    const blockedIPs = await securityService.getBlockedIPs(activeOnly);

    return NextResponse.json(blockedIPs);
  } catch (error) {
    console.error("Error fetching blocked IPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked IPs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = blockIPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { ipAddress, reason, expiresAt, blockInCloudflare } = validation.data;
    const securityService = getIPSecurityService();

    const blockedIP = await securityService.blockIP(ipAddress, {
      reason,
      blockedBy: session.user?.email || "admin",
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      blockInCloudflare: blockInCloudflare ?? true,
    });

    return NextResponse.json(blockedIP, { status: 201 });
  } catch (error) {
    console.error("Error blocking IP:", error);
    return NextResponse.json(
      { error: "Failed to block IP" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const securityService = getIPSecurityService();
    const result = await securityService.unblockIP(
      ipAddress,
      session.user?.email || "admin"
    );

    if (!result) {
      return NextResponse.json(
        { error: "IP not found or already unblocked" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error unblocking IP:", error);
    return NextResponse.json(
      { error: "Failed to unblock IP" },
      { status: 500 }
    );
  }
}
