'use client';

import { useState } from 'react';
import {
  Holiday,
  formatDate,
  getDayOfWeek,
  downloadJSON,
  copyToClipboard,
} from '@/lib/holidays-api';
import { Country } from '@/lib/countries-data';
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
import { Search, Download, Copy, Check, Calendar } from 'lucide-react';

interface HolidaysTableProps {
  holidays: Holiday[];
  country: Country;
  year: number;
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

export function HolidaysTable({ holidays, country, year }: HolidaysTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Holidays List</CardTitle>
            <CardDescription>
              {filteredHolidays.length} of {holidays.length} holidays
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyJSON}>
              {copied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
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

          <div className="flex flex-col gap-4 md:flex-row">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
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
              <SelectTrigger className="w-full md:w-[180px]">
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
        </div>

        <div className="overflow-x-auto scroll-smooth">
          <Table className="min-w-max">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm min-w-[90px]">
                  Date
                </TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm min-w-[70px]">
                  Day
                </TableHead>
                <TableHead className="text-xs sm:text-sm min-w-[150px]">Name</TableHead>
                <TableHead className="whitespace-nowrap text-xs sm:text-sm min-w-[100px]">
                  Type
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHolidays.length > 0 ? (
                filteredHolidays.map((holiday, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium whitespace-nowrap text-xs sm:text-sm py-2 sm:py-3 min-w-[90px]">
                      {formatDate(holiday.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm py-2 sm:py-3 min-w-[70px]">
                      {getDayOfWeek(holiday.date)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-3 min-w-[150px]">
                      {holiday.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs sm:text-sm py-2 sm:py-3 min-w-[100px]">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {holiday.type}
                      </span>
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
      </CardContent>
    </Card>
  );
}
