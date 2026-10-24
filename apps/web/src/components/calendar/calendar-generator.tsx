import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { format, isValid, parseISO } from 'date-fns';
import {
  CalendarDays,
  Check,
  Code2,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Printer,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CountrySelect } from '@/components/country-select';
import { EmbedCode, type EmbedView } from '@/components/embed-code';
import { HolidayTypeBadge } from '@/components/holiday-type-badge';
import { useToday } from '@/hooks/use-today';
import { calendarThemes, generateYearCalendar, getMonthName, type CalendarTheme } from '@/lib/calendar-utils';
import type { Country } from '@/lib/countries-data';
import {
  buildCalendarHolidays,
  cleanSearch,
  encodeSelection,
  getExcludedKeys,
  holidayKey,
  loadSavedCalendars,
  parseCustomEntries,
  serializeCustomEntries,
  toQueryString,
  upsertSavedCalendar,
  type CalendarSearch,
} from '@/lib/custom-calendar';
import { downloadBlob, holidayKind, toCSV, type Holiday } from '@/lib/holidays-api';
import { buildIcs } from '@/lib/ics';
import { SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { CalendarListView } from './calendar-list-view';
import { CalendarMonthView } from './calendar-month-view';
import { CalendarYearView } from './calendar-year-view';

interface CalendarGeneratorProps {
  country: Country;
  year: number;
  holidays: Holiday[];
  search: CalendarSearch;
}

const UNSUPPORTED_COLOR = /oklch|oklab|lab\(|lch\(|color\(/;

export function CalendarGenerator({ country, year, holidays, search }: CalendarGeneratorProps) {
  const navigate = useNavigate();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<'image' | 'pdf' | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [title, setTitle] = useState(search.title ?? '');
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  const view = search.view ?? 'year';
  const today = useToday();
  const month = search.month ?? today.getMonth();
  const themeKey: CalendarTheme = search.theme ?? 'festive';
  const theme = calendarThemes[themeKey];
  const weekStart = search.week ?? 'sun';
  const heading = search.title || `${country.name} Holidays`;

  const update = (patch: Partial<CalendarSearch>) =>
    navigate({
      to: '/calendars/$country',
      params: { country: country.slug! },
      search: cleanSearch({ ...search, ...patch }),
      replace: true,
      resetScroll: false,
    });

  // Keep the heading in the URL without navigating on every keystroke
  useEffect(() => {
    if ((search.title ?? '') === title) return;
    const t = setTimeout(() => update({ title: title || undefined }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const excluded = useMemo(() => getExcludedKeys(search, holidays), [search, holidays]);
  const customEntries = parseCustomEntries(search.add);
  const selected = useMemo(() => buildCalendarHolidays(holidays, search), [holidays, search]);
  const months = useMemo(
    () => generateYearCalendar(year, selected, weekStart, today),
    [year, selected, weekStart, today]
  );

  const uniqueHolidays = useMemo(() => {
    const seen = new Set<string>();
    return holidays.filter((h) => {
      const key = holidayKey(h);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [holidays]);

  const setExcluded = (next: Set<string>) =>
    update({ ...encodeSelection(next, holidays), only: undefined });

  const toggle = (key: string) => {
    const next = new Set(excluded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExcluded(next);
  };

  const addCustom = () => {
    if (!newDate || !newName.trim()) return;
    const entries = [...customEntries, { date: newDate, name: newName.trim() }].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    update({ add: serializeCustomEntries(entries) });
    setNewName('');
  };

  const removeCustom = (index: number) =>
    update({ add: serializeCustomEntries(customEntries.filter((_, i) => i !== index)) });

  const shareUrl = `${SITE_URL}/calendars/${country.slug}${toQueryString(search)}`;
  const fileBase = `${(search.title || `${country.name} holidays`).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${year}`;

  const handleDownload = async (type: 'image' | 'pdf') => {
    if (!calendarRef.current) return;
    setIsDownloading(type);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(calendarRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: theme.background,
        windowWidth: calendarRef.current.scrollWidth,
        windowHeight: calendarRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // html2canvas cannot parse modern color functions used by the site theme
          clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
            const computed = clonedDoc.defaultView!.getComputedStyle(el);
            if (UNSUPPORTED_COLOR.test(computed.color)) el.style.color = theme.text;
            if (UNSUPPORTED_COLOR.test(computed.backgroundColor)) el.style.backgroundColor = 'transparent';
            if (UNSUPPORTED_COLOR.test(computed.borderTopColor + computed.borderBottomColor + computed.borderLeftColor + computed.borderRightColor))
              el.style.borderColor = 'transparent';
            if (UNSUPPORTED_COLOR.test(computed.outlineColor)) el.style.outlineColor = 'transparent';
            if (UNSUPPORTED_COLOR.test(computed.textDecorationColor)) el.style.textDecorationColor = 'currentColor';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `${fileBase}.png`;
        link.href = imgData;
        link.click();
        return;
      }

      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, 'PNG', (pageWidth - w) / 2, (pageHeight - h) / 2, w, h, undefined, 'FAST');
      pdf.save(`${fileBase}.pdf`);
    } catch (error) {
      console.error('Error generating file:', error);
      toast.error('Could not generate the file. Try Print → Save as PDF instead.');
    } finally {
      setIsDownloading(null);
    }
  };

  const downloadIcs = () =>
    downloadBlob(
      buildIcs(
        heading,
        selected.map((h) => ({ uid: `${country.code}-${h.date}-${h.id}`, date: h.date, title: h.name, description: h.type }))
      ),
      'text/calendar',
      `${fileBase}.ics`
    );

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Shareable link copied');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Controls */}
      <div className="no-print space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
        <Tabs defaultValue="design" className="gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="holidays">
              Holidays <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-[10px] text-primary">{selected.length}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Calendar title</Label>
              <Input
                placeholder={`e.g. Acme Inc. Holidays ${year}`}
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <CountrySelect
                value={country.code}
                onChange={(c) =>
                  navigate({
                    to: '/calendars/$country',
                    params: { country: c.slug! },
                    search: cleanSearch({ ...search, ex: undefined, inc: undefined }),
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Year</Label>
                <Select
                  value={String(year)}
                  onValueChange={(y) =>
                    update({
                      year: Number(y),
                      // carry custom days over to the new year (skipping Feb 29 on non-leap years)
                      add: serializeCustomEntries(
                        customEntries
                          .map((e) => ({ ...e, date: `${y}${e.date.slice(4)}` }))
                          .filter((e) => isValid(parseISO(e.date)))
                      ),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Week starts</Label>
                <Select value={weekStart} onValueChange={(w) => update({ week: w === 'sun' ? undefined : 'mon' })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sun">Sunday</SelectItem>
                    <SelectItem value="mon">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Layout</Label>
              <div className="grid grid-cols-3 gap-1 rounded-lg border p-1">
                {(['year', 'month', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update({ view: v === 'year' ? undefined : v })}
                    className={cn(
                      'rounded-md py-1.5 text-xs font-medium capitalize',
                      view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {view === 'month' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Month</Label>
                <Select value={String(month)} onValueChange={(m) => update({ month: Number(m) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {getMonthName(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(calendarThemes) as [CalendarTheme, (typeof calendarThemes)[CalendarTheme]][]).map(
                  ([key, t]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => update({ theme: key === 'festive' ? undefined : key })}
                      className={cn(
                        'overflow-hidden rounded-lg border text-left text-[11px] font-medium transition',
                        themeKey === key ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : 'hover:border-primary/40'
                      )}
                    >
                      <span
                        className="block h-6"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span className="block px-2 py-1" style={{ backgroundColor: t.background, color: t.text }}>
                        {t.name}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4 rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex flex-wrap gap-2">
              <Button size="xs" variant="outline" onClick={() => update({ ex: undefined, inc: undefined, only: undefined })}>
                All
              </Button>
              <Button size="xs" variant="outline" onClick={() => update({ ex: undefined, inc: undefined, only: 'public' })}>
                Public only
              </Button>
              <Button size="xs" variant="outline" onClick={() => setExcluded(new Set(uniqueHolidays.map(holidayKey)))}>
                None
              </Button>
            </div>

            <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
              {uniqueHolidays.map((h) => {
                const key = holidayKey(h);
                const checked = !excluded.has(key);
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
                      <Checkbox checked={checked} onCheckedChange={() => toggle(key)} />
                      <span className="min-w-0 flex-1">
                        <span className={cn('block truncate text-sm', !checked && 'text-muted-foreground line-through')}>
                          {h.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{format(parseISO(h.date), 'EEE, d MMM')}</span>
                      </span>
                      {holidayKind(h.type) !== 'other' && <HolidayTypeBadge type={h.type} className="text-[10px]" />}
                    </label>
                  </li>
                );
              })}
              {uniqueHolidays.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">No holidays for {year}</li>
              )}
            </ul>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-xs">Add your own day off</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newDate}
                  min={`${year}-01-01`}
                  max={`${year}-12-31`}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-[150px] shrink-0"
                />
                <Input
                  placeholder="e.g. Founders' Day"
                  value={newName}
                  maxLength={60}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                />
              </div>
              <Button size="sm" variant="secondary" className="w-full" onClick={addCustom} disabled={!newDate || !newName.trim()}>
                <Plus className="h-4 w-4" /> Add custom holiday
              </Button>
              {customEntries.length > 0 && (
                <ul className="space-y-1">
                  {customEntries.map((e, i) => (
                    <li key={`${e.date}-${i}`} className="flex items-center gap-2 rounded-lg bg-muted/60 px-2 py-1.5 text-sm">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: theme.soft, boxShadow: `inset 0 0 0 1px ${theme.primary}` }} />
                      <span className="flex-1 truncate">{e.name}</span>
                      <span className="text-xs text-muted-foreground">{format(parseISO(e.date), 'd MMM')}</span>
                      <button
                        type="button"
                        onClick={() => removeCustom(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${e.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setSaveOpen(true)} className="col-span-2">
            <Save className="h-4 w-4" /> Save calendar
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isDownloading !== null}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                <Download className="h-4 w-4" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload('image')}>
                <ImageIcon className="h-4 w-4" /> PNG image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadIcs}>
                <CalendarDays className="h-4 w-4" /> Calendar (.ics)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  downloadBlob(
                    toCSV(selected.map((h) => ({ date: h.date, name: h.name, type: h.type }))),
                    'text/csv',
                    `${fileBase}.csv`
                  )
                }
              >
                <FileSpreadsheet className="h-4 w-4" /> CSV (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={copyLink}>
            <Link2 className="h-4 w-4" /> Share link
          </Button>
          <Button variant="outline" onClick={() => setEmbedOpen(true)}>
            <Code2 className="h-4 w-4" /> Embed
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="min-w-0 space-y-3">
        <div className="no-print flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Preview · {selected.length} holidays{customEntries.length ? ` (${customEntries.length} custom)` : ''}
          </span>
          <span className="hidden sm:inline">Scroll horizontally on small screens</span>
        </div>
        <div className="print-area overflow-auto rounded-2xl border shadow-lg">
          <div ref={calendarRef} data-calendar-preview>
            {view === 'year' && (
              <CalendarYearView months={months} year={year} theme={theme} heading={heading} weekStart={weekStart} />
            )}
            {view === 'month' && (
              <CalendarMonthView month={months[month]!} theme={theme} heading={heading} year={year} weekStart={weekStart} />
            )}
            {view === 'list' && <CalendarListView holidays={selected} theme={theme} heading={heading} year={year} />}
          </div>
        </div>
      </div>

      <SaveDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        defaultName={search.title || `${country.name} Holidays ${year}`}
        onSave={(name) => {
          const finalSearch = cleanSearch({ ...search, title: search.title || name });
          const existing = loadSavedCalendars().find((c) => c.name === name);
          upsertSavedCalendar({
            id: existing?.id,
            name,
            countryCode: country.code,
            countrySlug: country.slug!,
            search: finalSearch,
          });
          if (!search.title) setTitle(name);
          toast.success(`Saved “${name}”`, { description: 'Find it anytime under My calendars.' });
          setSaveOpen(false);
        }}
      />

      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Embed this calendar</DialogTitle>
            <DialogDescription>
              Paste this code into your website, intranet or Notion. Your selected holidays, custom days and theme are
              included.
            </DialogDescription>
          </DialogHeader>
          <EmbedCode
            countrySlug={country.slug!}
            search={search}
            defaultView={(view === 'list' ? 'list' : view) as EmbedView}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SaveDialog({
  open,
  onOpenChange,
  defaultName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save calendar</DialogTitle>
          <DialogDescription>
            Give it a name like “Acme Inc. Holidays 2026” or “Stock market holidays”. Saved calendars stay in this
            browser and can be shared with a link.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSave(name.trim());
          }}
          className="space-y-4"
        >
          <Input autoFocus value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              <Check className="h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
