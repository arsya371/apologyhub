import { NextRequest } from 'next/server';
import { prisma } from '../db/client';
import { Prisma } from '@prisma/client';

/**
 * Known bot patterns to block
 */
const BLOCKED_BOT_PATTERNS = [
  // Scrapers
  /scrapy/i,
  /crawl/i,
  /spider/i,
  /bot/i,
  /slurp/i,
  /bingbot/i,
  /googlebot/i,
  /yandex/i,
  /baiduspider/i,
  
  // HTTP libraries commonly used for automation
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /axios/i,
  /node-fetch/i,
  /got\//i,
  /http\.rb/i,
  
  // Headless browsers
  /headless/i,
  /phantom/i,
  /puppeteer/i,
  /selenium/i,
  /playwright/i,
  
  // Other automated tools
  /postman/i,
  /insomnia/i,
  /httpie/i,
  /go-http-client/i,
  /java\//i,
  /apache-httpclient/i,
  /okhttp/i,
  
  // Generic bots
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /monitor/i,
  /scanner/i,
];

/**
 * Suspicious patterns that should be logged but not blocked
 */
const SUSPICIOUS_PATTERNS = [
  /^$/,  // Empty user agent
  /^mozilla\/4\.0$/i,  // Old fake user agents
  /^mozilla\/5\.0$/i,  // Incomplete user agents
];

/**
 * Check if User-Agent matches a bot pattern
 */
export function isBotUserAgent(userAgent: string | null): {
  isBot: boolean;
  isSuspicious: boolean;
  matchedPattern?: string;
} {
  if (!userAgent) {
    return {
      isBot: false,
      isSuspicious: true,
      matchedPattern: 'empty-user-agent'
    };
  }
  
  // Check for blocked bot patterns
  for (const pattern of BLOCKED_BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isBot: true,
        isSuspicious: false,
        matchedPattern: pattern.toString()
      };
    }
  }
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isBot: false,
        isSuspicious: true,
        matchedPattern: pattern.toString()
      };
    }
  }
  
  return {
    isBot: false,
    isSuspicious: false
  };
}

/**
 * Get identifier from request (IP address)
 */
function getIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return 'unknown';
}

/**
 * Log security event to database
 */
async function logBotSecurityEvent(
  action: string,
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'SUSPICIOUS',
  request: NextRequest,
  metadata?: Prisma.InputJsonValue
) {
  try {
    const ipAddress = getIpAddress(request);
    const userAgent = request.headers.get('user-agent') || undefined;
    
    await prisma.securityLog.create({
      data: {
        ipAddress,
        action,
        userAgent,
        details: JSON.stringify({
          status,
          metadata: metadata || {},
        }),
        severity: status === 'BLOCKED' ? 'high' : status === 'SUSPICIOUS' ? 'medium' : 'low',
      },
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Check request for bot activity and log it
 */
export async function checkBotActivity(
  request: NextRequest,
  action: string = 'link_creation'
): Promise<{
  blocked: boolean;
  suspicious: boolean;
  reason?: string;
}> {
  const userAgent = request.headers.get('user-agent');
  const detection = isBotUserAgent(userAgent);
  
  if (detection.isBot) {
    await logBotSecurityEvent(action, 'BLOCKED', request, {
      reason: 'bot_detected',
      pattern: detection.matchedPattern,
      userAgent,
    });
    
    return {
      blocked: true,
      suspicious: false,
      reason: 'Bot activity detected'
    };
  }
  
  if (detection.isSuspicious) {
    await logBotSecurityEvent(action, 'SUSPICIOUS', request, {
      reason: 'suspicious_user_agent',
      pattern: detection.matchedPattern,
      userAgent,
    });
    
    return {
      blocked: false,
      suspicious: true,
      reason: 'Suspicious user agent detected'
    };
  }
  
  return {
    blocked: false,
    suspicious: false
  };
}

/**
 * Check if IP is temporarily blocked due to repeated violations
 */
export async function isIpBlocked(request: NextRequest): Promise<boolean> {
  const ipAddress = getIpAddress(request);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  try {
    const blockedCount = await prisma.securityLog.count({
      where: {
        ipAddress,
        severity: 'high',
        action: {
          contains: 'bot'
        },
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });
    
    return blockedCount >= 5;
  } catch (error) {
    console.error('Failed to check IP block status:', error);
    return false;
  }
}

/**
 * Get bot detection statistics
 */
export async function getBotStats(days: number = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  try {
    const [totalBlocked, totalSuspicious, recentActivity] = await Promise.all([
      prisma.securityLog.count({
        where: {
          details: {
            contains: 'bot_detected'
          },
          createdAt: { gte: since }
        }
      }),
      prisma.securityLog.count({
        where: {
          details: {
            contains: 'suspicious_user_agent'
          },
          createdAt: { gte: since }
        }
      }),
      prisma.securityLog.findMany({
        where: {
          OR: [
            { details: { contains: 'bot_detected' } },
            { details: { contains: 'suspicious_user_agent' } }
          ],
          createdAt: { gte: since }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    ]);
    
    return {
      totalBlocked,
      totalSuspicious,
      recentActivity,
    };
  } catch (error) {
    console.error('Failed to get bot stats:', error);
    return {
      totalBlocked: 0,
      totalSuspicious: 0,
      recentActivity: [],
    };
  }
}
