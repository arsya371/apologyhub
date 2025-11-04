import type { MetadataRoute } from 'next';
import { getPublicSettings } from '@/server/queries/settings';
import { prisma } from '@/server/db/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettings();
  const baseUrl = settings.siteUrl || 'https://localhost:3000';

  const apologies = await prisma.apology.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const apologyRoutes: MetadataRoute.Sitemap = apologies.map((apology) => ({
    url: `${baseUrl}/apology/${apology.id}`,
    lastModified: apology.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...apologyRoutes];
}
