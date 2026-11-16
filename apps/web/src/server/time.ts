import { createServerFn } from '@tanstack/react-start';
import { CACHE } from '@/lib/cache';
import { cacheFor } from '@/server/cache-middleware';
import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { CITY_SLUG_ALIASES, countryNameOf, getCityBySlug, type City } from '@/lib/cities';
import { dayscheduleUrl } from '@/lib/dayschedule';
import { fetchUpcomingOccasions } from '@/lib/occassion-api';
import { formatOffset, formatShortDate, nextOffsetChange, offsetChanges, offsetMinutes, zonedParts } from '@/lib/time';
import { getZone, getZoneBySlug, type Zone } from '@/lib/timezones';

// Cities and zones are looked up here so their data stays out of the main client bundle:
// route loaders and head() are not code split.

function cityFaq(city: City, country: string) {
  const zone = getZone(city.timeZone);
  const now = new Date();
  const offset = formatOffset(offsetMinutes(now, city.timeZone));
  const change = nextOffsetChange(city.timeZone, now);
  return [
    {
      q: `What time zone is ${city.name} in?`,
      a: `${city.name} is in the ${zone?.label ?? city.timeZone} zone, ${city.timeZone} in the IANA database, currently at ${offset}.`,
    },
    {
      q: `Does ${city.name} have daylight saving time?`,
      a: change
        ? `Yes. Clocks in ${city.name} change during the year. The next change is on ${formatShortDate(zonedParts(change.at, city.timeZone))} ${change.at.getUTCFullYear()}.`
        : `No. ${city.name} keeps the same time all year.`,
    },
    {
      q: `What is the best time to call ${city.name}?`,
      a: `Business hours in ${city.name} usually run from 09:00 to 17:00 local time. Use the meeting planner to find an hour that suits both sides, and check the public holidays in ${country} before you book.`,
      more: {
        label: 'Open the meeting planner on DaySchedule',
        href: dayscheduleUrl('/tools/meeting-planner', { zones: `${city.timeZone},Europe/London` }),
      },
    },
  ];
}

export const getCityPage = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.data)])
  .validator(z.object({ slug: z.string().min(1).max(80) }))
  .handler(async ({ data }) => {
    const alias = CITY_SLUG_ALIASES[data.slug];
    if (alias) return { kind: 'alias' as const, alias };

    const city = getCityBySlug(data.slug);
    if (!city) return null;

    const country = countryNameOf(city);
    const upcoming = await fetchUpcomingOccasions(env, city.code, 5);
    return { kind: 'page' as const, city, country, zoneLabel: getZone(city.timeZone)?.label, faq: cityFaq(city, country), upcoming };
  });

function zoneFaq(zone: Zone) {
  const name = zone.name.replace(/_/g, ' ');
  const now = new Date();
  const offset = formatOffset(offsetMinutes(now, zone.name));
  const hasDst = offsetChanges(zone.name, now.getUTCFullYear()).length > 0;
  return [
    {
      q: `What is the UTC offset of ${name}?`,
      a: hasDst
        ? `${name} is at ${offset} right now. Its offset changes during the year because it observes daylight saving time.`
        : `${name} is at ${offset} all year.`,
    },
    {
      q: `Does ${name} observe daylight saving time?`,
      a: hasDst
        ? `Yes. Clocks in ${name} change during the year, and the exact dates are listed on this page.`
        : `No. ${name} keeps the same time all year.`,
    },
  ];
}

export const getZonePage = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.data)])
  .validator(z.object({ slug: z.string().min(1).max(80) }))
  .handler(({ data }) => {
    const zone = getZoneBySlug(data.slug);
    return zone ? { zone, faq: zoneFaq(zone) } : null;
  });
