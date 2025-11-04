import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { getBotStats } from "@/server/services/bot-detector";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const stats = await getBotStats(days);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching bot stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot statistics" },
      { status: 500 }
    );
  }
}
