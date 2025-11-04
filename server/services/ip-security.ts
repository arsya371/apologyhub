import { prisma } from "../db/client";
import { getCloudflareBlocker } from "./cloudflare-blocker";

interface SecurityLogData {
  ipAddress: string;
  action: string;
  endpoint?: string;
  userAgent?: string;
  details?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

interface BlockIPOptions {
  reason: string;
  blockedBy?: string;
  expiresAt?: Date;
  requestCount?: number;
  blockInCloudflare?: boolean;
}

export class IPSecurityService {
  /**
   * Check if an IP is blocked
   */
  async isIPBlocked(ipAddress: string): Promise<boolean> {
    const blockedIP = await prisma.blockedIP.findFirst({
      where: {
        ipAddress,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return !!blockedIP;
  }

  /**
   * Get blocked IP details
   */
  async getBlockedIP(ipAddress: string) {
    return prisma.blockedIP.findFirst({
      where: {
        ipAddress,
        isActive: true,
      }
    });
  }

  /**
   * Block an IP address
   */
  async blockIP(ipAddress: string, options: BlockIPOptions) {
    const {
      reason,
      blockedBy = "system",
      expiresAt,
      requestCount = 0,
      blockInCloudflare = true
    } = options;

    const existing = await this.getBlockedIP(ipAddress);
    if (existing) {
      return existing;
    }

    let cloudflareRuleId: string | undefined;

    if (blockInCloudflare && process.env.CLOUDFLARE_API_TOKEN) {
      const blocker = getCloudflareBlocker();
      const result = await blocker.blockIP(ipAddress, reason);
      if (result?.success && result.result?.id) {
        cloudflareRuleId = result.result.id;
      }
    }

    const blockedIP = await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason,
        blockedBy,
        expiresAt,
        requestCount,
        cloudflareRuleId,
        isActive: true,
        lastRequestAt: new Date(),
      }
    });

    // Log the action
    await this.logSecurityEvent({
      ipAddress,
      action: "ip_blocked",
      details: `IP blocked: ${reason}`,
      severity: "high",
    });

    return blockedIP;
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ipAddress: string, unblockedBy: string = "system") {
    const blockedIP = await this.getBlockedIP(ipAddress);
    if (!blockedIP) {
      return null;
    }

    // Unblock in Cloudflare if rule ID exists
    if (blockedIP.cloudflareRuleId) {
      const blocker = getCloudflareBlocker();
      await blocker.unblockIP(blockedIP.cloudflareRuleId);
    }

    const updated = await prisma.blockedIP.update({
      where: { id: blockedIP.id },
      data: { isActive: false }
    });

    await this.logSecurityEvent({
      ipAddress,
      action: "ip_unblocked",
      details: `IP unblocked by ${unblockedBy}`,
      severity: "low",
    });

    return updated;
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(data: SecurityLogData) {
    return prisma.securityLog.create({
      data: {
        ipAddress: data.ipAddress,
        action: data.action,
        endpoint: data.endpoint,
        userAgent: data.userAgent,
        details: data.details,
        severity: data.severity || "low",
      }
    });
  }

  /**
   * Get security logs for an IP
   */
  async getSecurityLogs(ipAddress: string, limit: number = 50) {
    return prisma.securityLog.findMany({
      where: { ipAddress },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get all security logs with filters
   */
  async getAllSecurityLogs(filters: {
    severity?: string;
    action?: string;
    limit?: number;
  } = {}) {
    const { severity, action, limit = 100 } = filters;

    return prisma.securityLog.findMany({
      where: {
        ...(severity && { severity }),
        ...(action && { action }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Clean up expired blocks
   */
  async cleanupExpiredBlocks() {
    const expired = await prisma.blockedIP.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: new Date()
        }
      }
    });

    for (const block of expired) {
      await this.unblockIP(block.ipAddress, "system_cleanup");
    }

    return expired.length;
  }

  /**
   * Get blocked IPs list
   */
  async getBlockedIPs(activeOnly: boolean = true) {
    return prisma.blockedIP.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { blockedAt: "desc" },
    });
  }

  /**
   * Update request count for an IP
   */
  async updateRequestCount(ipAddress: string) {
    const blockedIP = await this.getBlockedIP(ipAddress);
    if (blockedIP) {
      await prisma.blockedIP.update({
        where: { id: blockedIP.id },
        data: {
          requestCount: { increment: 1 },
          lastRequestAt: new Date(),
        }
      });
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalBlocked, recentLogs, logsByAction, logsBySeverity] = await Promise.all([
      prisma.blockedIP.count({
        where: { isActive: true }
      }),
      prisma.securityLog.count({
        where: { createdAt: { gte: since } }
      }),
      prisma.securityLog.groupBy({
        by: ['action'],
        _count: true,
        where: { createdAt: { gte: since } }
      }),
      prisma.securityLog.groupBy({
        by: ['severity'],
        _count: true,
        where: { createdAt: { gte: since } }
      })
    ]);

    return {
      totalBlocked,
      recentLogs,
      logsByAction,
      logsBySeverity,
    };
  }
}

let ipSecurityService: IPSecurityService | null = null;

export function getIPSecurityService(): IPSecurityService {
  if (!ipSecurityService) {
    ipSecurityService = new IPSecurityService();
  }
  return ipSecurityService;
}

if (typeof window === "undefined") {
  setInterval(async () => {
    const service = getIPSecurityService();
    const cleaned = await service.cleanupExpiredBlocks();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired IP blocks`);
    }
  }, 60 * 60 * 1000);
}
