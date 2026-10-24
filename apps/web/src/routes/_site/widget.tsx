import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Code2, Palette, Zap } from 'lucide-react';
import { z } from 'zod';
import { CountrySelect } from '@/components/country-select';
import { EmbedCode } from '@/components/embed-code';
import { PageLayout } from '@/components/page-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calendarThemes, CALENDAR_THEME_KEYS, type CalendarTheme } from '@/lib/calendar-utils';
import { getCountryBySlug } from '@/lib/countries-data';
import { cleanSearch } from '@/lib/custom-calendar';
import { seo, softwareAppSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_site/widget')({
  validateSearch: z.object({
    country: z.string().optional().catch(undefined),
    theme: z.enum(CALENDAR_THEME_KEYS).optional().catch(undefined),
    title: z.string().max(80).optional().catch(undefined),
    only: z.enum(['all', 'public']).optional().catch(undefined),
  }),
  head: () =>
    seo({
      title: 'Free Holidays Widget for Your Website - Embed a Holiday Calendar | 11holidays',
      description:
        'Embed an upcoming holidays list or a holiday calendar for any country on your website, blog or intranet with a free iframe widget. No sign-up required.',
      path: '/widget',
      jsonLd: [
        softwareAppSchema(
          'Holidays widget',
          '/widget',
          'Free embeddable widget showing upcoming holidays or a holiday calendar for any country.'
        ),
      ],
    }),
  component: WidgetPage,
});

function WidgetPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const country = getCountryBySlug(search.country ?? '') ?? getCountryBySlug('united-states-of-america')!;
  const update = (patch: Partial<typeof search>) =>
    navigate({ search: cleanSearch({ ...search, ...patch }), replace: true, resetScroll: false });

  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-festive-teal/15 px-3 py-1 text-xs font-semibold text-festive-teal">
          <Code2 className="h-3.5 w-3.5" /> Free · No sign-up
        </span>
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Holidays widget for your website
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Show upcoming public holidays or a full holiday calendar on your website, HR portal, Notion or school
          intranet. Copy one line of code and it stays up to date automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-1.5">
            <Label className="text-xs">Country</Label>
            <CountrySelect value={country.code} onChange={(c) => update({ country: c.slug })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              placeholder={`${country.name} Holidays`}
              value={search.title ?? ''}
              maxLength={80}
              onChange={(e) => update({ title: e.target.value || undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Holidays</Label>
            <div className="grid grid-cols-2 gap-1 rounded-lg border p-1">
              {(['all', 'public'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => update({ only: o === 'all' ? undefined : o })}
                  className={cn(
                    'rounded-md py-1.5 text-xs font-medium',
                    (search.only ?? 'all') === o ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  {o === 'all' ? 'All holidays' : 'Public only'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(calendarThemes) as [CalendarTheme, (typeof calendarThemes)[CalendarTheme]][]).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ theme: key === 'festive' ? undefined : key })}
                  className={cn(
                    'overflow-hidden rounded-lg border text-left text-[11px] font-medium',
                    (search.theme ?? 'festive') === key && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                  )}
                >
                  <span className="block h-5" style={{ backgroundColor: t.primary }} />
                  <span className="block px-2 py-1" style={{ backgroundColor: t.background, color: t.text }}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Need to pick specific holidays or add company days off? Use the{' '}
            <Link to="/calendars/$country" params={{ country: country.slug! }} className="text-primary underline">
              calendar maker
            </Link>{' '}
            and click <strong>Embed</strong>.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs sm:p-6">
          <EmbedCode
            countrySlug={country.slug!}
            search={{ theme: search.theme, title: search.title, only: search.only }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Zap, title: 'Always up to date', text: 'Holiday dates update automatically every year.' },
          { icon: Palette, title: 'Matches your brand', text: 'Pick from festive, classic, midnight and more themes.' },
          { icon: Code2, title: 'One line of code', text: 'A lightweight iframe that works on any website builder.' },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-xs">
            <f.icon className="mb-3 h-6 w-6 text-primary" />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
