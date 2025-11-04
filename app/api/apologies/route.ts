import { NextRequest, NextResponse } from "next/server";
import { apologySchema, apologyFilterSchema } from "@/lib/validations";
import { getClientIp } from "@/lib/utils";
import { verifyTurnstileToken } from "@/server/services/turnstile";
import { checkRateLimit } from "@/server/services/rate-limit";
import { createApology } from "@/server/mutations/apologies";
import { getApologies } from "@/server/queries/apologies";
import { RATE_LIMITS } from "@/lib/constants";
import { checkRequestSecurity, autoBlockIP, logSecurityEvent } from "@/server/services/security-middleware";

export async function POST(request: NextRequest) {
  try {
    const securityCheck = await checkRequestSecurity(request, {
      checkBlocked: true,
      checkSuspicious: true,
      checkBots: true,
      logRequest: true,
      endpoint: "/api/apologies",
    });

    if (!securityCheck.allowed && securityCheck.response) {
      return securityCheck.response;
    }

    const ip = getClientIp(request) || "unknown";
    const rateLimit = checkRateLimit(
      `apology:${ip}`,
      RATE_LIMITS.apologySubmission.maxRequests,
      RATE_LIMITS.apologySubmission.windowMs
    );

    if (!rateLimit.allowed) {
      if (rateLimit.isSpam) {
        await logSecurityEvent(
          request,
          "spam_detected",
          `Spam detected: Rate limit exceeded with ${rateLimit.remaining} remaining`,
          "high"
        );

        const requestCount = RATE_LIMITS.apologySubmission.maxRequests - rateLimit.remaining;
        if (requestCount > 50) {
          await autoBlockIP(ip, "Excessive spam submissions", requestCount);
        }
      }

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = apologySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { content, toWho, fromWho, turnstileToken } = validation.data;
    const isValidToken = await verifyTurnstileToken(turnstileToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    const apology = await createApology({
      content,
      toWho,
      fromWho,
      ipAddress: ip,
    });

    return NextResponse.json(apology, { status: 201 });
  } catch (error) {
    console.error("Error creating apology:", error);
    return NextResponse.json(
      { error: "Failed to create apology" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const securityCheck = await checkRequestSecurity(request, {
      checkBlocked: true,
      checkSuspicious: false,
      checkBots: true,
      logRequest: false,
      endpoint: "/api/apologies",
    });

    if (!securityCheck.allowed && securityCheck.response) {
      return securityCheck.response;
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const validation = apologyFilterSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const result = await getApologies(validation.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching apologies:", error);
    return NextResponse.json(
      { error: "Failed to fetch apologies" },
      { status: 500 }
    );
  }
}
