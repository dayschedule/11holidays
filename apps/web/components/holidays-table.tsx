"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Copy, Check, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  copyToClipboard,
  downloadJSON,
  formatDate,
  getDayOfWeek,
  Holiday,
} from '@/lib/holidays-api';
import { Country } from '@/lib/countries-data';

interface HolidaysTableProps {
  holidays: Holiday[];
  country: Country;
  year: number;
  filter: boolean;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function HolidaysTable({
  holidays,
  country,
  year,
  filter,
}: HolidaysTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const monthCounts = holidays.reduce(
    (acc, holiday) => {
      const month = new Date(holiday.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch = holiday.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || holiday.type === typeFilter;
    const holidayMonth = new Date(holiday.date).getMonth();
    const matchesMonth =
      monthFilter === 'all' || parseInt(monthFilter) === holidayMonth;
    return matchesSearch && matchesType && matchesMonth;
  });

  const uniqueTypes = Array.from(new Set(holidays.map((h) => h.type)));

  const handleDownloadJSON = () => {
    const data = {
      country: country.name,
      countryCode: country.code,
      year: year,
      holidays: filteredHolidays,
    };
    downloadJSON(data, `holidays-${country.code}-${year}.json`);
  };

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Name', 'Type', 'Day of Week'];
    const rows = filteredHolidays.map((holiday) => [
      holiday.date,
      holiday.name,
      holiday.type,
      getDayOfWeek(holiday.date),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `holidays-${country.code}-${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async () => {
    const data = {
      country: country.name,
      countryCode: country.code,
      year: year,
      holidays: filteredHolidays,
    };
    await copyToClipboard(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4 items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              {country.name} - {year} Holidays
            </CardTitle>
            <CardDescription>
              {filteredHolidays.length} of {holidays.length} holidays
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJSON}
              className="hidden sm:inline-flex items-center whitespace-nowrap shrink-0"
            >
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>Copy</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJSON}
              className="hidden sm:inline-flex items-center whitespace-nowrap shrink-0"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="inline-flex items-center whitespace-nowrap shrink-0"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filter === true && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month} ({monthCounts[index] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Mobile: Card layout */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map((holiday, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm leading-snug">
                      {holiday.name}
                    </p>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {holiday.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(holiday.date)}</span>
                    <span>·</span>
                    <span>{getDayOfWeek(holiday.date)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No holidays found
              </p>
            )}
          </div>
        ) : (
          /* Desktop: Table layout */
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length > 0 ? (
                  filteredHolidays.map((holiday, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(holiday.date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getDayOfWeek(holiday.date)}
                      </TableCell>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{holiday.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No holidays found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
