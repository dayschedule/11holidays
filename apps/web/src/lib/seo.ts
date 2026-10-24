import type { ComponentProps } from 'react';

export const SITE_URL = 'https://11holidays.com';
export const SITE_NAME = '11holidays';
export const API_URL = 'https://api.11holidays.com/v1';
export const OPENAPI_URL = `${API_URL}/openapi.json`;
export const DEFAULT_IMAGE = `${SITE_URL}/android-chrome-512x512.png`;

type JsonLd = Record<string, unknown>;
type MetaTag = ComponentProps<'meta'>;

interface SeoOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  path?: string;
  noindex?: boolean;
  /** Schema.org objects rendered as `application/ld+json` in the head */
  jsonLd?: JsonLd[];
}

export const absoluteUrl = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

/** Builds the `meta` and `links` arrays for a TanStack Router `head()` */
export function seo({ title, description, keywords, image, type = 'website', path, noindex, jsonLd }: SeoOptions) {
  const ogImage = absoluteUrl(image ?? DEFAULT_IMAGE);

  const meta: MetaTag[] = [
    { title },
    { property: 'og:title', content: title },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:image', content: ogImage },
    { name: 'twitter:title', content: title },
    { name: 'twitter:image', content: ogImage },
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    ...(description
      ? [
          { name: 'description', content: description },
          { property: 'og:description', content: description },
          { name: 'twitter:description', content: description },
        ]
      : []),
    ...(keywords?.length ? [{ name: 'keywords', content: keywords.join(', ') }] : []),
    ...(path ? [{ property: 'og:url', content: absoluteUrl(path) }] : []),
    {
      name: 'robots',
      content: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
    },
    // TanStack renders `script:ld+json` meta entries as JSON-LD script tags
    ...(jsonLd ?? []).map(
      (schema) => ({ 'script:ld+json': { '@context': 'https://schema.org', ...schema } }) as unknown as MetaTag,
    ),
  ];

  const links = path ? [{ rel: 'canonical', href: absoluteUrl(path) }] : [];

  return { meta, links };
}

// Schema.org builders

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const organizationSchema = (): JsonLd => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 480, height: 160 },
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', url: `${SITE_URL}/contact` },
});

export const websiteSchema = (): JsonLd => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Public holidays, festivals and long weekends for 230+ countries, with calendars, widgets and an API.',
  inLanguage: 'en',
  publisher: { '@id': ORGANIZATION_ID },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const webPageSchema = (
  path: string,
  name: string,
  description?: string,
  type: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage' | 'SearchResultsPage' = 'WebPage',
): JsonLd => ({
  '@type': type,
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name,
  description,
  inLanguage: 'en',
  isPartOf: { '@id': WEBSITE_ID },
});

export const webApiSchema = (): JsonLd => ({
  '@type': 'WebAPI',
  name: '11holidays Holidays API',
  description:
    'REST API returning public holidays and observances for 230+ countries by ISO 3166-1 alpha-2 code and year.',
  url: `${SITE_URL}/api-key`,
  documentation: `${SITE_URL}/llms.txt`,
  termsOfService: `${SITE_URL}/terms`,
  provider: { '@id': ORGANIZATION_ID },
});

export const softwareAppSchema = (name: string, path: string, description: string): JsonLd => ({
  '@type': 'WebApplication',
  name,
  url: absoluteUrl(path),
  description,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@id': ORGANIZATION_ID },
});

export interface HolidayLike {
  name: string;
  date: string;
  type?: string;
  url?: string | null;
}

const MAX_LIST_ITEMS = 100;

/**
 * ItemList of holidays, each as a dated Event so agents can read name, date and country directly.
 * Regional duplicates (same name and date) are merged and the list is capped to keep the page light.
 */
export const holidayListSchema = (name: string, countryName: string, holidays: HolidayLike[]): JsonLd => {
  const unique = [...new Map(holidays.map((h) => [`${h.date}|${h.name}`, h])).values()].slice(0, MAX_LIST_ITEMS);
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: unique.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: unique.map((h, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: h.name,
        startDate: h.date,
        endDate: h.date,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Country', name: countryName },
        ...(h.type && { keywords: h.type }),
        ...(h.url && { url: `${SITE_URL}/holidays/${h.url}` }),
      },
    })),
  };
};

/** Dataset describing a country's holiday data and where to download it */
export const holidayDatasetSchema = (countryName: string, countryCode: string, year: number, path: string): JsonLd => ({
  '@type': 'Dataset',
  name: `${countryName} public holidays ${year}`,
  description: `Dates, names and types of public holidays, observances and festivals in ${countryName} (${countryCode}) for ${year}.`,
  url: absoluteUrl(path),
  keywords: [`${countryName} holidays`, `${countryName} public holidays ${year}`, 'bank holidays', 'holiday calendar'],
  temporalCoverage: `${year}-01-01/${year}-12-31`,
  spatialCoverage: { '@type': 'Country', name: countryName, identifier: countryCode },
  isAccessibleForFree: true,
  license: `${SITE_URL}/terms`,
  creator: { '@id': ORGANIZATION_ID },
  distribution: [
    {
      '@type': 'DataDownload',
      encodingFormat: 'text/calendar',
      contentUrl: `${SITE_URL}/ics/${countryCode.toLowerCase()}?year=${year}`,
    },
    {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${API_URL}/holidays?country=${countryCode}&year=${year}`,
    },
  ],
});

export const faqSchema = (items: { q: string; a: string }[]): JsonLd => ({
  '@type': 'FAQPage',
  mainEntity: items.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});
