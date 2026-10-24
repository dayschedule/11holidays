import { createFileRoute } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { z } from 'zod';
import { COUNTDOWN_DATE } from '@/components/countdown-tools';
import { Countdown } from '@/components/festive';
import { calendarThemes, CALENDAR_THEME_KEYS } from '@/lib/calendar-utils';
import { getCountryByCode } from '@/lib/countries-data';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { occasionParams } from '@/lib/holidays-api';
import { seo, SITE_URL } from '@/lib/seo';
import { getOccasionPage } from '@/server/holidays';

export const Route = createFileRoute('/embed/countdown')({
  validateSearch: z.object({
    holiday: z.string().max(200).optional().catch(undefined),
    title: z.string().max(80).optional().catch(undefined),
    date: z.string().regex(COUNTDOWN_DATE).optional().catch(undefined),
    theme: z.enum(CALENDAR_THEME_KEYS).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ holiday: search.holiday, title: search.title, date: search.date }),
  loader: async ({ deps }) => {
    // a holiday countdown always points to its next date, so the embed never goes stale
    if (deps.holiday) {
      const { country: code, slug } = occasionParams(deps.holiday);
      const country = getCountryByCode(code);
      const page = country && slug ? await getOccasionPage({ data: { code: country.code, slug } }) : null;
      if (country && page) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const next = page.dates.find((d) => d.date >= today);
        if (next) {
          return {
            title: deps.title || page.occasion.name,
            date: next.date,
            subtitle: country.name,
            emoji: getHolidayTheme(page.occasion.name, country.code)?.particles[0],
            link: `${SITE_URL}/holidays/${page.occasion.url}`,
          };
        }
      }
    }
    return {
      title: deps.title || 'Countdown',
      date: deps.date ?? null,
      subtitle: undefined,
      emoji: undefined,
      link: `${SITE_URL}/countdown`,
    };
  },
  headers: () => ({ 'Cache-Control': 'public, max-age=900, s-maxage=3600' }),
  head: ({ loaderData }) => seo({ title: loaderData ? `${loaderData.title} countdown` : 'Countdown', noindex: true }),
  component: EmbedCountdown,
});

function EmbedCountdown() {
  const { title, date, subtitle, emoji, link } = Route.useLoaderData();
  const theme = calendarThemes[Route.useSearch().theme ?? 'festive'];

  return (
    <div className="flex min-h-screen flex-col justify-center p-3" style={{ backgroundColor: theme.background, color: theme.text }}>
      <div className="rounded-2xl px-4 py-5 text-center text-white shadow" style={{ backgroundColor: theme.primary }}>
        <p className="text-lg font-bold leading-tight">
          {emoji && <span className="mr-1">{emoji}</span>}
          {title}
        </p>
        {date && (
          <p className="mb-3 text-xs opacity-80">
            {subtitle && `${subtitle} · `}
            {format(parseISO(date), date.includes('T') ? 'EEEE, d MMMM yyyy, HH:mm' : 'EEEE, d MMMM yyyy')}
          </p>
        )}
        {date ? (
          <Countdown date={date} className="justify-center" />
        ) : (
          <p className="text-sm opacity-80">Add a date to start the countdown</p>
        )}
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-[11px] hover:underline"
        style={{ color: theme.text, opacity: 0.6 }}
      >
        Powered by 11holidays.com
      </a>
    </div>
  );
}
