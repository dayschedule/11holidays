import { createServerFn } from '@tanstack/react-start';
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
import { CACHE } from '@/lib/cache';
import { cacheFor } from '@/server/cache-middleware';

const countryCode = z.string().length(2).toUpperCase();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const getCountryHolidays = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.data)])
  .validator(z.object({ code: countryCode, year: z.number().int().min(2000).max(2100) }))
  .handler(({ data }) => fetchHolidays(env, data.code, data.year));

export const getCountryOccasions = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.data)])
  .validator(z.object({ code: countryCode }))
  .handler(({ data }) => fetchOccasionByCountry(env, data.code));

export const getUpcomingOccasions = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.dailyData)])
  .validator(z.object({ code: countryCode, limit: z.number().int().min(1).max(24).default(8) }))
  .handler(({ data }) => fetchUpcomingOccasions(env, data.code, data.limit));

export const getOccasions = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.data)])
  .validator(z.object({ offset: z.number().int().min(0), limit: z.number().int().min(1).max(60) }))
  .handler(({ data }) => fetchOccasions(env, data.offset, data.limit));

export const getOccasionPage = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.dailyData)])
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
  .middleware([cacheFor(CACHE.data)])
  .validator(
    z.object({
      q: z.string().trim().min(2).max(60),
      country: countryCode.optional(),
      limit: z.number().int().min(1).max(50).default(20),
    })
  )
  .handler(({ data }) => searchHolidaysQuery(env, data.q, data.country, data.limit));

export const getHolidaysToday = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.dailyData)])
  .handler(() =>
  fetchHolidaysOnDate(env, format(new Date(), 'yyyy-MM-dd'))
);

export const getHolidaysOnDate = createServerFn({ method: 'GET' })
  .middleware([cacheFor(CACHE.dailyData)])
  .validator(z.object({ date: isoDate }))
  .handler(({ data }) => fetchHolidaysOnDate(env, data.date, 300));
