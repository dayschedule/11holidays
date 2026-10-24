import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { env } from 'cloudflare:workers';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  fetchHolidays,
  fetchHolidaysByOcasionId,
  fetchHolidaysOnDate,
  searchHolidays as searchHolidaysQuery,
} from '@/lib/holidays-api';
import {
  fetchOccasion,
  fetchOccasionByCountry,
  fetchOccasions,
  fetchUpcomingOccasions,
} from '@/lib/occassion-api';

const countryCode = z.string().length(2).toUpperCase();

export const getVisitorCountry = createServerFn({ method: 'GET' }).handler(() => {
  const request = getRequest() as Request & { cf?: { country?: string } };
  const country = request.cf?.country;
  return country && country !== 'XX' && country !== 'T1' ? country : 'US';
});

export const getCountryHolidays = createServerFn({ method: 'GET' })
  .validator(z.object({ code: countryCode, year: z.number().int().min(2000).max(2100) }))
  .handler(({ data }) => fetchHolidays(env, data.code, data.year));

export const getCountryOccasions = createServerFn({ method: 'GET' })
  .validator(z.object({ code: countryCode }))
  .handler(({ data }) => fetchOccasionByCountry(env, data.code));

export const getUpcomingOccasions = createServerFn({ method: 'GET' })
  .validator(z.object({ code: countryCode, limit: z.number().int().min(1).max(24).default(8) }))
  .handler(({ data }) => fetchUpcomingOccasions(env, data.code, data.limit));

export const getOccasions = createServerFn({ method: 'GET' })
  .validator(z.object({ offset: z.number().int().min(0), limit: z.number().int().min(1).max(60) }))
  .handler(({ data }) => fetchOccasions(env, data.offset, data.limit));

export const getOccasionPage = createServerFn({ method: 'GET' })
  .validator(z.object({ code: countryCode, slug: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const occasion = await fetchOccasion(env, `${data.code.toLowerCase()}/${data.slug}`);
    if (!occasion) return null;

    const [dates, related] = await Promise.all([
      fetchHolidaysByOcasionId(env, occasion.occasion_id),
      fetchUpcomingOccasions(env, data.code, 5),
    ]);

    return {
      occasion,
      dates,
      related: related.filter((o) => o.occasion_id !== occasion.occasion_id).slice(0, 4),
    };
  });

export const searchHolidays = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      q: z.string().trim().min(2).max(60),
      country: countryCode.optional(),
      limit: z.number().int().min(1).max(50).default(20),
    })
  )
  .handler(({ data }) => searchHolidaysQuery(env, data.q, data.country, data.limit));

export const getHolidaysToday = createServerFn({ method: 'GET' }).handler(() =>
  fetchHolidaysOnDate(env, format(new Date(), 'yyyy-MM-dd'))
);
