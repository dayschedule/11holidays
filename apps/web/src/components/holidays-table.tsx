import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Calendar, Check, Copy, Download, FileJson, FileSpreadsheet, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  copyToClipboard,
  downloadBlob,
  downloadJSON,
  getDayOfWeek,
  occasionParams,
  toCSV,
  type Holiday,
} from '@/lib/holidays-api';
import type { Country } from '@/lib/countries-data';
import { getMonthName } from '@/lib/calendar-utils';
import { getHolidayTheme } from '@/lib/holiday-themes';
import { buildIcs } from '@/lib/ics';
import { cn } from '@/lib/utils';
import { HolidayTypeBadge } from './holiday-type-badge';

interface HolidaysTableProps {
  holidays: Holiday[];
  country: Country;
  year: number;
  filter: boolean;
  title?: string;
}

export function HolidaysTable({ holidays, country, year, filter, title }: HolidaysTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const monthCounts = useMemo(
    () =>
      holidays.reduce(
        (acc, holiday) => {
          const month = parseISO(holiday.date).getMonth();
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      ),
    [holidays]
  );

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || holiday.type === typeFilter;
    const matchesMonth = monthFilter === 'all' || parseInt(monthFilter) === parseISO(holiday.date).getMonth();
    return matchesSearch && matchesType && matchesMonth;
  });

  const uniqueTypes = Array.from(new Set(holidays.map((h) => h.type)));
  const today = format(new Date(), 'yyyy-MM-dd');
  const nextHoliday = holidays.find((h) => h.date >= today);
  const fileBase = `holidays-${country.code}-${year}`;

  const exportData = () => ({
    country: country.name,
    countryCode: country.code,
    year,
    holidays: filteredHolidays.map(({ date, name, type }) => ({ date, name, type })),
  });

  const handleCopyJSON = async () => {
    await copyToClipboard(JSON.stringify(exportData(), null, 2));
    setCopied(true);
    toast.success('Holidays copied as JSON');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleICS = () => {
    const ics = buildIcs(
      `${country.name} Holidays ${year}`,
      filteredHolidays.map((h) => ({ uid: `${h.holiday_id}`, date: h.date, title: h.name, description: h.type }))
    );
    downloadBlob(ics, 'text/calendar', `${fileBase}.ics`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">{title ?? `${country.name} holidays ${year}`}</h2>
          <p className="text-sm text-muted-foreground">
            Showing {filteredHolidays.length} of {holidays.length} holidays
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Download {filteredHolidays.length} holidays</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => downloadBlob(toCSV(filteredHolidays), 'text/csv', `${fileBase}.csv`)}>
              <FileSpreadsheet className="h-4 w-4" /> CSV (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleICS}>
              <Calendar className="h-4 w-4" /> Calendar (.ics)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadJSON(exportData(), `${fileBase}.json`)}>
              <FileJson className="h-4 w-4" /> JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyJSON}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3 border-b bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter holidays…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background pl-10"
            />
          </div>
          {filter && (
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full bg-background sm:w-[200px]">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem key={index} value={index.toString()} disabled={!monthCounts[index]}>
                    {getMonthName(index)} ({monthCounts[index] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {filter && uniqueTypes.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {['all', ...uniqueTypes].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                  typeFilter === type ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'
                )}
              >
                {type === 'all' ? 'All types' : type}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredHolidays.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No holidays found</p>
      ) : (
        <ul className="divide-y">
          {filteredHolidays.map((holiday) => {
            const date = parseISO(holiday.date);
            const isPast = holiday.date < today;
            const isNext = nextHoliday?.holiday_id === holiday.holiday_id;
            const days = differenceInCalendarDays(date, new Date());
            const theme = getHolidayTheme(holiday.name, country.code);

            return (
              <li
                key={holiday.holiday_id}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5',
                  isPast && 'opacity-60',
                  isNext && 'bg-primary/5'
                )}
              >
                <div
                  className={cn(
                    'flex w-14 shrink-0 flex-col items-center rounded-xl border bg-background py-1.5 text-center',
                    isNext && 'border-primary/50'
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {format(date, 'MMM')}
                  </span>
                  <span className="text-xl font-bold leading-none">{format(date, 'd')}</span>
                  <span className="text-[10px] text-muted-foreground">{format(date, 'EEE')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    {theme && <span aria-hidden>{theme.particles[0]}</span>}
                    {holiday.url ? (
                      <Link
                        to="/holidays/$country/$slug"
                        params={occasionParams(holiday.url)}
                        className="truncate underline-offset-4 hover:text-primary hover:underline"
                      >
                        {holiday.name}
                      </Link>
                    ) : (
                      <span className="truncate">{holiday.name}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getDayOfWeek(holiday.date)}, {format(date, 'MMMM d, yyyy')}
                    {isNext && (
                      <span className="ml-2 font-semibold text-primary">
                        {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `in ${days} days`}
                      </span>
                    )}
                  </p>
                </div>
                <HolidayTypeBadge type={holiday.type} className="hidden sm:inline-flex" />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
