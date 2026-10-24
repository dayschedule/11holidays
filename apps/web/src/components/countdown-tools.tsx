import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { calendarThemes, CALENDAR_THEME_KEYS, type CalendarTheme } from '@/lib/calendar-utils';
import { toQueryString } from '@/lib/custom-calendar';
import { SITE_URL } from '@/lib/seo';
import { cn } from '@/lib/utils';

/** `yyyy-MM-dd` or `yyyy-MM-ddTHH:mm` */
export const COUNTDOWN_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;

export type CountdownTarget = { holiday: string } | { title: string; date: string };

export function buildCountdownEmbedUrl(target: CountdownTarget, theme?: CalendarTheme, origin = SITE_URL) {
  return `${origin}/embed/countdown${toQueryString({ ...target, theme })}`;
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="sm" variant="outline" onClick={copy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </Button>
  );
}

export function ShareButton({ title, text, url, className }: { title: string; text?: string; url: string; className?: string }) {
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      // share dismissed
    }
  };
  return (
    <Button variant="outline" onClick={share} className={className}>
      <Share2 className="h-4 w-4" /> Share
    </Button>
  );
}

const EMBED_HEIGHT = 230;

/** Theme picker, iframe code and a live preview for the countdown widget */
export function CountdownEmbedCode({ target }: { target: CountdownTarget }) {
  const [theme, setTheme] = useState<CalendarTheme>('festive');
  const [origin, setOrigin] = useState(SITE_URL);
  useEffect(() => setOrigin(window.location.origin), []);

  const code = `<iframe src="${buildCountdownEmbedUrl(target, theme)}" width="100%" height="${EMBED_HEIGHT}" style="border:0;border-radius:12px;max-width:100%" loading="lazy" title="Countdown"></iframe>`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Color</Label>
        <div className="flex flex-wrap gap-2">
          {CALENDAR_THEME_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTheme(key)}
              title={calendarThemes[key].name}
              aria-label={calendarThemes[key].name}
              className={cn(
                'h-7 w-7 rounded-full border-2 transition-transform hover:scale-110',
                theme === key ? 'border-foreground' : 'border-transparent'
              )}
              style={{ backgroundColor: calendarThemes[key].primary }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Embed code</Label>
          <CopyButton text={code} label="Copy code" />
        </div>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
          {code}
        </pre>
      </div>
      <div className="overflow-hidden rounded-xl border bg-muted/40 p-2">
        <iframe
          src={buildCountdownEmbedUrl(target, theme, origin)}
          width="100%"
          height={EMBED_HEIGHT}
          style={{ border: 0, borderRadius: 12 }}
          loading="lazy"
          title="Countdown widget preview"
        />
      </div>
    </div>
  );
}
