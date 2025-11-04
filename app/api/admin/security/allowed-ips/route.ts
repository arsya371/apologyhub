import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getIPAllowlistService } from "@/server/services/ip-allowlist";
import { z } from "zod";

const allowIPSchema = z.object({
  ipAddress: z.string().min(7),
  description: z.string().min(3),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const allowlistService = getIPAllowlistService();
    const allowedIPs = await allowlistService.getAllowedIPs(activeOnly);

    return NextResponse.json(allowedIPs);
  } catch (error) {
    console.error("Error fetching allowed IPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch allowed IPs" },
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
    const validation = allowIPSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { ipAddress, description, expiresAt } = validation.data;
    const allowlistService = getIPAllowlistService();

    const allowedIP = await allowlistService.allowIP(ipAddress, {
      description,
      addedBy: session.user?.email || "admin",
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json(allowedIP, { status: 201 });
  } catch (error) {
    console.error("Error adding IP to allowlist:", error);
    return NextResponse.json(
      { error: "Failed to add IP to allowlist" },
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

    const allowlistService = getIPAllowlistService();
    const result = await allowlistService.removeIP(ipAddress);

    if (!result) {
      return NextResponse.json(
        { error: "IP not found or already removed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error removing IP from allowlist:", error);
    return NextResponse.json(
      { error: "Failed to remove IP from allowlist" },
      { status: 500 }
    );
  }
}
