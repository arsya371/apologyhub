import { prisma } from "../db/client";

export async function getSettings() {
  let settings = await prisma.settings.findFirst();

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "default",
        siteName: "I'm Sorry",
        maxApologyLength: 500,
        enableModeration: true,
      },
    });
  }

  return settings;
}

export async function getPublicSettings() {
  const settings = await getSettings();

  return {
    siteName: settings.siteName,
    announcement: settings.showAnnouncement ? settings.announcement : null,
    maxApologyLength: settings.maxApologyLength,
    siteDescription: settings.siteDescription,
    siteKeywords: settings.siteKeywords,
    siteUrl: settings.siteUrl,
    ogImage: settings.ogImage,
    twitterHandle: settings.twitterHandle,
    twitterCard: settings.twitterCard,
  };
}
