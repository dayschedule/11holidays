export const SITE_URL = 'https://11holidays.com';
export const SITE_NAME = '11holidays';

interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  path?: string;
  noindex?: boolean;
}

/** Builds the `meta` and `links` arrays for a TanStack Router `head()` */
export function seo({
  title,
  description,
  keywords,
  image,
  type = 'website',
  path,
  noindex,
}: SeoOptions) {
  const meta = [
    { title },
    { property: 'og:title', content: title },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { name: 'twitter:title', content: title },
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    ...(description
      ? [
          { name: 'description', content: description },
          { property: 'og:description', content: description },
          { name: 'twitter:description', content: description },
        ]
      : []),
    ...(keywords?.length ? [{ name: 'keywords', content: keywords.join(', ') }] : []),
    ...(image
      ? [
          { property: 'og:image', content: image },
          { name: 'twitter:image', content: image },
        ]
      : []),
    ...(path ? [{ property: 'og:url', content: `${SITE_URL}${path}` }] : []),
    ...(noindex ? [{ name: 'robots', content: 'noindex' }] : []),
  ];

  const links = path ? [{ rel: 'canonical', href: `${SITE_URL}${path}` }] : [];

  return { meta, links };
}
