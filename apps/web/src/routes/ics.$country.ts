import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { getCountryByCode } from '@/lib/countries-data';
import { fetchHolidays, holidayKind } from '@/lib/holidays-api';
import { buildIcs } from '@/lib/ics';
import { SITE_URL } from '@/lib/seo';

/**
 * Subscribable iCal feed: /ics/in (current + next year) or /ics/in?year=2027.
 * Add `?public=1` to only include public holidays.
 */
export const Route = createFileRoute('/ics/$country')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = params.country.replace(/\.ics$/i, '');
        const country = getCountryByCode(code);
        if (!country) return new Response('Country not found', { status: 404 });

        const url = new URL(request.url);
        const yearParam = Number(url.searchParams.get('year'));
        const thisYear = new Date().getFullYear();
        const years = yearParam >= 2000 && yearParam <= 2100 ? [yearParam] : [thisYear, thisYear + 1];
        const publicOnly = url.searchParams.get('public') === '1';

        const results = await Promise.all(years.map((y) => fetchHolidays(env, country.code, y)));
        const holidays = results
          .flatMap((r) => r.holidays)
          .filter((h) => !publicOnly || holidayKind(h.type) === 'public');

        const ics = buildIcs(
          `${country.name} Holidays`,
          holidays.map((h) => ({
            uid: `${country.code}-${h.holiday_id}`,
            date: h.date,
            title: h.name,
            description: `${h.type} holiday in ${country.name}`,
            url: h.url ? `${SITE_URL}/holidays/${h.url}` : undefined,
          }))
        );

        return new Response(ics, {
          headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `inline; filename="${country.code.toLowerCase()}-holidays.ics"`,
            'Cache-Control': 'public, max-age=21600',
          },
        });
      },
    },
  },
});
