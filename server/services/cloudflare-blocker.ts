import axios from 'axios';

interface CloudflareResponse {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  result?: {
    id: string;
    mode: string;
    configuration: {
      target: string;
      value: string;
    };
    notes: string;
  };
}

export class CloudflareIPBlocker {
  private apiToken: string;
  private zoneId: string;
  private apiBase: string;

  constructor(apiToken?: string, zoneId?: string) {
    this.apiToken = apiToken || process.env.CLOUDFLARE_API_TOKEN || '';
    this.zoneId = zoneId || process.env.CLOUDFLARE_ZONE_ID || '';
    this.apiBase = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/firewall/access_rules/rules`;
  }

  /**
   * Block an IP address in Cloudflare
   */
  async blockIP(ip: string, note: string = 'Blocked due to spam'): Promise<CloudflareResponse | null> {
    if (!this.apiToken || !this.zoneId) {
      console.warn('Cloudflare credentials not configured. Skipping IP block.');
      return null;
    }

    try {
      const response = await axios.post<CloudflareResponse>(
        this.apiBase,
        {
          mode: 'block',
          configuration: {
            target: 'ip',
            value: ip,
          },
          notes: note,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        console.error('Failed to block IP:', response.data.errors);
      } else {
        console.log(`Blocked IP: ${ip}`);
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Cloudflare API error:', error.response.data);
      } else if (error instanceof Error) {
        console.error('Request error:', error.message);
      } else {
        console.error('Request error: Unknown error');
      }
      return null;
    }
  }

  /**
   * Unblock an IP address in Cloudflare
   */
  async unblockIP(ruleId: string): Promise<CloudflareResponse | null> {
    if (!this.apiToken || !this.zoneId) {
      console.warn('Cloudflare credentials not configured. Skipping IP unblock.');
      return null;
    }

    try {
      const response = await axios.delete<CloudflareResponse>(
        `${this.apiBase}/${ruleId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        console.error('Failed to unblock IP:', response.data.errors);
      } else {
        console.log(`Unblocked rule: ${ruleId}`);
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Cloudflare API error:', error.response.data);
      } else if (error instanceof Error) {
        console.error('Request error:', error.message);
      } else {
        console.error('Request error: Unknown error');
      }
      return null;
    }
  }

  /**
   * Detect spam based on request frequency
   */
  detectSpam(
    ip: string,
    requestMap: Record<string, number[]>,
    threshold?: number
  ): boolean {
    const now = Date.now();
    if (!requestMap[ip]) requestMap[ip] = [];

    requestMap[ip].push(now);

    // Keep only requests from the last 60 seconds
    requestMap[ip] = requestMap[ip].filter((ts) => now - ts < 60000);

    const requestLimit = threshold || parseInt(process.env.REQUEST_LIMIT || '20', 10);
    return requestMap[ip].length > requestLimit;
  }

  /**
   * Check if IP is suspicious based on multiple factors
   */
  isSuspiciousActivity(
    ip: string,
    requestMap: Record<string, number[]>,
    options: {
      shortTermThreshold?: number; // requests per minute
      mediumTermThreshold?: number; // requests per 5 minutes
      longTermThreshold?: number; // requests per hour
    } = {}
  ): { suspicious: boolean; reason?: string } {
    const now = Date.now();
    if (!requestMap[ip]) return { suspicious: false };

    const requests = requestMap[ip];
    
    const lastMinute = requests.filter((ts) => now - ts < 60000).length;
    const last5Minutes = requests.filter((ts) => now - ts < 300000).length;
    const lastHour = requests.filter((ts) => now - ts < 3600000).length;

    const shortTerm = options.shortTermThreshold || 20;
    const mediumTerm = options.mediumTermThreshold || 50;
    const longTerm = options.longTermThreshold || 100;

    if (lastMinute > shortTerm) {
      return { suspicious: true, reason: `Excessive requests in 1 minute: ${lastMinute}` };
    }

    if (last5Minutes > mediumTerm) {
      return { suspicious: true, reason: `Excessive requests in 5 minutes: ${last5Minutes}` };
    }

    if (lastHour > longTerm) {
      return { suspicious: true, reason: `Excessive requests in 1 hour: ${lastHour}` };
    }

    return { suspicious: false };
  }
}

let cloudflareBlocker: CloudflareIPBlocker | null = null;

export function getCloudflareBlocker(): CloudflareIPBlocker {
  if (!cloudflareBlocker) {
    cloudflareBlocker = new CloudflareIPBlocker();
  }
  return cloudflareBlocker;
}
