import { MetadataRoute } from 'next';
import { COUNTRIES } from '@/lib/countries-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const year = new Date().getFullYear();

  const countryEntries = COUNTRIES.map((x) => ({
    url: `https://11holidays.com/holidays/${x.code}/${year}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  })) satisfies MetadataRoute.Sitemap;

  return [
    {
      url: 'https://11holidays.com',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://11holidays.com/countries',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://11holidays.com/pricing',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://11holidays.com/about',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://11holidays.com/contact',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: 'https://11holidays.com/terms',
      lastModified: new Date('2025-12-20T05:07:12.287Z'),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...countryEntries,
  ];
}