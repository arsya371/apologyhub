import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getCloudflareBlocker } from "@/server/services/cloudflare-blocker";
import { z } from "zod";

const cloudflareActionSchema = z.object({
  ipAddress: z.string().min(7),
  reason: z.string().min(3).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = cloudflareActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { ipAddress, reason } = validation.data;
    const blocker = getCloudflareBlocker();

    const result = await blocker.blockIP(
      ipAddress,
      reason || "Blocked via admin panel"
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to block IP in Cloudflare. Check API credentials." },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Cloudflare API error", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error blocking IP in Cloudflare:", error);
    return NextResponse.json(
      { error: "Failed to block IP in Cloudflare" },
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
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 }
      );
    }

    const blocker = getCloudflareBlocker();
    const result = await blocker.unblockIP(ruleId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to unblock IP in Cloudflare. Check API credentials." },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: "Cloudflare API error", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error unblocking IP in Cloudflare:", error);
    return NextResponse.json(
      { error: "Failed to unblock IP in Cloudflare" },
      { status: 500 }
    );
  }
}
