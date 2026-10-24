import { useEffect, useState } from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CalendarPlus, Copy, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/breadcrumb';
import { CountryFlag } from '@/components/country-flag';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { calendarThemes } from '@/lib/calendar-utils';
import { getCountryName } from '@/lib/countries-data';
import {
  deleteSavedCalendar,
  loadSavedCalendars,
  parseCustomEntries,
  toQueryString,
  type SavedCalendar,
} from '@/lib/custom-calendar';
import { seo, SITE_URL } from '@/lib/seo';

export const Route = createFileRoute('/_site/my-calendars')({
  head: () => seo({ title: 'My saved holiday calendars - 11holidays', noindex: true, path: '/my-calendars' }),
  component: MyCalendarsPage,
});

function MyCalendarsPage() {
  const [calendars, setCalendars] = useState<SavedCalendar[] | null>(null);

  useEffect(() => {
    const load = () => setCalendars(loadSavedCalendars());
    load();
    window.addEventListener('saved-calendars', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('saved-calendars', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  return (
    <PageLayout sidebar={false}>
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Calendars', to: '/calendars' }, { label: 'My calendars' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">My calendars</h1>
          <p className="text-muted-foreground">
            Your custom holiday calendars, saved in this browser. Share the link to use them on any device.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/calendars">
            <CalendarPlus className="h-4 w-4" /> New calendar
          </Link>
        </Button>
      </div>

      {calendars === null ? null : calendars.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed p-12 text-center">
          <span className="text-5xl">🗓️</span>
          <h2 className="text-xl font-semibold">No saved calendars yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Create a calendar like “Acme Inc. Holidays 2026” — pick the holidays your team observes, add your own days
            off and click <strong>Save calendar</strong>.
          </p>
          <Button asChild>
            <Link to="/calendars">Create a calendar</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calendars.map((cal) => {
            const theme = calendarThemes[cal.search.theme ?? 'festive'];
            const custom = parseCustomEntries(cal.search.add).length;
            return (
              <div key={cal.id} className="overflow-hidden rounded-2xl border bg-card shadow-xs">
                <div
                  className="flex h-20 items-end p-4"
                  style={{ backgroundColor: theme.primary }}
                >
                  <CountryFlag countryCode={cal.countryCode} className="h-5 w-7 rounded-sm shadow ring-1 ring-white/40" />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="line-clamp-1 font-semibold">{cal.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {getCountryName(cal.countryCode)} · {cal.search.year ?? new Date().getFullYear()}
                      {custom > 0 && ` · ${custom} custom day${custom > 1 ? 's' : ''}`} · updated{' '}
                      {formatDistanceToNow(parseISO(cal.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild className="flex-1">
                      <Link to="/calendars/$country" params={{ country: cal.countrySlug }} search={cal.search}>
                        <Pencil className="h-3.5 w-3.5" /> Open
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `${SITE_URL}/calendars/${cal.countrySlug}${toQueryString(cal.search)}`
                        );
                        toast.success('Link copied');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span className="sr-only">Copy link</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        deleteSavedCalendar(cal.id);
                        toast(`Deleted “${cal.name}”`);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
