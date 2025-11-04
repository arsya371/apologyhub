interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RequestTimestamp {
  [key: string]: number[];
}

const store: RateLimitStore = {};
const requestMap: RequestTimestamp = {};

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number; isSpam?: boolean } {
  const now = Date.now();
  const key = identifier;

  if (!requestMap[key]) {
    requestMap[key] = [];
  }
  requestMap[key].push(now);

  requestMap[key] = requestMap[key].filter((ts) => now - ts < 3600000);

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
      isSpam: false,
    };
  }

  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
      isSpam: detectSpam(key, requestMap),
    };
  }

  store[key].count++;
  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
    isSpam: false,
  };
}

/**
 * Detect spam based on request frequency
 */
export function detectSpam(
  identifier: string,
  requestTimestamps: RequestTimestamp,
  threshold?: number
): boolean {
  const now = Date.now();
  if (!requestTimestamps[identifier]) return false;
  const recentRequests = requestTimestamps[identifier].filter(
    (ts) => now - ts < 60000
  );

  const requestLimit = threshold || parseInt(process.env.REQUEST_LIMIT || '20', 10);
  return recentRequests.length > requestLimit;
}

/**
 * Check if IP shows suspicious activity patterns
 */
export function isSuspiciousActivity(
  identifier: string,
  options: {
    shortTermThreshold?: number; // requests per minute
    mediumTermThreshold?: number; // requests per 5 minutes
    longTermThreshold?: number; // requests per hour
  } = {}
): { suspicious: boolean; reason?: string; requestCounts?: { minute: number; fiveMinutes: number; hour: number } } {
  const now = Date.now();
  if (!requestMap[identifier]) {
    return { suspicious: false };
  }

  const requests = requestMap[identifier];
  
  const lastMinute = requests.filter((ts) => now - ts < 60000).length;
  const last5Minutes = requests.filter((ts) => now - ts < 300000).length;
  const lastHour = requests.filter((ts) => now - ts < 3600000).length;

  const shortTerm = options.shortTermThreshold || 20;
  const mediumTerm = options.mediumTermThreshold || 50;
  const longTerm = options.longTermThreshold || 100;

  const requestCounts = {
    minute: lastMinute,
    fiveMinutes: last5Minutes,
    hour: lastHour,
  };

  if (lastMinute > shortTerm) {
    return { 
      suspicious: true, 
      reason: `Excessive requests in 1 minute: ${lastMinute}`,
      requestCounts 
    };
  }

  if (last5Minutes > mediumTerm) {
    return { 
      suspicious: true, 
      reason: `Excessive requests in 5 minutes: ${last5Minutes}`,
      requestCounts 
    };
  }

  if (lastHour > longTerm) {
    return { 
      suspicious: true, 
      reason: `Excessive requests in 1 hour: ${lastHour}`,
      requestCounts 
    };
  }

  return { suspicious: false, requestCounts };
}

/**
 * Get request statistics for an identifier
 */
export function getRequestStats(identifier: string) {
  const now = Date.now();
  if (!requestMap[identifier]) {
    return {
      total: 0,
      lastMinute: 0,
      last5Minutes: 0,
      lastHour: 0,
    };
  }

  const requests = requestMap[identifier];
  return {
    total: requests.length,
    lastMinute: requests.filter((ts) => now - ts < 60000).length,
    last5Minutes: requests.filter((ts) => now - ts < 300000).length,
    lastHour: requests.filter((ts) => now - ts < 3600000).length,
  };
}

export function clearExpiredEntries() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

if (typeof window === "undefined") {
  setInterval(clearExpiredEntries, 5 * 60 * 1000);
}
