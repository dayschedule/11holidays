'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateYearCalendar,
  calendarThemes,
  CalendarTheme,
  getMonthName,
} from '@/lib/calendar-utils';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Holiday } from '@/lib/holidays-api';
import { CalendarMonthView } from './calendar-month-view';
import { CalendarYearView } from './calendar-year-view';
import { COUNTRIES_WITH_SLUG, Country } from '@/lib/countries-data';
import { redirect } from 'next/navigation';

interface CalendarGeneratorProps {
  countries: Country[];
  currentYear: number;
  preselectedCountry: string;
  holidaysData: {
    holidays: Holiday[];
    country: string;
    year: number;
  };
}

export function CalendarGenerator({
  countries,
  currentYear,
  preselectedCountry,
  holidaysData,
}: CalendarGeneratorProps) {
  const [selectedCountry, setSelectedCountry] = useState(preselectedCountry);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [selectedMonth, setSelectedMonth] = useState('0');
  const [selectedTheme, setSelectedTheme] = useState<CalendarTheme>('default');
  const [customHeading, setCustomHeading] = useState('');
  const [holidays, setHolidays] = useState<Holiday[]>(
    holidaysData?.holidays || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'image' | 'pdf' | null>(
    null,
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  // const loadHolidays = async () => {
  //   setIsLoading(true);
  //   try {
  //     const mockHolidays: Holiday[] = [
  //       {
  //         date: `${selectedYear}-01-01`,
  //         name: "New Year's Day",
  //         type: 'PUBLIC',
  //         countryCode: selectedCountry,
  //       },
  //       {
  //         date: `${selectedYear}-07-04`,
  //         name: 'Independence Day',
  //         type: 'PUBLIC',
  //         countryCode: selectedCountry,
  //       },
  //       {
  //         date: `${selectedYear}-12-25`,
  //         name: 'Christmas Day',
  //         type: 'PUBLIC',
  //         countryCode: selectedCountry,
  //       },
  //     ];
  //     setHolidays(mockHolidays);
  //   } catch (error) {
  //     console.error('Error loading holidays:', error);
  //     setHolidays([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    //loadHolidays();
    if (preselectedCountry !== selectedCountry) {
      const country = COUNTRIES_WITH_SLUG.find(
        (c) => c.code === selectedCountry,
      );
      if (country) redirect(`/calendars/${country.slug}`);
    }
  }, [preselectedCountry, selectedCountry]);

  const months = generateYearCalendar(parseInt(selectedYear), holidays);
  const theme = calendarThemes[selectedTheme];
  const country = countries.find((c) => c.code === selectedCountry);

  const handleDownload = async (type: 'image' | 'pdf') => {
    if (!calendarRef.current) return;
    setIsDownloading(type);

    try {
      // Small delay to ensure layout is stable
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(calendarRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: calendarRef.current.scrollWidth,
        windowHeight: calendarRef.current.scrollHeight,

        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(
            '[data-calendar-preview]',
          );
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
          }
          clonedDoc.querySelectorAll('*').forEach((el) => {
            const computed = window.getComputedStyle(el);

            if (computed.color.includes('lab')) {
              (el as HTMLElement).style.color = 'rgb(0, 0, 0)';
            }

            if (computed.backgroundColor.includes('lab')) {
              (el as HTMLElement).style.backgroundColor = 'rgb(255, 255, 255)';
            }

            if (computed.borderColor.includes('lab')) {
              (el as HTMLElement).style.borderColor = 'rgb(0, 0, 0)';
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      if (type === 'image') {
        const link = document.createElement('a');
        link.download = `calendar-${selectedCountry}-${selectedYear}.png`;
        link.href = imgData;
        link.click();
        return;
      }

      // Generate PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format:
          orientation === 'landscape'
            ? [imgHeight * 0.75, imgWidth * 0.75]
            : [imgWidth * 0.75, imgHeight * 0.75],
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        'FAST',
      );

      pdf.save(`calendar-${selectedCountry}-${selectedYear}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4">
          {/* 2-col grid on mobile/tablet → flex row on desktop (md+). Wraps cleanly either way. */}
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-end">
            {/* Country — full width on mobile; flexible on desktop */}
            <div className="col-span-2 md:min-w-[220px] md:flex-1">
              <Label className="mb-1 block text-xs">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                {/* Capped height: long list scrolls instead of filling the screen */}
                <SelectContent className="max-h-[280px]">
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year + View share a row on mobile */}
            <div className="md:w-[110px]">
              <Label className="mb-1 block text-xs">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {Array.from(
                    { length: 10 },
                    (_, i) => currentYear - 2 + i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:w-[130px]">
              <Label className="mb-1 block text-xs">View</Label>
              <Select
                value={viewMode}
                onValueChange={(v) => setViewMode(v as 'year' | 'month')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month — only in month view; full width on mobile */}
            {viewMode === 'month' && (
              <div className="col-span-2 md:w-[150px]">
                <Label className="mb-1 block text-xs">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {getMonthName(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Theme — full width on mobile (room for the color swatch + name) */}
            <div className="col-span-2 md:w-[180px]">
              <Label className="mb-1 block text-xs">Theme</Label>
              <Select
                value={selectedTheme}
                onValueChange={(v) => setSelectedTheme(v as CalendarTheme)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {Object.entries(calendarThemes).map(([key, theme]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 shrink-0 rounded border"
                          style={{ backgroundColor: theme.primary }}
                        />
                        {theme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Heading — full width on mobile, wide flexible on desktop */}
            <div className="col-span-2 md:min-w-[250px] md:flex-[2]">
              <Label className="mb-1 block text-xs">Heading</Label>
              <Input
                placeholder="Company Name 2026"
                value={customHeading}
                onChange={(e) => setCustomHeading(e.target.value)}
              />
            </div>

            {/* Buttons — side-by-side full width on mobile, inline on desktop */}
            <div className="col-span-2 grid grid-cols-2 gap-2 md:col-span-1 md:flex md:gap-2">
              <Button
                className="w-full md:w-auto"
                onClick={() => handleDownload('image')}
                disabled={isDownloading !== null || isLoading}
              >
                {isDownloading === 'image' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="ml-2">PNG</span>
              </Button>

              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading !== null || isLoading}
              >
                {isDownloading === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="ml-2">PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-full overflow-auto">
              <div ref={calendarRef} data-calendar-preview>
                {viewMode === 'year' ? (
                  <CalendarYearView
                    months={months}
                    year={parseInt(selectedYear)}
                    theme={theme}
                    heading={customHeading || `${country?.name} Holidays`}
                  />
                ) : (
                  <CalendarMonthView
                    month={months[parseInt(selectedMonth)]!}
                    theme={theme}
                    heading={customHeading || `${country?.name} Holidays`}
                    showYear={true}
                    year={parseInt(selectedYear)}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
