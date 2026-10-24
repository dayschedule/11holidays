import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { fetchOccasions } from '@/lib/occassion-api';
import { currentYear } from '@/lib/holidays-api';
import { SITE_URL } from '@/lib/seo';

function toXml(paths: string[]) {
  const urls = paths.map((p) => `<url><loc>${SITE_URL}${p.replace(/&/g, "&amp;")}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const countryPaths = COUNTRIES_WITH_SLUG.flatMap((x) => [
          `/holidays/${x.code.toLowerCase()}/${currentYear}`,
          `/holidays/${x.code.toLowerCase()}`,
          `/upcoming-holidays/${x.slug}`,
          `/long-weekends/${x.slug}`,
          `/calendars/${x.slug}`,
        ]);

        const occasions = await fetchOccasions(env);

        const xml = toXml([
          '/',
          '/countries',
          '/holidays',
          '/calendars',
          '/widget',
          '/tools',
          '/countdown',
          '/working-days-calculator',
          '/leave-planner',
          '/pricing',
          '/about',
          '/contact',
          '/terms',
          '/api-key',
          '/docs/api',
          ...countryPaths,
          ...occasions.map((x) => `/holidays/${x.url}`),
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
