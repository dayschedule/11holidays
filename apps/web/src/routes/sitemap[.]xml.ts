import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { fetchOccasions } from '@/lib/occassion-api';
import { currentYear } from '@/lib/holidays-api';
import { SITE_URL } from '@/lib/seo';

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

const entry = (path: string, priority = 0.7, lastModified = new Date()): SitemapEntry => ({
  url: `${SITE_URL}${path}`,
  lastModified,
  changeFrequency: 'daily',
  priority,
});

function toXml(entries: SitemapEntry[]) {
  const urls = entries
    .map(
      (e) =>
        `<url><loc>${e.url}</loc><lastmod>${e.lastModified.toISOString()}</lastmod><changefreq>${e.changeFrequency}</changefreq><priority>${e.priority}</priority></url>`
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const countryEntries = COUNTRIES_WITH_SLUG.flatMap((x) => [
          entry(`/holidays/${x.code.toLowerCase()}/${currentYear}`),
          entry(`/holidays/${x.code.toLowerCase()}`),
          entry(`/upcoming-holidays/${x.slug}`, 0.8),
          entry(`/long-weekends/${x.slug}`, 0.8),
          entry(`/calendars/${x.slug}`),
        ]);

        const occasions = await fetchOccasions(env);
        const occasionEntries = occasions.map((x) =>
          entry(`/holidays/${x.url}`, 0.7, x.updated_at ? new Date(x.updated_at) : new Date())
        );

        const xml = toXml([
          entry('', 1),
          ...['/countries', '/holidays', '/calendars', '/widget', '/pricing', '/about', '/contact', '/terms', '/api-key'].map(
            (p) => entry(p)
          ),
          ...countryEntries,
          ...occasionEntries,
        ]);

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});
