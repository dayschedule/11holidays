import { useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { format, parseISO } from 'date-fns';
import { ArrowRight, CalendarDays, Code, Code2, Globe2, Search, Sunset } from 'lucide-react';
import { ApiExamples } from '@/components/api-examples';
import { CountryFlag } from '@/components/country-flag';
import { Countdown, FestiveParticles } from '@/components/festive';
import { OccasionsList } from '@/components/occasions-list';
import { Button } from '@/components/ui/button';
import { getCountryByCode, getCountryName } from '@/lib/countries-data';
import { currentYear, occasionParams } from '@/lib/holidays-api';
import { FEATURED_FESTIVALS, defaultHolidayTheme, getHolidayTheme } from '@/lib/holiday-themes';
import { seo } from '@/lib/seo';
import { getHolidaysToday, getUpcomingOccasions, getVisitorCountry } from '@/server/holidays';

export const Route = createFileRoute('/_site/')({
  loader: async () => {
    const code = await getVisitorCountry();
    const [upcoming, today] = await Promise.all([
      getUpcomingOccasions({ data: { code, limit: 7 } }),
      getHolidaysToday(),
    ]);
    return { code, upcoming, today };
  },
  head: () =>
    seo({
      title: `Holidays ${currentYear} for 230+ Countries - Calendar, Widget & API | 11holidays`,
      description:
        'Find public holidays and festivals for 230+ countries. Create printable holiday calendars, embed a free holidays widget, plan long weekends and access holidays via API.',
      keywords: ['holidays', 'public holidays', 'holiday calendar', 'holidays API', 'festival dates', 'long weekends'],
      path: '/',
    }),
  component: Home,
});

const POPULAR = ['US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'AE', 'SG', 'BR'];

function Home() {
  const { code, upcoming, today } = Route.useLoaderData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const country = getCountryByCode(code);
  const [next, ...rest] = upcoming;
  const nextTheme = next ? (getHolidayTheme(next.name, next.country) ?? defaultHolidayTheme) : defaultHolidayTheme;

  return (
    <div className="space-y-20 pb-8">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden rounded-b-[2rem] border-b bg-card px-4 pb-14 pt-14 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 lg:pt-20">
        <div className="bg-confetti absolute inset-0 opacity-40" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-festive-saffron/25 blur-3xl" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-festive-violet/20 blur-3xl" />
        <FestiveParticles theme={{ particles: ['🎉', '🪔', '🎄', '🏮', '🎆', '🌙'], motion: 'twinkle' }} count={14} className="opacity-60" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium shadow-xs backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-festive-coral" />
            7,000+ holidays · 230+ countries · updated {currentYear}
          </span>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] leading-[1.05] sm:text-6xl lg:text-7xl">
            Every holiday,
            <br />
            everywhere.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Search festivals and public holidays, build a printable company
            holiday calendar, embed a holidays widget, and plan your long weekends.
          </p>

          <form
            className="flex w-full max-w-xl items-center gap-2 rounded-full border bg-background p-1.5 shadow-lg shadow-primary/5 focus-within:ring-2 focus-within:ring-ring"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim().length >= 2) navigate({ to: '/search', search: { q: query.trim() } });
            }}
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “Diwali”, “Christmas” or “Eid”"
              className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              aria-label="Search holidays"
            />
            <Button type="submit" className="h-10 rounded-full px-5">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR.map((c) => (
              <Link
                key={c}
                to="/holidays/$country/$slug"
                params={{ country: c.toLowerCase(), slug: String(currentYear) }}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <CountryFlag countryCode={c} className="h-3 w-4 rounded-[2px]" />
                {getCountryName(c).replace(' of America', '')}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Next holiday */}
      {next && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <CountryFlag countryCode={code} className="h-3 w-4 rounded-[2px]" />
                {country?.name ?? code}
              </span>
            }
            title="Your next holiday"
            action={
              country && (
                <Link
                  to="/upcoming-holidays/$country"
                  params={{ country: country.slug! }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  All upcoming <ArrowRight className="h-4 w-4" />
                </Link>
              )
            }
          />
          <Link
            to="/holidays/$country/$slug"
            params={occasionParams(next.url)}
            className="group relative block overflow-hidden rounded-3xl p-6 shadow-xl sm:p-10"
            style={{ background: nextTheme.background, color: nextTheme.ink }}
          >
            {next.image?.url && (
              <img src={next.image.url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay" />
            )}
            <FestiveParticles theme={nextTheme} count={16} />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-widest opacity-80">{nextTheme.label}</p>
                <h3 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{next.name}</h3>
                <p className="text-lg opacity-90">{format(parseISO(next.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <Countdown date={next.date} />
            </div>
          </Link>
          <OccasionsList occasions={rest.slice(0, 6)} columns={3} />
        </section>
      )}

      {/* Today around the world */}
      {today.length > 0 && (
        <section className="space-y-6">
          <SectionHeading
            eyebrow={format(new Date(), 'EEEE, MMMM d')}
            title="Celebrating today around the world"
          />
          <div className="flex flex-wrap gap-2">
            {today.slice(0, 30).map((h) => {
              const theme = getHolidayTheme(h.name, h.country);
              const content = (
                <>
                  <CountryFlag countryCode={h.country} className="h-3.5 w-5 rounded-[2px]" />
                  <span className="font-medium">{h.name}</span>
                  <span className="text-muted-foreground">{getCountryName(h.country)}</span>
                  {theme && <span aria-hidden>{theme.particles[0]}</span>}
                </>
              );
              const className =
                'inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-xs transition-colors hover:border-primary/40';
              return h.url ? (
                <Link key={h.holiday_id} to="/holidays/$country/$slug" params={occasionParams(h.url)} className={className}>
                  {content}
                </Link>
              ) : (
                <Link
                  key={h.holiday_id}
                  to="/holidays/$country/$slug"
                  params={{ country: h.country.toLowerCase(), slug: String(currentYear) }}
                  className={className}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Festival spotlight */}
      <section className="space-y-6">
        <SectionHeading eyebrow="Festival spotlight" title="Find dates for popular festivals" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {FEATURED_FESTIVALS.map((f) => (
            <Link
              key={f.name}
              to="/search"
              search={{ q: f.query }}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl p-4 shadow-md transition-transform hover:-translate-y-1"
              style={{ background: f.theme.background, color: f.theme.ink }}
            >
              <span className="absolute right-3 top-2 text-4xl transition-transform duration-300 group-hover:scale-125 sm:text-5xl">
                {f.emoji}
              </span>
              <span className="text-lg font-bold sm:text-xl">{f.name}</span>
              <span className="text-xs opacity-80">{f.theme.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-6">
        <SectionHeading eyebrow="Free tools" title="More than a holiday list" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ToolCard
            icon={<CalendarDays className="h-5 w-5" />}
            tone="bg-festive-coral/15 text-festive-coral"
            title="Holiday calendar maker"
            text="Pick holidays, add your own days off and save as “Company X holidays”. Print or download PDF."
            link={
              <Link to="/calendars/$country" params={{ country: country?.slug ?? 'united-states-of-america' }} className="stretched" aria-label="Open tool" />
            }
          />
          <ToolCard
            icon={<Code2 className="h-5 w-5" />}
            tone="bg-festive-teal/15 text-festive-teal"
            title="Embeddable widget"
            text="Add an upcoming holidays list or calendar to any website with a single iframe."
            link={<Link to="/widget" className="stretched" aria-label="Open tool" />}
          />
          <ToolCard
            icon={<Sunset className="h-5 w-5" />}
            tone="bg-festive-saffron/20 text-amber-600 dark:text-festive-saffron"
            title="Long weekend planner"
            text="See which leaves to take for the longest breaks this year."
            link={
              <Link to="/long-weekends/$country" params={{ country: country?.slug ?? 'united-states-of-america' }} className="stretched" aria-label="Open tool" />
            }
          />
          <ToolCard
            icon={<Code className="h-5 w-5" />}
            tone="bg-festive-violet/15 text-festive-violet"
            title="Holidays API"
            text="Simple REST API with JSON for 230+ countries, ready for HR, payroll and scheduling apps."
            link={<Link to="/api-key" className="stretched" aria-label="Open tool" />}
          />
        </div>
      </section>

      {/* Countries */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Browse"
          title="Popular countries"
          action={
            <Button variant="outline" size="sm" asChild className="rounded-full">
              <Link to="/countries">
                All countries <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {POPULAR.map((c) => (
            <Link
              key={c}
              to="/holidays/$country/$slug"
              params={{ country: c.toLowerCase(), slug: String(currentYear) }}
              className="group flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs transition hover:border-primary/40 hover:shadow-md"
            >
              <CountryFlag countryCode={c} className="h-7 w-10 shrink-0 rounded shadow-sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold group-hover:text-primary">
                  {getCountryName(c).replace(' of America', '')}
                </p>
                <p className="text-xs text-muted-foreground">{currentYear} holidays</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* API */}
      <section className="grid gap-8 rounded-3xl border bg-card p-6 shadow-xs sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Globe2 className="h-4 w-4" /> For developers
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">Holidays API for your apps</h2>
          <p className="text-muted-foreground">
            Federal, state and local holidays for 230+ countries with a simple
            GET request. Perfect for HR, payroll, booking and scheduling software.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link to="/api-key">Get free API key</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
        <ApiExamples year={currentYear} countryCode={code} />
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ToolCard({
  icon,
  tone,
  title,
  text,
  link,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  text: string;
  link: React.ReactElement<{ 'aria-label'?: string }>;
}) {
  return (
    <div className="group relative space-y-3 rounded-2xl border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg [&_.stretched]:absolute [&_.stretched]:inset-0">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <h3 className="font-semibold group-hover:text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
      <span className="sr-only">{title}</span>
      {link}
    </div>
  );
}
