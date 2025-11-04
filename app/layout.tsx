import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import { Toaster } from "@/ui/components/ui/sonner";
import { ThemeProvider } from "@/ui/components/theme/theme-provider";
import { getPublicSettings } from "@/server/queries/settings";
import { WebsiteJsonLd } from "@/ui/components/seo/json-ld";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const description = settings.siteDescription || "An anonymous platform to share your heartfelt apologies";
  const keywords = settings.siteKeywords ? settings.siteKeywords.split(',').map(k => k.trim()) : ["apology", "anonymous", "heartfelt", "messages"];
  
  return {
    title: {
      default: `${settings.siteName} - Anonymous Apology Platform`,
      template: `%s | ${settings.siteName}`,
    },
    description,
    keywords,
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    publisher: settings.siteName,
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    openGraph: {
      title: `${settings.siteName} - Anonymous Apology Platform`,
      description,
      url: settings.siteUrl || undefined,
      siteName: settings.siteName,
      images: settings.ogImage ? [
        {
          url: settings.ogImage,
          width: 1200,
          height: 630,
          alt: `${settings.siteName} - Share your heartfelt apologies`,
        },
      ] : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: (settings.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: `${settings.siteName} - Anonymous Apology Platform`,
      description,
      creator: settings.twitterHandle || undefined,
      images: settings.ogImage ? [settings.ogImage] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {settings.siteUrl && (
          <WebsiteJsonLd
            name={settings.siteName}
            url={settings.siteUrl}
            description={settings.siteDescription || undefined}
          />
        )}
      </head>
      <body className={`${inter.className} ${caveat.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
