import { useState, type RefObject } from 'react';
import { CalendarDays, Download, FileSpreadsheet, FileText, Image as ImageIcon, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { CountrySelect } from '@/components/country-select';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { captureCalendar, downloadCalendarPdf, downloadCanvas, type PaperSize } from '@/lib/calendar-export';
import type { YearCalendarSearch } from '@/lib/calendar-pages';
import {
  calendarThemes,
  CALENDAR_THEME_KEYS,
  type CalendarHoliday,
  type CalendarMonth,
  type CalendarTheme,
} from '@/lib/calendar-utils';
import type { Country } from '@/lib/countries-data';
import { downloadBlob, toCSV } from '@/lib/holidays-api';
import { buildIcs } from '@/lib/ics';

interface CalendarToolbarProps {
  country: Country;
  year: number;
  /** Every month of the year, or the single month when this is a month page */
  months: CalendarMonth[];
  holidays: CalendarHoliday[];
  search: YearCalendarSearch;
  /** Element rendered to PNG */
  printRef: RefObject<HTMLDivElement | null>;
  onChange: (patch: Partial<YearCalendarSearch>) => void;
  fileBase: string;
  heading: string;
}

export function CalendarToolbar({ country, year, months, holidays, search, printRef, onChange, fileBase, heading }: CalendarToolbarProps) {
  const [busy, setBusy] = useState(false);
  const [paper, setPaper] = useState<PaperSize>('a4');
  const themeKey: CalendarTheme = search.theme ?? 'festive';
  const theme = calendarThemes[themeKey];
  const weekStart = search.week === 'mon' ? 'mon' : 'sun';

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      console.error('Error generating file:', error);
      toast.error('Could not generate the file. Try Print and choose Save as PDF.');
    } finally {
      setBusy(false);
    }
  };

  const pdf = (overview: boolean, monthPages: boolean, suffix: string) =>
    run(() =>
      downloadCalendarPdf({
        year,
        months,
        theme,
        heading,
        weekStart,
        paper,
        overview,
        monthPages,
        filename: `${fileBase}${suffix}.pdf`,
      })
    );

  const png = () =>
    run(async () => {
      if (!printRef.current) return;
      downloadCanvas(await captureCalendar(printRef.current, theme), `${fileBase}.png`);
    });

  const ics = () =>
    downloadBlob(
      buildIcs(
        heading,
        holidays.map((h) => ({ uid: `${country.code}-${h.date}-${h.id}`, date: h.date, title: h.name, description: h.type }))
      ),
      'text/calendar',
      `${fileBase}.ics`
    );

  const csv = () =>
    downloadBlob(toCSV(holidays.map((h) => ({ date: h.date, name: h.name, type: h.type }))), 'text/csv', `${fileBase}.csv`);

  return (
    <div className="no-print grid gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_0.7fr_auto]">
      <div className="space-y-1.5">
        <Label className="text-xs">Holidays from</Label>
        <CountrySelect value={country.code} onChange={(c) => onChange({ country: c.code.toLowerCase() })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Show</Label>
        <Select
          value={search.show ?? 'public'}
          onValueChange={(v) => onChange({ show: v === 'public' ? undefined : (v as 'all' | 'none') })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public holidays</SelectItem>
            <SelectItem value="all">All observances</SelectItem>
            <SelectItem value="none">Blank calendar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Week starts</Label>
        <Select value={weekStart} onValueChange={(w) => onChange({ week: w === 'mon' ? 'mon' : undefined })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sun">Sunday</SelectItem>
            <SelectItem value="mon">Monday</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Print color</Label>
        <Select value={themeKey} onValueChange={(t) => onChange({ theme: t === 'festive' ? undefined : (t as CalendarTheme) })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CALENDAR_THEME_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: calendarThemes[key].primary }} />
                {calendarThemes[key].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Paper</Label>
        <Select value={paper} onValueChange={(p) => setPaper(p as PaperSize)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a4">A4</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <Button variant="outline" onClick={() => window.print()} className="flex-1 lg:flex-none">
          <Printer className="h-4 w-4" /> Print
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={busy} className="flex-1 lg:flex-none">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {months.length === 1 ? (
              <DropdownMenuItem onClick={() => pdf(false, true, '')}>
                <FileText className="h-4 w-4" /> PDF
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => pdf(true, false, '')}>
                  <FileText className="h-4 w-4" /> PDF, year on one page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => pdf(false, true, '-monthly')}>
                  <FileText className="h-4 w-4" /> PDF, one page per month
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => pdf(true, true, '-full')}>
                  <FileText className="h-4 w-4" /> PDF, year and 12 months
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={png}>
              <ImageIcon className="h-4 w-4" /> PNG image
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={holidays.length === 0} onClick={ics}>
              <CalendarDays className="h-4 w-4" /> Holidays as iCal (.ics)
            </DropdownMenuItem>
            <DropdownMenuItem disabled={holidays.length === 0} onClick={csv}>
              <FileSpreadsheet className="h-4 w-4" /> Holidays as CSV (Excel)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
