'use client';

import { useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LongWeekend } from '@/lib/long-weekends';

interface Props {
  longWeekends: LongWeekend[];
}

const FILTER_OPTIONS = [
  { value: '0', label: 'Without off' },
  { value: '1', label: 'With 1 day off' },
  { value: '2', label: 'With 2 days off' },
] as const;

export function LongWeekendsTable({ longWeekends }: Props) {
  const [filter, setFilter] = useState('0');

  const filtered = useMemo(
    () => longWeekends.filter((lw) => lw.leavesNeeded === Number(filter)),
    [longWeekends, filter],
  );

  return (
    <section className="space-y-4">
      {/* Filter toggles */}
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(v) => v && setFilter(v)}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        {FILTER_OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.value}
            value={opt.value}
            className="text-xs"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          No long weekends found for this filter.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Occasion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lw) => (
                  <TableRow key={lw.id}>
                    <TableCell className="font-medium">{lw.month}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(parseISO(lw.startDate), 'd MMM (EEE)')} –{' '}
                      {format(parseISO(lw.endDate), 'd MMM (EEE)')}
                    </TableCell>
                    <TableCell>{lw.days}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {lw.occasion}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((lw) => (
              <Card key={lw.id}>
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lw.occasion}</span>
                    <Badge variant="secondary" className="text-xs">
                      {lw.days} days
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(lw.startDate), 'd MMM (EEE)')} –{' '}
                    {format(parseISO(lw.endDate), 'd MMM (EEE)')}
                  </p>
                  <p className="text-xs text-muted-foreground">{lw.month}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
