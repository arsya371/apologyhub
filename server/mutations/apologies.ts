import { prisma } from "../db/client";
import { sanitizeContent } from "@/lib/utils";
import { trackSubmission } from "../services/analytics";

export async function createApology({
  content,
  toWho,
  fromWho,
  ipAddress,
}: {
  content: string;
  toWho?: string | null;
  fromWho?: string | null;
  ipAddress?: string | null;
}) {
  const sanitizedContent = sanitizeContent(content);
  const sanitizedToWho = toWho ? sanitizeContent(toWho) : null;
  const sanitizedFromWho = fromWho ? sanitizeContent(fromWho) : null;

  const apology = await prisma.apology.create({
    data: {
      content: sanitizedContent,
      toWho: sanitizedToWho,
      fromWho: sanitizedFromWho,
      ipAddress,
    },
  });

  await trackSubmission();

  await prisma.activityLog.create({
    data: {
      action: "APOLOGY_CREATED",
      details: `New apology created: ${apology.id}`,
      ipAddress,
    },
  });

  return apology;
}

export async function updateApology(
  id: string,
  data: {
    content?: string;
    toWho?: string | null;
    fromWho?: string | null;
  }
) {
  const updateData: any = {};

  if (data.content) {
    updateData.content = sanitizeContent(data.content);
  }

  if (data.toWho !== undefined) {
    updateData.toWho = data.toWho ? sanitizeContent(data.toWho) : null;
  }

  if (data.fromWho !== undefined) {
    updateData.fromWho = data.fromWho ? sanitizeContent(data.fromWho) : null;
  }

  const apology = await prisma.apology.update({
    where: { id },
    data: updateData,
  });

  await prisma.activityLog.create({
    data: {
      action: "APOLOGY_UPDATED",
      details: `Apology updated: ${id}`,
    },
  });

  return apology;
}

export async function deleteApology(id: string) {
  const apology = await prisma.apology.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      action: "APOLOGY_DELETED",
      details: `Apology deleted: ${id}`,
    },
  });

  return apology;
}

export async function bulkDeleteApologies(ids: string[]) {
  const result = await prisma.apology.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "BULK_DELETE",
      details: `Deleted ${result.count} apologies`,
    },
  });

  return result;
}
