import { Suspense } from "react";
import { ApologyList } from "@/features/apologies/components/apology-list";
import { ApologyFilter } from "@/features/apologies/components/apology-filter";
import { getApologies } from "@/server/queries/apologies";
import { getPublicSettings } from "@/server/queries/settings";
import { Loading } from "@/ui/components/shared/loading";
import { Button } from "@/ui/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const description = "Read anonymous apologies from around the world. Discover heartfelt messages and find the apology meant for you.";
  
  return {
    title: "Browse Apologies",
    description,
    openGraph: {
      title: `Browse Apologies - ${settings.siteName}`,
      description,
      images: settings.ogImage ? [settings.ogImage] : [],
    },
    twitter: {
      card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: `Browse Apologies - ${settings.siteName}`,
      description,
    },
  };
}

interface BrowsePageProps {
  searchParams: {
    search?: string;
    page?: string;
    sortBy?: "createdAt" | "views";
    sortOrder?: "asc" | "desc";
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const page = parseInt(searchParams.page || "1");
  const { apologies, pagination } = await getApologies({
    search: searchParams.search,
    page,
    pageSize: 20,
    sortBy: searchParams.sortBy || "createdAt",
    sortOrder: searchParams.sortOrder || "desc",
  });

  return (
    <div className="container px-4 py-12">
      <div className="mx-auto mb-8 max-w-4xl">
        <div className="mb-6 rounded-2xl backdrop-blur-lg bg-blue-600 dark:bg-blue-700 p-6 text-white shadow-xl border border-blue-500/20">
          <div className="mb-2 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold">Find Message</h2>
          </div>
          <p className="text-sm text-white/90">
            Scroll the latest messages or start typing recipient name to find your messages.
          </p>
        </div>
        <Suspense fallback={<Loading />}>
          <ApologyFilter />
        </Suspense>
      </div>

      <div className="mx-auto max-w-4xl">
        <ApologyList apologies={apologies} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`}>
              <Button variant="outline" className="rounded-xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 px-6 shadow-lg hover:shadow-xl transition-all">Previous</Button>
            </Link>
          )}
          <span className="px-4 text-sm font-medium dark:text-white">
            Page {page} of {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link href={`?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ""}`}>
              <Button variant="outline" className="rounded-xl backdrop-blur-lg bg-white/60 dark:bg-gray-800/60 border border-white/20 px-6 shadow-lg hover:shadow-xl transition-all">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
