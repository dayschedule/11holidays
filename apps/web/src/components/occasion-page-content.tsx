import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ArrowRight, CalendarPlus, Check, Share2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Occasion } from '@/lib/occassion-api';
import type { Country } from '@/lib/countries-data';
import { useToday } from '@/hooks/use-today';
import { downloadBlob, type Holiday } from '@/lib/holidays-api';
import { defaultHolidayTheme, getHolidayTheme } from '@/lib/holiday-themes';
import { buildIcs, googleCalendarUrl, outlookCalendarUrl } from '@/lib/ics';
import { SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { AdsBlock } from '@/components/ads-block';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { CountdownEmbedCode } from '@/components/countdown-tools';
import { Countdown, FestiveParticles } from '@/components/festive';
import { MonthGrid } from '@/components/calendar/year-grid';
import { OccasionsList } from '@/components/occasions-list';
import { InternalLinksAd } from '@/components/internal-link-ads';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OccasionPageContentProps {
  country: Country;
  occasion: Occasion;
  holidays: Holiday[];
  upcomingHolidays: Occasion[];
}

export function OccasionPageContent({ country, occasion, holidays, upcomingHolidays }: OccasionPageContentProps) {
  const theme = getHolidayTheme(occasion.name, country.code) ?? defaultHolidayTheme;
  const code = country.code.toLowerCase();
  const pageUrl = `${SITE_URL}/holidays/${occasion.url}`;

  const now = useToday();
  const today = format(now, 'yyyy-MM-dd');

  const { next, sorted } = useMemo(() => {
    const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
    return { sorted, next: sorted.find((d) => d.date >= today) ?? sorted[sorted.length - 1] };
  }, [holidays, today]);

  const nextDate = next ? parseISO(next.date) : null;
  const event = next && {
    title: `${occasion.name} (${country.name})`,
    date: next.date,
    description: occasion.description?.slice(0, 300),
    url: pageUrl,
  };

  const share = async () => {
    const data = { title: `${occasion.name} in ${country.name}`, text: theme.greeting, url: pageUrl };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(pageUrl);
      toast.success('Link copied to clipboard');
    } catch {
      // share dismissed
    }
  };

  const eventSchema = next && {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${occasion.name} ${next.year ?? ''}`.trim(),
    startDate: next.date,
    endDate: next.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Country', name: country.name },
    description: occasion.description,
    image: occasion.image?.url ? [occasion.image.url] : undefined,
    url: pageUrl,
  };

  return (
    <div className="space-y-10 py-6">
      {eventSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      )}

      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: 'Holidays', to: '/holidays' },
          { label: `${country.name} Holidays`, to: '/holidays/$country', params: { country: code } },
          { label: occasion.name },
        ]}
      />

      {/* Themed hero */}
      <section
        className="relative isolate overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl sm:px-10 sm:py-14"
        style={{ background: theme.background, color: theme.ink }}
      >
        {occasion.image?.url && (
          <img
            src={occasion.image.url}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 mix-blend-overlay"
          />
        )}
        <FestiveParticles theme={theme} count={22} />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end [&>*]:min-w-0">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest ring-1 ring-white/25 backdrop-blur">
              <CountryFlag countryCode={country.code} className="h-3 w-4 rounded-[2px]" />
              {country.name} · {theme.label}
            </span>
            <h1 className="break-words text-4xl font-semibold tracking-[-0.03em] leading-tight drop-shadow-sm sm:text-6xl">{occasion.name}</h1>
            {nextDate && (
              <p className="text-lg opacity-90 sm:text-xl">
                {next!.date >= today ? 'Next on' : 'Last observed on'}{' '}
                <strong className="font-semibold">{format(nextDate, 'EEEE, d MMMM yyyy')}</strong>
              </p>
            )}
            <p className="flex items-center gap-2 text-base italic opacity-90">
              <Sparkles className="h-4 w-4" /> {theme.greeting}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {event && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="rounded-full bg-white text-gray-900 shadow hover:bg-white/90">
                      <CalendarPlus className="h-4 w-4" /> Add to calendar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer nofollow">
                        Google Calendar
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={outlookCalendarUrl(event)} target="_blank" rel="noreferrer nofollow">
                        Outlook.com
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        downloadBlob(
                          buildIcs(occasion.name, [{ uid: `occasion-${occasion.occasion_id}-${event.date}`, ...event }]),
                          'text/calendar',
                          `${occasion.url.replace('/', '-')}.ics`
                        )
                      }
                    >
                      Apple / iCal (.ics)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                variant="outline"
                onClick={share}
                className="rounded-full border-white/40 bg-white/10 text-inherit backdrop-blur hover:bg-white/20 hover:text-inherit"
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          {next && (
            <div className="space-y-3 lg:justify-self-end">
              <p className="text-sm font-medium uppercase tracking-widest opacity-80">Countdown</p>
              <Countdown date={next.date} />
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="min-w-0 space-y-10 lg:col-span-8">
          <AdsBlock />

          {/* About */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">About {occasion.name}</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{occasion.description}</p>
            {occasion.image?.url && (
              <figure className="overflow-hidden rounded-2xl border shadow-xs">
                <img
                  src={occasion.image.url}
                  alt={occasion.image.alt || occasion.image.query || occasion.name}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <figcaption className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
                  <span>
                    Photo by{' '}
                    <a
                      href={occasion.image.photographer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {occasion.image.photographer}
                    </a>{' '}
                    on{' '}
                    <a
                      href={occasion.image.unsplash_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Unsplash
                    </a>
                  </span>
                  {occasion.updated_at && <span>Updated {format(parseISO(occasion.updated_at), 'd MMM yyyy')}</span>}
                </figcaption>
              </figure>
            )}
          </section>

          {theme.traditions.length > 0 && (
            <section className="space-y-4 rounded-2xl border p-6" style={{ background: theme.tint }}>
              <h2 className="text-2xl font-bold">How it&apos;s celebrated</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {theme.traditions.map((t, i) => (
                  <li key={t} className="flex items-start gap-3 rounded-xl bg-card/80 p-3 shadow-xs">
                    <span className="text-xl" aria-hidden>
                      {theme.particles[i % theme.particles.length]}
                    </span>
                    <span className="text-sm">{t}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AdsBlock />

          {/* Dates by year */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">
                When is {occasion.name} in {country.name}?
              </h2>
              {sorted.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {occasion.name} dates from {sorted[0]?.year} to {sorted[sorted.length - 1]?.year}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_260px]">
              <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
                {sorted.map((row) => {
                  const isNext = row.holiday_id === next?.holiday_id;
                  const days = differenceInCalendarDays(parseISO(row.date), now);
                  return (
                    <li
                      key={row.holiday_id}
                      className={cn(
                        'flex items-center justify-between gap-3 px-4 py-3',
                        days < 0 && 'text-muted-foreground',
                        isNext && 'bg-primary/5'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-12 text-lg font-bold">{row.year}</span>
                        <span>
                          <span className="block font-medium">{format(parseISO(row.date), 'EEEE, d MMMM')}</span>
                        </span>
                      </span>
                      <span className="text-right text-xs">
                        {isNext ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
                            <Check className="h-3 w-3" /> {days === 0 ? 'Today' : days > 0 ? `in ${days} days` : 'Latest'}
                          </span>
                        ) : days > 0 ? (
                          `in ${days} days`
                        ) : (
                          'Past'
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {nextDate && next && (
                <div className="space-y-2">
                  <MonthGrid
                    year={nextDate.getFullYear()}
                    month={nextDate.getMonth()}
                    holidays={[{ id: String(next.holiday_id), date: next.date, name: occasion.name, type: next.type }]}
                    highlight={next.date}
                  />
                  <Link
                    to="/calendars/$country"
                    params={{ country: country.slug! }}
                    search={{ year: nextDate.getFullYear() }}
                    className="block text-center text-xs font-medium text-primary hover:underline"
                  >
                    See the full {country.name} calendar →
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-xs">
            <h2 className="text-lg font-bold">Add a {occasion.name} countdown to your website</h2>
            <p className="text-sm text-muted-foreground">
              Free widget that counts down to the next {occasion.name} and moves to the following date every year.
            </p>
            <CountdownEmbedCode target={{ holiday: occasion.url }} />
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">More holidays in {country.name}</h2>
              <Button variant="outline" size="sm" asChild className="rounded-full">
                <Link to="/holidays/$country" params={{ country: code }}>
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <OccasionsList occasions={upcomingHolidays} />
          </section>
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-24">
            <InternalLinksAd country={country} />
          </div>
        </aside>
      </div>
    </div>
  );
}
