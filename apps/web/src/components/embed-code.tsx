import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toQueryString, type CalendarSearch } from '@/lib/custom-calendar';
import { SITE_URL } from '@/lib/seo';

export type EmbedView = 'upcoming' | 'list' | 'month' | 'year';

export const EMBED_VIEWS: { value: EmbedView; label: string; height: number }[] = [
  { value: 'upcoming', label: 'Upcoming list', height: 420 },
  { value: 'month', label: 'Month calendar', height: 520 },
  { value: 'year', label: 'Year calendar', height: 720 },
  { value: 'list', label: 'Full year list', height: 600 },
];

interface EmbedCodeProps {
  countrySlug: string;
  search: CalendarSearch;
  defaultView?: EmbedView;
  /** Render the live preview iframe */
  preview?: boolean;
  onViewChange?: (view: EmbedView) => void;
}

export function buildEmbedUrl(countrySlug: string, search: CalendarSearch, view: EmbedView, origin = SITE_URL) {
  // year view and list view take the remaining params as-is; month view keeps the month param
  const params: Record<string, unknown> = { ...search, view };
  if (view !== 'month') delete params.month;
  return `${origin}/embed/${countrySlug}${toQueryString(params)}`;
}

export function EmbedCode({ countrySlug, search, defaultView = 'upcoming', preview = true, onViewChange }: EmbedCodeProps) {
  const [view, setView] = useState<EmbedView>(defaultView);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState(SITE_URL);

  useEffect(() => setView(defaultView), [defaultView]);
  useEffect(() => setOrigin(window.location.origin), []);

  const height = EMBED_VIEWS.find((v) => v.value === view)!.height;
  const publicUrl = buildEmbedUrl(countrySlug, search, view);
  const code = `<iframe src="${publicUrl}" width="100%" height="${height}" style="border:0;border-radius:12px;max-width:100%" loading="lazy" title="Holidays calendar"></iframe>`;

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Widget type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EMBED_VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => {
                setView(v.value);
                onViewChange?.(v.value);
              }}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                view === v.value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Embed code</Label>
          <Button size="sm" variant="outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy code'}
          </Button>
        </div>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
          {code}
        </pre>
      </div>

      {preview && (
        <div className="space-y-2">
          <Label className="text-xs">Live preview</Label>
          <div className="overflow-hidden rounded-xl border bg-muted/40 p-2">
            <iframe
              key={view}
              src={buildEmbedUrl(countrySlug, search, view, origin)}
              width="100%"
              height={height}
              style={{ border: 0, borderRadius: 12 }}
              loading="lazy"
              title="Holidays widget preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
