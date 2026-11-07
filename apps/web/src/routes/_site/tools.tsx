import { Link, createFileRoute, type LinkComponentProps } from '@tanstack/react-router';
import {
  ArrowRight,
  Briefcase,
  Calculator,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock3,
  Code2,
  Earth,
  Globe2,
  Hash,
  Hourglass,
  Palmtree,
  Percent,
  Search,
  Sunset,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { currentYear } from '@/lib/holidays-api';
import { seo, webPageSchema } from '@/lib/seo';
import { cn } from '@/lib/utils';

const TOOLS: {
  link: Pick<LinkComponentProps, 'to'>;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    link: { to: '/countdown' },
    title: 'Countdown timer',
    description: 'Count down to any date, event or holiday. Share it, go full screen or embed it on your site.',
    icon: Timer,
    tone: 'from-rose-500/15 to-orange-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    link: { to: '/leave-planner' },
    title: 'Leave planner',
    description: 'Bridge public holidays and weekends to turn a few leave days into the longest breaks.',
    icon: Palmtree,
    tone: 'from-teal-500/15 to-emerald-500/15 text-teal-600 dark:text-teal-400',
  },
  {
    link: { to: '/working-days-calculator' },
    title: 'Working days calculator',
    description: 'Business days between two dates, or a date N working days away, excluding public holidays.',
    icon: Briefcase,
    tone: 'from-emerald-500/15 to-lime-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    link: { to: '/calendars' },
    title: 'Holiday calendar maker',
    description: 'Printable holiday calendars with your own days off. Download PDF, PNG or iCal.',
    icon: Calendar,
    tone: 'from-violet-500/15 to-fuchsia-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    link: { to: '/widget' },
    title: 'Holidays widget',
    description: 'Embed upcoming holidays or a holiday calendar on any website for free.',
    icon: Code2,
    tone: 'from-sky-500/15 to-indigo-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    link: { to: '/countries' },
    title: 'Long weekends',
    description: 'Every long weekend in a country, with the leaves needed to extend it.',
    icon: Sunset,
    tone: 'from-amber-500/15 to-yellow-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    link: { to: '/search' },
    title: 'Holiday search',
    description: 'Find when a holiday or festival is celebrated in every country.',
    icon: Search,
    tone: 'from-slate-500/15 to-zinc-500/15 text-slate-600 dark:text-slate-300',
  },
];

const TIME_TOOLS: typeof TOOLS = [
  {
    link: { to: '/calendar' },
    title: 'Printable calendar',
    description: 'Yearly and monthly calendars with public holidays. Download PDF or PNG in A4 or Letter.',
    icon: CalendarRange,
    tone: 'from-orange-500/15 to-rose-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    link: { to: '/world-clock' },
    title: 'World clock',
    description: 'The current time in 700+ cities, compared with yours. Build a list and share it.',
    icon: Earth,
    tone: 'from-sky-500/15 to-cyan-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    link: { to: '/timezones' },
    title: 'Time zones',
    description: 'Every IANA time zone with its offset, abbreviation, daylight saving dates and cities.',
    icon: Globe2,
    tone: 'from-indigo-500/15 to-blue-500/15 text-indigo-600 dark:text-indigo-400',
  },
  {
    link: { to: '/time-zone-converter' },
    title: 'Time zone converter',
    description: 'Convert any date and time between cities, with daylight saving applied for that date.',
    icon: Clock3,
    tone: 'from-teal-500/15 to-cyan-500/15 text-teal-600 dark:text-teal-400',
  },
  {
    link: { to: '/daylight-saving-time' },
    title: 'Daylight saving time',
    description: 'The exact dates the clocks go forward and back in the US, Europe, Australia and more.',
    icon: Hourglass,
    tone: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    link: { to: '/date-calculator' },
    title: 'Date calculator',
    description: 'Count the days between two dates, or add and subtract days, weeks, months and years.',
    icon: Calculator,
    tone: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    link: { to: '/week-number' },
    title: 'Week number',
    description: 'The current ISO week number and the start and end dates of every week in the year.',
    icon: Hash,
    tone: 'from-lime-500/15 to-green-500/15 text-lime-700 dark:text-lime-400',
  },
  {
    link: { to: '/year-progress' },
    title: 'Year progress',
    description: 'A live view of how much of the year, quarter, month, week and day has passed.',
    icon: Percent,
    tone: 'from-fuchsia-500/15 to-pink-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    link: { to: '/today' },
    title: "Today's date",
    description: 'The date, day of the year and week number, with every holiday happening today.',
    icon: CalendarDays,
    tone: 'from-red-500/15 to-orange-500/15 text-red-600 dark:text-red-400',
  },
];

function ToolGrid({ tools }: { tools: typeof TOOLS }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((t) => (
        <Link
          key={t.title}
          {...t.link}
          className="group flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
        >
          <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br', t.tone)}>
            <t.icon className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold group-hover:text-primary">{t.title}</span>
          <span className="flex-1 text-sm text-muted-foreground">{t.description}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export const Route = createFileRoute('/_site/tools')({
  head: () =>
    seo({
      title: `Free Holiday, Date & Time Tools ${currentYear()} - Calendar, World Clock, Leave Planner | 11holidays`,
      description:
        'Free tools for holidays, dates and time zones: printable calendars, world clock, time zone converter, countdown timer, leave planner and working days calculator for 230+ countries.',
      path: '/tools',
      jsonLd: [
        webPageSchema('/tools', 'Free holiday, date and time tools', undefined, 'CollectionPage'),
        {
          '@type': 'ItemList',
          name: 'Holiday, date and time tools',
          itemListElement: [...TOOLS, ...TIME_TOOLS].map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.title,
            description: t.description,
          })),
        },
      ],
    }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <PageLayout sidebar={false}>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Free holiday and time tools</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Plan time off, work across time zones, print a calendar and count down to the next celebration.
        </p>
      </div>
      <ToolGrid tools={TOOLS} />
      <h2 className="text-2xl font-bold">Date and time tools</h2>
      <ToolGrid tools={TIME_TOOLS} />
    </PageLayout>
  );
}
