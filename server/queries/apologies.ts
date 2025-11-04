import { prisma } from "../db/client";
import { Prisma } from "@prisma/client";

export async function getApologies({
  search,
  toWho,
  page = 1,
  pageSize = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  search?: string;
  toWho?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "views";
  sortOrder?: "asc" | "desc";
}) {
  const where: Prisma.ApologyWhereInput = {};

  if (search) {
    where.content = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (toWho) {
    where.toWho = {
      contains: toWho,
      mode: "insensitive",
    };
  }

  const [apologies, total] = await Promise.all([
    prisma.apology.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.apology.count({ where }),
  ]);

  return {
    apologies,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getApologyById(id: string) {
  return prisma.apology.findUnique({
    where: { id },
  });
}

export async function getFeaturedApologies(limit = 6) {
  return prisma.apology.findMany({
    orderBy: { views: "desc" },
    take: limit,
  });
}

export async function getRecentApologies(limit = 10) {
  return prisma.apology.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getApologyStats() {
  const [totalApologies, totalViews] = await Promise.all([
    prisma.apology.count(),
    prisma.apology.aggregate({
      _sum: {
        views: true,
      },
    }),
  ]);

  return {
    totalApologies,
    totalViews: totalViews._sum.views || 0,
  };
}

export async function incrementApologyViews(id: string) {
  return prisma.apology.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });
}
