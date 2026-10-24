import { useEffect, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { z } from 'zod';
import { CountryFlag } from '@/components/country-flag';
import { HolidayTypeBadge } from '@/components/holiday-type-badge';
import { PageLayout } from '@/components/page-layout';
import { Input } from '@/components/ui/input';
import { COUNTRIES_WITH_SLUG, getCountryName } from '@/lib/countries-data';
import { currentYear, occasionParams } from '@/lib/holidays-api';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { seo } from '@/lib/seo';
import { searchHolidays } from '@/server/holidays';

export const Route = createFileRoute('/_site/search')({
  validateSearch: z.object({ q: z.string().max(60).optional().catch(undefined) }),
  loaderDeps: ({ search }) => ({ q: search.q?.trim() ?? '' }),
  loader: async ({ deps }) => ({
    q: deps.q,
    results: deps.q.length >= 2 ? await searchHolidays({ data: { q: deps.q, limit: 50 } }) : [],
  }),
  head: ({ loaderData }) =>
    seo({
      title: loaderData?.q ? `“${loaderData.q}” holidays ${currentYear} - dates by country | 11holidays` : 'Search holidays | 11holidays',
      description: loaderData?.q
        ? `When is ${loaderData.q} in ${currentYear}? See ${loaderData.q} dates in every country that observes it.`
        : 'Search holidays and festivals across 230+ countries.',
      path: loaderData?.q ? `/search?q=${encodeURIComponent(loaderData.q)}` : '/search',
    }),
  component: SearchPage,
});

function SearchPage() {
  const { q, results } = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const [value, setValue] = useState(q);
  useEffect(() => setValue(q), [q]);

  const countries =
    q.length >= 2
      ? COUNTRIES_WITH_SLUG.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
      : [];

  return (
    <PageLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {q ? (
            <>
              Holidays matching “{q}”
            </>
          ) : (
            'Search holidays'
          )}
        </h1>
        <p className="text-muted-foreground">Search festivals and public holidays across 230+ countries for {currentYear}.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ search: { q: value.trim() || undefined } });
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Diwali, Christmas, Independence Day…"
          className="h-12 rounded-full pl-12 text-base"
        />
      </form>

      {countries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <Link
              key={c.code}
              to="/holidays/$country/$slug"
              params={{ country: c.code.toLowerCase(), slug: String(currentYear) }}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary/40"
            >
              <CountryFlag countryCode={c.code} className="h-3.5 w-5 rounded-[2px]" />
              {c.name} holidays
            </Link>
          ))}
        </div>
      )}

      {q.length >= 2 && results.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">No holidays found for “{q}”.</p>
      )}

      {results.length > 0 && (
        <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
          {results.map((h) => {
            const theme = getHolidayTheme(h.name, h.country);
            const date = parseISO(h.date);
            const inner = (
              <>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: theme?.background ?? 'var(--muted)' }}
                >
                  {theme?.particles[0] ?? '📅'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{h.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CountryFlag countryCode={h.country} className="h-2.5 w-4 rounded-[2px]" />
                    {getCountryName(h.country)} · {format(date, 'EEEE, MMMM d, yyyy')}
                  </span>
                </span>
                <HolidayTypeBadge type={h.type} className="hidden sm:inline-flex" />
              </>
            );
            const cls = 'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50';
            return (
              <li key={h.holiday_id}>
                {h.url ? (
                  <Link to="/holidays/$country/$slug" params={occasionParams(h.url)} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <Link
                    to="/holidays/$country/$slug"
                    params={{ country: h.country.toLowerCase(), slug: String(currentYear) }}
                    className={cls}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </PageLayout>
  );
}
