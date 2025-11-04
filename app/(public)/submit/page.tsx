import { ApologyFormWithTurnstile } from "@/features/apologies/components/apology-form-with-turnstile";
import { getPublicSettings } from "@/server/queries/settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const description = "Share your anonymous apology and let your heartfelt message reach those who matter";
  
  return {
    title: "Submit Apology",
    description,
    openGraph: {
      title: `Submit Apology - ${settings.siteName}`,
      description,
      images: settings.ogImage ? [settings.ogImage] : [],
    },
    twitter: {
      card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: `Submit Apology - ${settings.siteName}`,
      description,
    },
  };
}

export default async function SubmitPage() {
  const settings = await getPublicSettings();

  return (
    <div className="container px-4 py-12">
      <ApologyFormWithTurnstile maxLength={settings.maxApologyLength} />
    </div>
  );
}
