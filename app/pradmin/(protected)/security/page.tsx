"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/components/ui/card";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select";
import { Badge } from "@/ui/components/ui/badge";
import { toast } from "sonner";
import { Shield, Ban, CheckCircle, AlertTriangle, Trash2, Plus, Bot } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  expiresAt: string | null;
  isActive: boolean;
  requestCount: number;
}

interface AllowedIP {
  id: string;
  ipAddress: string;
  description: string;
  addedAt: string;
  addedBy: string;
  expiresAt: string | null;
  isActive: boolean;
}

interface SecurityLog {
  id: string;
  ipAddress: string;
  action: string;
  endpoint: string | null;
  userAgent?: string | null;
  details: string | null;
  severity: string;
  createdAt: string;
}

interface ProfanityWord {
  id: string;
  word: string;
  language: string;
  severity: string;
  isActive: boolean;
  addedBy: string | null;
  createdAt: string;
}

interface BotStats {
  totalBlocked: number;
  totalSuspicious: number;
  recentActivity: SecurityLog[];
}

export default function SecurityPage() {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [profanityWords, setProfanityWords] = useState<ProfanityWord[]>([]);
  const [botStats, setBotStats] = useState<BotStats>({ totalBlocked: 0, totalSuspicious: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);

  // Block IP form
  const [blockIPForm, setBlockIPForm] = useState({
    ipAddress: "",
    reason: "",
    expiresAt: "",
    blockInCloudflare: true,
  });

  // Allow IP form
  const [allowIPForm, setAllowIPForm] = useState({
    ipAddress: "",
    description: "",
    expiresAt: "",
  });

  // Profanity word form
  const [profanityForm, setProfanityForm] = useState({
    word: "",
    language: "en",
    severity: "medium",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [blockedRes, allowedRes, logsRes, profanityRes, botStatsRes] = await Promise.all([
        fetch("/api/admin/security/blocked-ips"),
        fetch("/api/admin/security/allowed-ips"),
        fetch("/api/admin/security/logs?limit=50"),
        fetch("/api/admin/profanity"),
        fetch("/api/admin/security/bot-stats?days=7"),
      ]);

      if (blockedRes.ok) setBlockedIPs(await blockedRes.json());
      if (allowedRes.ok) setAllowedIPs(await allowedRes.json());
      if (logsRes.ok) setSecurityLogs(await logsRes.json());
      if (profanityRes.ok) setProfanityWords(await profanityRes.json());
      if (botStatsRes.ok) setBotStats(await botStatsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/security/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blockIPForm),
      });

      if (res.ok) {
        toast.success("IP blocked successfully");
        setBlockIPForm({ ipAddress: "", reason: "", expiresAt: "", blockInCloudflare: true });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to block IP");
      }
    } catch {
      toast.error("Failed to block IP");
    }
  };

  const handleUnblockIP = async (ipAddress: string) => {
    try {
      const res = await fetch(`/api/admin/security/blocked-ips?ipAddress=${ipAddress}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("IP unblocked successfully");
        fetchData();
      } else {
        toast.error("Failed to unblock IP");
      }
    } catch {
      toast.error("Failed to unblock IP");
    }
  };

  const handleAllowIP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/security/allowed-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allowIPForm),
      });

      if (res.ok) {
        toast.success("IP added to allowlist");
        setAllowIPForm({ ipAddress: "", description: "", expiresAt: "" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add IP to allowlist");
      }
    } catch {
      toast.error("Failed to add IP to allowlist");
    }
  };

  const handleRemoveAllowedIP = async (ipAddress: string) => {
    try {
      const res = await fetch(`/api/admin/security/allowed-ips?ipAddress=${ipAddress}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("IP removed from allowlist");
        fetchData();
      } else {
        toast.error("Failed to remove IP from allowlist");
      }
    } catch {
      toast.error("Failed to remove IP from allowlist");
    }
  };

  const handleAddProfanity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/profanity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profanityForm),
      });

      if (res.ok) {
        toast.success("Profanity word added");
        setProfanityForm({ word: "", language: "en", severity: "medium" });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add profanity word");
      }
    } catch {
      toast.error("Failed to add profanity word");
    }
  };

  const handleRemoveProfanity = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/profanity?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Profanity word removed");
        fetchData();
      } else {
        toast.error("Failed to remove profanity word");
      }
    } catch {
      toast.error("Failed to remove profanity word");
    }
  };

  const getSeverityColor = (severity: string): "destructive" | "default" | "secondary" => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p>Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Security Management</h1>
          <p className="text-muted-foreground">Manage IP blocking, allowlists, and content moderation</p>
        </div>
      </div>

      <Tabs defaultValue="blocked" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="blocked">
            <Ban className="w-4 h-4 mr-2" />
            Blocked IPs ({blockedIPs.filter(ip => ip.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="allowed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Allowed IPs ({allowedIPs.filter(ip => ip.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="bots">
            <Bot className="w-4 h-4 mr-2" />
            Bot Detection
          </TabsTrigger>
          <TabsTrigger value="logs">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Security Logs
          </TabsTrigger>
          <TabsTrigger value="profanity">
            Profanity Filter ({profanityWords.filter(w => w.isActive).length})
          </TabsTrigger>
        </TabsList>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block IP Address</CardTitle>
              <CardDescription>Add an IP address to the blocklist</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBlockIP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockIP">IP Address</Label>
                    <Input
                      id="blockIP"
                      placeholder="192.168.1.1"
                      value={blockIPForm.ipAddress}
                      onChange={(e) => setBlockIPForm({ ...blockIPForm, ipAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockExpires">Expires At (Optional)</Label>
                    <Input
                      id="blockExpires"
                      type="datetime-local"
                      value={blockIPForm.expiresAt}
                      onChange={(e) => setBlockIPForm({ ...blockIPForm, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockReason">Reason</Label>
                  <Textarea
                    id="blockReason"
                    placeholder="Reason for blocking this IP..."
                    value={blockIPForm.reason}
                    onChange={(e) => setBlockIPForm({ ...blockIPForm, reason: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">
                  <Ban className="w-4 h-4 mr-2" />
                  Block IP
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked IP Addresses</CardTitle>
              <CardDescription>Currently blocked IPs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockedIPs.filter(ip => ip.isActive).map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{ip.ipAddress}</code>
                        <Badge variant="destructive">Blocked</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ip.reason}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Blocked by: {ip.blockedBy}</span>
                        <span>At: {formatDate(ip.blockedAt)}</span>
                        {ip.expiresAt && <span>Expires: {formatDate(ip.expiresAt)}</span>}
                        <span>Requests: {ip.requestCount}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblockIP(ip.ipAddress)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
                {blockedIPs.filter(ip => ip.isActive).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No blocked IPs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allowed IPs Tab */}
        <TabsContent value="allowed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add to Allowlist</CardTitle>
              <CardDescription>Add an IP address to bypass security checks</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAllowIP} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowIP">IP Address</Label>
                    <Input
                      id="allowIP"
                      placeholder="192.168.1.1"
                      value={allowIPForm.ipAddress}
                      onChange={(e) => setAllowIPForm({ ...allowIPForm, ipAddress: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowExpires">Expires At (Optional)</Label>
                    <Input
                      id="allowExpires"
                      type="datetime-local"
                      value={allowIPForm.expiresAt}
                      onChange={(e) => setAllowIPForm({ ...allowIPForm, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowDescription">Description</Label>
                  <Textarea
                    id="allowDescription"
                    placeholder="Description for this IP..."
                    value={allowIPForm.description}
                    onChange={(e) => setAllowIPForm({ ...allowIPForm, description: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Allowlist
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allowed IP Addresses</CardTitle>
              <CardDescription>IPs that bypass security checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allowedIPs.filter(ip => ip.isActive).map((ip) => (
                  <div key={ip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{ip.ipAddress}</code>
                        <Badge variant="secondary">Allowed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ip.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Added by: {ip.addedBy}</span>
                        <span>At: {formatDate(ip.addedAt)}</span>
                        {ip.expiresAt && <span>Expires: {formatDate(ip.expiresAt)}</span>}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAllowedIP(ip.ipAddress)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {allowedIPs.filter(ip => ip.isActive).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No allowed IPs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Detection Tab */}
        <TabsContent value="bots" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blocked Bots</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{botStats.totalBlocked}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suspicious Activity</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{botStats.totalSuspicious}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Events</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{botStats.totalBlocked + botStats.totalSuspicious}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bot Activity</CardTitle>
              <CardDescription>Detected bot and suspicious requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {botStats.recentActivity.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <code className="text-sm font-mono">{log.ipAddress}</code>
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    )}
                    {log.userAgent && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        User-Agent: {log.userAgent}
                      </p>
                    )}
                  </div>
                ))}
                {botStats.recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No bot activity detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bot Detection Patterns</CardTitle>
              <CardDescription>Patterns used to detect automated requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Blocked Patterns</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="destructive">Scrapers (scrapy, crawl, spider)</Badge>
                    <Badge variant="destructive">HTTP Libraries (curl, wget, axios)</Badge>
                    <Badge variant="destructive">Headless Browsers (puppeteer, selenium)</Badge>
                    <Badge variant="destructive">Automation Tools (postman, insomnia)</Badge>
                    <Badge variant="destructive">Search Bots (googlebot, bingbot)</Badge>
                    <Badge variant="destructive">Generic Bots (bot, crawler, scraper)</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Detection Rules</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Empty or missing User-Agent headers</li>
                    <li>• Old or incomplete User-Agent strings</li>
                    <li>• Known bot and scraper patterns</li>
                    <li>• HTTP library signatures</li>
                    <li>• Headless browser indicators</li>
                    <li>• Automated tool fingerprints</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Auto-Block Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    IPs with 5 or more blocked bot attempts within 5 minutes are temporarily blocked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Logs</CardTitle>
              <CardDescription>Recent security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityLogs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{log.ipAddress}</code>
                        <Badge variant={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    )}
                    {log.endpoint && (
                      <p className="text-xs text-muted-foreground">Endpoint: {log.endpoint}</p>
                    )}
                  </div>
                ))}
                {securityLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No security logs</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profanity Filter Tab */}
        <TabsContent value="profanity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Profanity Word</CardTitle>
              <CardDescription>Add a word to the profanity filter</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProfanity} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profanityWord">Word</Label>
                    <Input
                      id="profanityWord"
                      placeholder="Enter word..."
                      value={profanityForm.word}
                      onChange={(e) => setProfanityForm({ ...profanityForm, word: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profanityLanguage">Language</Label>
                    <Select
                      value={profanityForm.language}
                      onValueChange={(value: string) => setProfanityForm({ ...profanityForm, language: value })}
                    >
                      <SelectTrigger id="profanityLanguage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Indonesian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profanitySeverity">Severity</Label>
                    <Select
                      value={profanityForm.severity}
                      onValueChange={(value: string) => setProfanityForm({ ...profanityForm, severity: value })}
                    >
                      <SelectTrigger id="profanitySeverity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Word
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profanity Words</CardTitle>
              <CardDescription>Words filtered by the moderation system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {profanityWords.filter(w => w.isActive).map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold">{word.word}</code>
                        <Badge variant="outline">{word.language}</Badge>
                        <Badge variant={getSeverityColor(word.severity)}>
                          {word.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added: {formatDate(word.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProfanity(word.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {profanityWords.filter(w => w.isActive).length === 0 && (
                  <p className="text-center text-muted-foreground py-8 col-span-2">
                    No profanity words configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
