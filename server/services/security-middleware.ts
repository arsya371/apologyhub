import { NextRequest, NextResponse } from "next/server";
import { getIPSecurityService } from "./ip-security";
import { getIPAllowlistService } from "./ip-allowlist";
import { getClientIp } from "@/lib/utils";
import { isSuspiciousActivity } from "./rate-limit";
import { checkBotActivity, isIpBlocked } from "./bot-detector";

interface SecurityCheckOptions {
  checkBlocked?: boolean;
  checkSuspicious?: boolean;
  checkBots?: boolean;
  logRequest?: boolean;
  endpoint?: string;
}

interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  response?: NextResponse;
}

/**
 * Check if request should be blocked based on IP security
 */
export async function checkRequestSecurity(
  request: NextRequest,
  options: SecurityCheckOptions = {}
): Promise<SecurityCheckResult> {
  const {
    checkBlocked = true,
    checkSuspicious = true,
    checkBots = true,
    logRequest = true,
    endpoint,
  } = options;

  const ip = getClientIp(request) || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;
  const securityService = getIPSecurityService();
  const allowlistService = getIPAllowlistService();

  const isAllowed = await allowlistService.isIPAllowed(ip);
  if (isAllowed) {
    return { allowed: true };
  }

  if (checkBots) {
    const botCheck = await checkBotActivity(request, endpoint || "request");
    if (botCheck.blocked) {
      return {
        allowed: false,
        reason: botCheck.reason || "Bot activity detected",
        response: NextResponse.json(
          { 
            error: "Internal server error"
          },
          { status: 500 }
        ),
      };
    }

    const ipBlocked = await isIpBlocked(request);
    if (ipBlocked) {
      return {
        allowed: false,
        reason: "IP temporarily blocked due to repeated violations",
        response: NextResponse.json(
          { 
            error: "Internal server error", 
          },
          { status: 500 }
        ),
      };
    }
  }

  if (checkBlocked) {
    const isBlocked = await securityService.isIPBlocked(ip);
    if (isBlocked) {
      const blockedIP = await securityService.getBlockedIP(ip);
      if (logRequest) {
        await securityService.logSecurityEvent({
          ipAddress: ip,
          action: "blocked_request_attempt",
          endpoint,
          userAgent,
          details: `Blocked IP attempted to access: ${endpoint || request.url}`,
          severity: "medium",
        });
      }

      await securityService.updateRequestCount(ip);

      return {
        allowed: false,
        reason: blockedIP?.reason || "IP address is blocked",
        response: NextResponse.json(
          { 
            error: "Access denied", 
            message: "Your IP address has been blocked due to suspicious activity" 
          },
          { status: 403 }
        ),
      };
    }
  }

  if (checkSuspicious) {
    const suspiciousCheck = isSuspiciousActivity(ip, {
      shortTermThreshold: 30,
      mediumTermThreshold: 80,
      longTermThreshold: 150,
    });

    if (suspiciousCheck.suspicious) {
      if (logRequest) {
        await securityService.logSecurityEvent({
          ipAddress: ip,
          action: "suspicious_activity_detected",
          endpoint,
          userAgent,
          details: suspiciousCheck.reason,
          severity: "high",
        });
      }

      if (suspiciousCheck.requestCounts && suspiciousCheck.requestCounts.minute > 100) {
        await securityService.blockIP(ip, {
          reason: `Auto-blocked: ${suspiciousCheck.reason}`,
          blockedBy: "system",
          requestCount: suspiciousCheck.requestCounts.minute,
          blockInCloudflare: true,
        });

        return {
          allowed: false,
          reason: "Auto-blocked due to excessive requests",
          response: NextResponse.json(
            { 
              error: "Access denied", 
              message: "Your IP has been automatically blocked due to excessive requests" 
            },
            { status: 403 }
          ),
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Middleware wrapper for API routes
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: SecurityCheckOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const securityCheck = await checkRequestSecurity(request, options);

    if (!securityCheck.allowed && securityCheck.response) {
      return securityCheck.response;
    }

    return handler(request);
  };
}

/**
 * Log security event helper
 */
export async function logSecurityEvent(
  request: NextRequest,
  action: string,
  details?: string,
  severity: "low" | "medium" | "high" | "critical" = "low"
) {
  const ip = getClientIp(request) || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;
  const securityService = getIPSecurityService();

  await securityService.logSecurityEvent({
    ipAddress: ip,
    action,
    endpoint: request.url,
    userAgent,
    details,
    severity,
  });
}

/**
 * Auto-block IP helper
 */
export async function autoBlockIP(
  ip: string,
  reason: string,
  requestCount: number = 0
) {
  const securityService = getIPSecurityService();
  
  await securityService.blockIP(ip, {
    reason: `Auto-blocked: ${reason}`,
    blockedBy: "system",
    requestCount,
    blockInCloudflare: true,
  });
}
