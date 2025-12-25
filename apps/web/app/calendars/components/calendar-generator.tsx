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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    holidaysData?.holidays || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'image' | 'pdf' | null>(
    null
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
        (c) => c.code === selectedCountry
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
            '[data-calendar-preview]'
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
        'FAST'
      );

      pdf.save(`calendar-${selectedCountry}-${selectedYear}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => currentYear - 2 + i).map(
                  (year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>View Mode</Label>
            <RadioGroup
              value={viewMode}
              onValueChange={(v) => setViewMode(v as 'year' | 'month')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="year" id="year" />
                <Label htmlFor="year" className="font-normal cursor-pointer">
                  Year View
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month" className="font-normal cursor-pointer">
                  Month View
                </Label>
              </div>
            </RadioGroup>
          </div>

          {viewMode === 'month' && (
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={selectedTheme}
              onValueChange={(v) => setSelectedTheme(v as CalendarTheme)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(calendarThemes).map(([key, theme]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded border"
                        style={{ backgroundColor: theme.primary }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Heading (Optional)</Label>
            <Input
              placeholder="e.g., Company Name 2025"
              value={customHeading}
              onChange={(e) => setCustomHeading(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label>Download</Label>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleDownload('image')}
                disabled={isDownloading !== null || isLoading}
                className="w-full"
              >
                {isDownloading === 'image' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download as Image
              </Button>
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading !== null || isLoading}
                variant="outline"
                className="w-full"
              >
                {isDownloading === 'pdf' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download as PDF
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
