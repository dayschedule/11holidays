import { useEffect, useRef, useState } from 'react';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { CalendarPlus, Code2, Maximize2, Timer } from 'lucide-react';
import { z } from 'zod';
import { COUNTDOWN_DATE, CopyButton, CountdownEmbedCode, ShareButton } from '@/components/countdown-tools';
import { FaqSection } from '@/components/faq-section';
import { Countdown, FestiveParticles } from '@/components/festive';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cleanSearch, toQueryString } from '@/lib/custom-calendar';
import { useToday } from '@/hooks/use-today';
import { getCountryByCode } from '@/lib/countries-data';
import { defaultHolidayTheme, getHolidayTheme } from '@/lib/holiday-themes';
import { occasionParams } from '@/lib/holidays-api';
import { googleCalendarUrl } from '@/lib/ics';
import { faqSchema, seo, SITE_URL, softwareAppSchema } from '@/lib/seo';
import { getUpcomingOccasions, getVisitorCountry } from '@/server/holidays';

const FAQ = [
  {
    q: 'How do I create a countdown timer?',
    a: 'Enter the name of your event, pick a date and optionally a time. The countdown starts right away and the page link updates so you can share or bookmark it.',
  },
  {
    q: 'Can I add a countdown to my website?',
    a: 'Yes. Copy the iframe embed code below the timer and paste it into any website, blog, Notion page or intranet. It is free and needs no sign-up.',
  },
  {
    q: 'Which time zone does the countdown use?',
    a: "The countdown runs in the viewer's own time zone, so an event at 09:00 counts down to 09:00 local time wherever it is opened.",
  },
];

export const Route = createFileRoute('/_site/countdown')({
  validateSearch: z.object({
    title: z.string().max(80).optional().catch(undefined),
    date: z.string().regex(COUNTDOWN_DATE).optional().catch(undefined),
  }),
  loader: async () => {
    const code = await getVisitorCountry();
    const upcoming = await getUpcomingOccasions({ data: { code, limit: 12 } });
    return { code, upcoming };
  },
  head: ({ match }) =>
    seo({
      title: 'Countdown Timer - Free Online Countdown to Any Date or Holiday | 11holidays',
      description:
        'Create a free online countdown timer for any event, birthday, holiday or deadline. Share the link, go full screen or embed the countdown on your website.',
      keywords: ['countdown timer', 'online countdown', 'countdown to date', 'event countdown', 'holiday countdown', 'countdown widget'],
      path: '/countdown',
      // custom countdowns are shareable but each one is not a page worth indexing
      noindex: Boolean(match.search.title || match.search.date),
      jsonLd: [
        softwareAppSchema('Countdown timer', '/countdown', 'Free online countdown timer to any date, event or holiday with a shareable link and embeddable widget.'),
        faqSchema(FAQ),
      ],
    }),
  component: CountdownMaker,
});

function nextNewYear() {
  return `${new Date().getFullYear() + 1}-01-01`;
}

function CountdownMaker() {
  const { code, upcoming } = Route.useLoaderData();
  const search = Route.useSearch();
  const now = useToday();
  const navigate = useNavigate({ from: Route.fullPath });
  const heroRef = useRef<HTMLElement>(null);

  const [defaultDate, setDefaultDate] = useState(nextNewYear);
  useEffect(() => setDefaultDate(nextNewYear()), []);

  const title = search.title ?? (search.date ? '' : `New Year ${defaultDate.slice(0, 4)}`);
  const date = search.date ?? defaultDate;
  const [day, time = ''] = date.split('T');
  const country = getCountryByCode(code);

  const update = (patch: { title?: string; day?: string; time?: string }) => {
    const nextDay = patch.day ?? day;
    const nextTime = patch.time ?? time;
    navigate({
      search: cleanSearch({
        title: patch.title ?? title,
        date: nextDay ? (nextTime ? `${nextDay}T${nextTime}` : nextDay) : undefined,
      }),
      replace: true,
      resetScroll: false,
    });
  };

  const shareUrl = `${SITE_URL}/countdown${toQueryString({ title, date })}`;
  const heading = title || 'My countdown';

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-festive-coral/15 px-3 py-1 text-xs font-semibold text-festive-coral">
          <Timer className="h-3.5 w-3.5" /> Free · Shareable · Embeddable
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Countdown timer</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Count down the days, hours and minutes to any event: a holiday, birthday, wedding, exam, product launch or
          vacation. Share the link or put it on your website.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-1.5">
            <Label htmlFor="cd-title" className="text-xs">Event name</Label>
            <Input
              id="cd-title"
              value={title}
              maxLength={80}
              placeholder="My birthday"
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="cd-date" className="text-xs">Date</Label>
              <Input id="cd-date" type="date" value={day} onChange={(e) => e.target.value && update({ day: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cd-time" className="text-xs">Time (optional)</Label>
              <Input id="cd-time" type="time" value={time} onChange={(e) => update({ time: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <CopyButton text={shareUrl} label="Copy link" />
            <Button size="sm" variant="outline" asChild>
              <a href={googleCalendarUrl({ title: heading, date: day!, url: shareUrl })} target="_blank" rel="noreferrer nofollow">
                <CalendarPlus className="h-4 w-4" /> Calendar
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <section
            ref={heroRef}
            className="relative isolate flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] px-6 py-12 text-center shadow-2xl"
            style={{ background: defaultHolidayTheme.background, color: defaultHolidayTheme.ink }}
          >
            <FestiveParticles theme={defaultHolidayTheme} count={16} />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{heading}</h2>
            <p className="relative opacity-90">
              {format(parseISO(date), time ? 'EEEE, d MMMM yyyy, HH:mm' : 'EEEE, d MMMM yyyy')}
            </p>
            <Countdown date={date} className="relative justify-center" />
            <div className="relative flex gap-2 pt-2">
              <ShareButton
                title={`Countdown to ${heading}`}
                url={shareUrl}
                className="rounded-full border-white/40 bg-white/10 text-inherit backdrop-blur hover:bg-white/20 hover:text-inherit"
              />
              <Button
                variant="outline"
                onClick={() => heroRef.current?.requestFullscreen?.()}
                className="rounded-full border-white/40 bg-white/10 text-inherit backdrop-blur hover:bg-white/20 hover:text-inherit"
              >
                <Maximize2 className="h-4 w-4" /> Full screen
              </Button>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-4 shadow-xs">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Code2 className="h-5 w-5 text-primary" /> Add this countdown to your website
            </h2>
            <CountdownEmbedCode target={{ title: heading, date }} />
          </section>
        </div>
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Holiday countdowns{country && ` in ${country.name}`}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((o) => {
              const days = differenceInCalendarDays(parseISO(o.date), now);
              return (
                <Link
                  key={o.occasion_id}
                  to="/holidays/$country/$slug"
                  params={occasionParams(o.url)}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-xs transition hover:border-primary/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {getHolidayTheme(o.name, o.country ?? code)?.particles[0]} {o.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{format(parseISO(o.date), 'EEE, d MMM yyyy')}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-2xl font-bold tabular-nums text-primary">{Math.max(0, days)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">days</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <FaqSection items={FAQ} />
    </PageLayout>
  );
}
