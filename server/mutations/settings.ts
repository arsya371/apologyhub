import { prisma } from "../db/client";

export async function updateSettings(data: {
  siteName?: string;
  announcement?: string | null;
  showAnnouncement?: boolean;
  maxApologyLength?: number;
  enableModeration?: boolean;
  siteDescription?: string | null;
  siteKeywords?: string | null;
  siteUrl?: string | null;
  ogImage?: string | null;
  twitterHandle?: string | null;
  twitterCard?: string | null;
}) {
  const settings = await prisma.settings.findFirst();

  if (!settings) {
    return prisma.settings.create({
      data: {
        id: "default",
        ...data,
      },
    });
  }

  const updated = await prisma.settings.update({
    where: { id: settings.id },
    data,
  });

  await prisma.activityLog.create({
    data: {
      action: "SETTINGS_UPDATED",
      details: "Site settings updated",
    },
  });

  return updated;
}

export async function updateAnnouncement(announcement: string | null, show: boolean) {
  const settings = await prisma.settings.findFirst();

  if (!settings) {
    return prisma.settings.create({
      data: {
        id: "default",
        announcement,
        showAnnouncement: show,
      },
    });
  }

  return prisma.settings.update({
    where: { id: settings.id },
    data: {
      announcement,
      showAnnouncement: show,
    },
  });
}
