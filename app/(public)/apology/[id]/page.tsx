import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/ui/components/ui/button";
import { ApologyDetail } from "@/features/apologies/components/apology-detail";
import { getApologyById, incrementApologyViews, getRecentApologies } from "@/server/queries/apologies";
import { getPublicSettings } from "@/server/queries/settings";
import { trackView } from "@/server/services/analytics";
import { ArticleJsonLd } from "@/ui/components/seo/json-ld";
import { ROUTES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [apology, settings] = await Promise.all([
    getApologyById(id),
    getPublicSettings(),
  ]);

  if (!apology) {
    return {
      title: "Apology Not Found",
    };
  }

  const title = `Apology ${apology.toWho ? `to ${apology.toWho}` : ""}`;
  const description = apology.content.substring(0, 160);
  const url = settings.siteUrl ? `${settings.siteUrl}/apology/${id}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title: `${title} - ${settings.siteName}`,
      description,
      url,
      images: settings.ogImage ? [settings.ogImage] : [],
      type: "article",
      publishedTime: apology.createdAt.toISOString(),
    },
    twitter: {
      card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: `${title} - ${settings.siteName}`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ApologyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [apology, settings] = await Promise.all([
    getApologyById(id),
    getPublicSettings(),
  ]);

  if (!apology) {
    notFound();
  }

  // Increment views
  await Promise.all([
    incrementApologyViews(id),
    trackView(),
  ]);

  // const relatedApologies = await getRecentApologies(3);
  const url = settings.siteUrl ? `${settings.siteUrl}/apology/${id}` : undefined;

  return (
    <>
      {url && (
        <ArticleJsonLd
          headline={`Apology ${apology.toWho ? `to ${apology.toWho}` : ""}`}
          description={apology.content.substring(0, 160)}
          datePublished={apology.createdAt.toISOString()}
          dateModified={apology.updatedAt.toISOString()}
          author={apology.fromWho || "Anonymous"}
          url={url}
        />
      )}
      <div className="container px-4 py-12">
        <ApologyDetail apology={{ ...apology, views: apology.views + 1 }} />

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <h2 className="font-caveat mb-6 text-4xl font-medium text-gray-900 dark:text-white">
            Want to send an apology?
          </h2>
          <Link href={ROUTES.submit}>
            <Button size="lg" className="rounded-lg bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base font-semibold text-white">
              Write apology now
            </Button>
          </Link>
        </section>
      </div>
    </>
  );
}
