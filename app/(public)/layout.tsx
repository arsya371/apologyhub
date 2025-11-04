import { Header } from "@/ui/components/layout/header";
import { Footer } from "@/ui/components/layout/footer";
import { AnnouncementBanner } from "@/ui/components/layout/announcement-banner";
import { getPublicSettings } from "@/server/queries/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header siteName={settings.siteName} />
      {settings.announcement && <AnnouncementBanner message={settings.announcement} />}
      <main className="flex-1">{children}</main>
      <Footer siteName={settings.siteName} />
    </div>
  );
}
