import { MetadataRoute } from 'next';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { fetchOccasions } from '../lib/occassion-api';
import { currentYear } from '../lib/holidays-api';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://11holidays.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const holidaysEntries = COUNTRIES_WITH_SLUG.flatMap((x) => [
    {
      url: `${BASE_URL}/holidays/${x.code.toLowerCase()}/${currentYear}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/upcoming-holidays/${x.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/long-weekends/${x.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]) satisfies MetadataRoute.Sitemap;

  const calendarEntries = COUNTRIES_WITH_SLUG.map((x) => ({
    url: `${BASE_URL}/calendars/${x.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  })) satisfies MetadataRoute.Sitemap;

  const { env } = await getCloudflareContext({ async: true });

  const occasions = await fetchOccasions(env);

  const occasionsEntries = occasions.map((x) => ({
    url: `${BASE_URL}/holidays/${x.url}`,
    lastModified: new Date(x.updated_at!),
    changeFrequency: 'daily',
    priority: 0.7,
  })) satisfies MetadataRoute.Sitemap;

  return [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/calendars`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...holidaysEntries,
    ...calendarEntries,
    ...occasionsEntries,
  ];
}
