"use client";

import { useState } from "react";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Textarea } from "@/ui/components/ui/textarea";
import { Label } from "@/ui/components/ui/label";
import { Switch } from "@/ui/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card";
import { toast } from "sonner";
import { Loader2, Settings as SettingsIcon, Bell, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { Settings } from "../types";

interface SettingsFormProps {
  initialSettings: Settings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-2 bg-card dark:bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Configure your platform's basic settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxApologyLength">Max Apology Length</Label>
              <Input
                id="maxApologyLength"
                type="number"
                min="100"
                max="2000"
                value={settings.maxApologyLength}
                onChange={(e) =>
                  setSettings({ ...settings, maxApologyLength: parseInt(e.target.value) })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum characters allowed per apology (100-2000)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-2 bg-card dark:bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Announcement</CardTitle>
            </div>
            <CardDescription>Display a message to all visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement Text</Label>
              <Textarea
                id="announcement"
                value={settings.announcement || ""}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                placeholder="Enter announcement message..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Supports markdown links: [Link Text](https://example.com)
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="showAnnouncement" className="cursor-pointer font-medium">
                  Show announcement on homepage
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display the announcement banner to visitors
                </p>
              </div>
              <Switch
                id="showAnnouncement"
                checked={settings.showAnnouncement}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, showAnnouncement: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-2 bg-card dark:bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>SEO Settings</CardTitle>
            </div>
            <CardDescription>Optimize your site for search engines and social media</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription || ""}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                placeholder="A brief description of your site for search engines..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Used in meta description and social media previews (recommended: 150-160 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteKeywords">Keywords</Label>
              <Input
                id="siteKeywords"
                value={settings.siteKeywords || ""}
                onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                placeholder="apology, anonymous, heartfelt, messages"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords for SEO
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={settings.siteUrl || ""}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                placeholder="https://yoursite.com"
              />
              <p className="text-xs text-muted-foreground">
                Your site's canonical URL (used for Open Graph and sitemaps)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">Open Graph Image URL</Label>
              <Input
                id="ogImage"
                type="url"
                value={settings.ogImage || ""}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                placeholder="https://yoursite.com/og-image.png"
              />
              <p className="text-xs text-muted-foreground">
                Image shown when sharing on social media (recommended: 1200x630px)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle</Label>
              <Input
                id="twitterHandle"
                value={settings.twitterHandle || ""}
                onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                placeholder="@yourhandle"
              />
              <p className="text-xs text-muted-foreground">
                Your Twitter/X username (include the @)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterCard">Twitter Card Type</Label>
              <select
                id="twitterCard"
                value={settings.twitterCard || "summary_large_image"}
                onChange={(e) => setSettings({ ...settings, twitterCard: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
              <p className="text-xs text-muted-foreground">
                How Twitter displays your content when shared
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </motion.div>
    </form>
  );
}
