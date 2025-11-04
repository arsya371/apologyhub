import type { MetadataRoute } from 'next';
import { getPublicSettings } from '@/server/queries/settings';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSettings();
  const baseUrl = settings.siteUrl || 'https://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/pradmin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
