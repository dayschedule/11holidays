import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { MONTH_SLUGS } from '@/lib/calendar-pages';
import { CITIES } from '@/lib/cities';
import { COUNTRIES_WITH_SLUG } from '@/lib/countries-data';
import { fetchOccasions } from '@/lib/occassion-api';
import { currentYear } from '@/lib/holidays-api';
import { SITE_URL } from '@/lib/seo';
import { ZONES } from '@/lib/timezones';
import { CACHE, cacheHeaders } from '@/lib/cache';

function toXml(paths: string[]) {
  const urls = paths.map((p) => `<url><loc>${SITE_URL}${p.replace(/&/g, "&amp;")}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const countryPaths = COUNTRIES_WITH_SLUG.flatMap((x) => [
          `/holidays/${x.code.toLowerCase()}/${currentYear()}`,
          `/holidays/${x.code.toLowerCase()}`,
          `/upcoming-holidays/${x.slug}`,
          `/long-weekends/${x.slug}`,
          `/calendars/${x.slug}`,
        ]);

        const year = currentYear();
        const calendarPaths = Array.from({ length: 7 }, (_, i) => `/calendar/${year - 1 + i}`);
        const monthPaths = [year, year + 1].flatMap((y) => MONTH_SLUGS.map((m) => `/calendar/${y}/${m}`));

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
          '/world-clock',
          '/timezones',
          '/time-zone-converter',
          '/daylight-saving-time',
          '/date-calculator',
          '/week-number',
          '/year-progress',
          '/today',
          '/pricing',
          '/about',
          '/contact',
          '/terms',
          '/api-key',
          '/docs/api',
          ...calendarPaths,
          ...monthPaths,
          ...countryPaths,
          ...CITIES.map((c) => `/time/${c.slug}`),
          ...ZONES.map((z) => `/timezones/${z.slug}`),
          ...occasions.map((x) => `/holidays/${x.url}`),
        ]);

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            ...cacheHeaders(CACHE.file),
          },
        });
      },
    },
  },
});
