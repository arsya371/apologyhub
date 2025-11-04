import { SettingsForm } from "@/features/admin/components/settings-form";
import { getSettings } from "@/server/queries/settings";

export const metadata = {
  title: "Settings - Admin Panel",
  description: "Manage site settings",
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Manage your site configuration</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
