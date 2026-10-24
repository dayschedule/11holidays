import { addDays, format, parseISO } from 'date-fns';

export interface IcsEvent {
  uid: string;
  date: string; // yyyy-MM-dd
  title: string;
  description?: string;
  url?: string;
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Fold long lines to 75 octets as required by RFC 5545 */
function fold(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) {
    parts.push((i === 0 ? '' : ' ') + line.slice(i, i + 73));
  }
  return parts.join('\r\n');
}

const compact = (date: string) => date.replace(/-/g, '');

export function buildIcs(calendarName: string, events: IcsEvent[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//11holidays.com//Holidays Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    'X-PUBLISHED-TTL:PT24H',
  ];

  for (const event of events) {
    const end = format(addDays(parseISO(event.date), 1), 'yyyyMMdd');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}@11holidays.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(event.date)}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeText(event.title)}`,
      'TRANSP:TRANSPARENT'
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n');
}

export function googleCalendarUrl(event: Omit<IcsEvent, 'uid'>) {
  const end = format(addDays(parseISO(event.date), 1), 'yyyyMMdd');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compact(event.date)}/${end}`,
    details: [event.description, event.url].filter(Boolean).join('\n\n'),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(event: Omit<IcsEvent, 'uid'>) {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.date,
    enddt: format(addDays(parseISO(event.date), 1), 'yyyy-MM-dd'),
    allday: 'true',
    body: [event.description, event.url].filter(Boolean).join('\n\n'),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
