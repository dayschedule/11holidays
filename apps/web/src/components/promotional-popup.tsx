'use client';

import { useEffect, useState } from 'react';
import { X, Calendar, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'ds-dismissed-at';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const DS_URL = 'https://dayschedule.com/?utm_source=11holidays';

export function PromotionalPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const last = raw ? parseInt(raw, 10) : 0;
      if (!last || Date.now() - last > ONE_MONTH_MS) {
        const t = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(t);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Create your appointment booking page"
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-lg border bg-background p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in"
    >
      <button
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-2 top-2 rounded-sm p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="rounded-md bg-muted p-2">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Get 20% off DaySchedule — for life
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a professional booking page in minutes and get 20% off your
            DaySchedule subscription for life.
          </p>
          <div className="mt-3 flex-col gap-4">
            <Button size="sm" asChild onClick={dismiss}>
              <a href={DS_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4" />
                Get 20% Lifetime Discount
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
