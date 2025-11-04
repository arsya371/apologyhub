import { NextRequest, NextResponse } from "next/server";
import { getApologyById, incrementApologyViews } from "@/server/queries/apologies";
import { trackView } from "@/server/services/analytics";
import { checkRequestSecurity } from "@/server/services/security-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const securityCheck = await checkRequestSecurity(request, {
      checkBlocked: true,
      checkSuspicious: false,
      checkBots: true,
      logRequest: false,
      endpoint: `/api/apologies/${id}`,
    });

    if (!securityCheck.allowed && securityCheck.response) {
      return securityCheck.response;
    }

    const apology = await getApologyById(id);

    if (!apology) {
      return NextResponse.json(
        { error: "Apology not found" },
        { status: 404 }
      );
    }

    await Promise.all([
      incrementApologyViews(id),
      trackView(),
    ]);

    return NextResponse.json({
      ...apology,
      views: apology.views + 1,
    });
  } catch (error) {
    console.error("Error fetching apology:", error);
    return NextResponse.json(
      { error: "Failed to fetch apology" },
      { status: 500 }
    );
  }
}
