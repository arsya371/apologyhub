interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name: string;
  url: string;
  description?: string;
}

export function WebsiteJsonLd({ name, url, description }: WebsiteJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/browse?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

interface ArticleJsonLdProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  dateModified,
  author,
  url,
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: author
      ? {
          '@type': 'Person',
          name: author,
        }
      : undefined,
    url,
  };

  return <JsonLd data={data} />;
}
