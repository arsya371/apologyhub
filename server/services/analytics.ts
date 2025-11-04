import { prisma } from "../db/client";

export async function trackVisit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.analytics.upsert({
      where: { date: today },
      update: {
        visits: { increment: 1 },
      },
      create: {
        date: today,
        visits: 1,
        submissions: 0,
        views: 0,
      },
    });
  } catch (error) {
    console.error("Failed to track visit:", error);
  }
}

export async function trackSubmission() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.analytics.upsert({
      where: { date: today },
      update: {
        submissions: { increment: 1 },
      },
      create: {
        date: today,
        visits: 0,
        submissions: 1,
        views: 0,
      },
    });
  } catch (error) {
    console.error("Failed to track submission:", error);
  }
}

export async function trackView() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.analytics.upsert({
      where: { date: today },
      update: {
        views: { increment: 1 },
      },
      create: {
        date: today,
        visits: 0,
        submissions: 0,
        views: 1,
      },
    });
  } catch (error) {
    console.error("Failed to track view:", error);
  }
}
