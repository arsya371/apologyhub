import { prisma } from "../db/client";

interface AllowIPOptions {
  description: string;
  addedBy?: string;
  expiresAt?: Date;
}

export class IPAllowlistService {
  /**
   * Check if an IP is in the allowlist
   */
  async isIPAllowed(ipAddress: string): Promise<boolean> {
    const allowedIP = await prisma.allowedIP.findFirst({
      where: {
        ipAddress,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    return !!allowedIP;
  }

  /**
   * Get allowed IP details
   */
  async getAllowedIP(ipAddress: string) {
    return prisma.allowedIP.findFirst({
      where: {
        ipAddress,
        isActive: true,
      }
    });
  }

  /**
   * Add an IP to the allowlist
   */
  async allowIP(ipAddress: string, options: AllowIPOptions) {
    const {
      description,
      addedBy = "system",
      expiresAt,
    } = options;

    const existing = await this.getAllowedIP(ipAddress);
    if (existing) {
      return existing;
    }

    const allowedIP = await prisma.allowedIP.create({
      data: {
        ipAddress,
        description,
        addedBy,
        expiresAt,
        isActive: true,
      }
    });

    return allowedIP;
  }

  /**
   * Remove an IP from the allowlist
   */
  async removeIP(ipAddress: string) {
    const allowedIP = await this.getAllowedIP(ipAddress);
    if (!allowedIP) {
      return null;
    }

    const updated = await prisma.allowedIP.update({
      where: { id: allowedIP.id },
      data: { isActive: false }
    });

    return updated;
  }

  /**
   * Get all allowed IPs
   */
  async getAllowedIPs(activeOnly: boolean = true) {
    return prisma.allowedIP.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { addedAt: "desc" },
    });
  }

  /**
   * Clean up expired allowlist entries
   */
  async cleanupExpiredEntries() {
    const expired = await prisma.allowedIP.findMany({
      where: {
        isActive: true,
        expiresAt: {
          lte: new Date()
        }
      }
    });

    for (const entry of expired) {
      await this.removeIP(entry.ipAddress);
    }

    return expired.length;
  }

  /**
   * Get allowlist statistics
   */
  async getAllowlistStats() {
    const [totalAllowed, activeAllowed] = await Promise.all([
      prisma.allowedIP.count(),
      prisma.allowedIP.count({
        where: { isActive: true }
      })
    ]);

    return {
      totalAllowed,
      activeAllowed,
    };
  }
}

let ipAllowlistService: IPAllowlistService | null = null;

export function getIPAllowlistService(): IPAllowlistService {
  if (!ipAllowlistService) {
    ipAllowlistService = new IPAllowlistService();
  }
  return ipAllowlistService;
}

if (typeof window === "undefined") {
  setInterval(async () => {
    const service = getIPAllowlistService();
    const cleaned = await service.cleanupExpiredEntries();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired allowlist entries`);
    }
  }, 60 * 60 * 1000);
}
