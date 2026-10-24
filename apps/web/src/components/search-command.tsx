import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Command as CommandPrimitive } from 'cmdk';
import { CalendarDays, Globe, Loader2, PartyPopper, Search, Sunset } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CountryFlag } from '@/components/country-flag';
import { COUNTRIES_WITH_SLUG, getCountryName } from '@/lib/countries-data';
import { currentYear, formatDate, occasionParams, type HolidaySearchResult } from '@/lib/holidays-api';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { searchHolidays } from '@/server/holidays';
import { cn } from '@/lib/utils';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground';

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HolidaySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounced(query.trim(), 250);

  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchHolidays({ data: { q: debounced, limit: 12 } })
      .then((r) => !cancelled && setResults(r))
      .catch(() => !cancelled && setResults([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES_WITH_SLUG.filter((c) => ['US', 'IN', 'GB', 'CA', 'AU'].includes(c.code));
    return COUNTRIES_WITH_SLUG.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q
    ).slice(0, 6);
  }, [query]);

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  const openHoliday = (h: HolidaySearchResult) =>
    go(() => {
      if (h.url) {
        navigate({ to: '/holidays/$country/$slug', params: occasionParams(h.url) });
      } else {
        navigate({
          to: '/holidays/$country/$slug',
          params: { country: h.country.toLowerCase(), slug: String(currentYear) },
        });
      }
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] translate-y-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Search holidays</DialogTitle>
        <DialogDescription className="sr-only">
          Search holidays and countries
        </DialogDescription>
        <CommandPrimitive shouldFilter={false} className="flex flex-col">
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search Diwali, Christmas, India, Germany…"
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-10 text-center text-sm text-muted-foreground">
              {loading ? 'Searching…' : 'No holidays or countries found.'}
            </CommandPrimitive.Empty>

            {results.length > 0 && (
              <CommandPrimitive.Group
                heading="Holidays"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {results.map((h) => {
                  const theme = getHolidayTheme(h.name, h.country);
                  return (
                    <CommandPrimitive.Item
                      key={h.holiday_id}
                      value={`holiday-${h.holiday_id}`}
                      onSelect={() => openHoliday(h)}
                      className={itemClass}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-base">
                        {theme?.particles[0] ?? <PartyPopper className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{h.name}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CountryFlag countryCode={h.country} className="h-2.5 w-4 rounded-[2px]" />
                          {getCountryName(h.country)} · {formatDate(h.date)}
                        </span>
                      </span>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            )}

            {countries.length > 0 && (
              <CommandPrimitive.Group
                heading={query ? 'Countries' : 'Popular countries'}
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                {countries.map((c) => (
                  <CommandPrimitive.Item
                    key={c.code}
                    value={`country-${c.code}`}
                    onSelect={() =>
                      go(() =>
                        navigate({
                          to: '/holidays/$country/$slug',
                          params: { country: c.code.toLowerCase(), slug: String(currentYear) },
                        })
                      )
                    }
                    className={itemClass}
                  >
                    <CountryFlag countryCode={c.code} className="h-5 w-7 shrink-0 rounded-sm" />
                    <span className="flex-1 truncate font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{currentYear} holidays</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {!query && (
              <CommandPrimitive.Group
                heading="Tools"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
              >
                <CommandPrimitive.Item
                  value="tool-calendars"
                  onSelect={() => go(() => navigate({ to: '/calendars' }))}
                  className={itemClass}
                >
                  <CalendarDays className="h-4 w-4 text-festive-coral" /> Holiday calendar maker
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="tool-widget"
                  onSelect={() => go(() => navigate({ to: '/widget' }))}
                  className={itemClass}
                >
                  <Globe className="h-4 w-4 text-festive-teal" /> Embeddable holidays widget
                </CommandPrimitive.Item>
                <CommandPrimitive.Item
                  value="tool-long-weekends"
                  onSelect={() =>
                    go(() => navigate({ to: '/long-weekends/$country', params: { country: 'united-states-of-america' } }))
                  }
                  className={itemClass}
                >
                  <Sunset className="h-4 w-4 text-festive-saffron" /> Long weekend planner
                </CommandPrimitive.Item>
              </CommandPrimitive.Group>
            )}

            {debounced.length >= 2 && (
              <CommandPrimitive.Item
                value="see-all"
                onSelect={() => go(() => navigate({ to: '/search', search: { q: debounced } }))}
                className={cn(itemClass, 'justify-center text-primary')}
              >
                See all results for “{debounced}”
              </CommandPrimitive.Item>
            )}
          </CommandPrimitive.List>
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>↑↓ to navigate · ↵ to open</span>
            <span>Esc to close</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
