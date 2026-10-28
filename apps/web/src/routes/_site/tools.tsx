import { Link, createFileRoute, type LinkComponentProps } from '@tanstack/react-router';
import { ArrowRight, Briefcase, Calendar, Code2, Palmtree, Search, Sunset, Timer, type LucideIcon } from 'lucide-react';
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

export const Route = createFileRoute('/_site/tools')({
  head: () =>
    seo({
      title: `Free Holiday Tools ${currentYear()} - Countdown, Leave Planner, Working Days | 11holidays`,
      description:
        'Free holiday tools: countdown timer, leave planner, working days calculator, printable holiday calendars and an embeddable holidays widget for 230+ countries.',
      path: '/tools',
      jsonLd: [
        webPageSchema('/tools', 'Free holiday tools', undefined, 'CollectionPage'),
        {
          '@type': 'ItemList',
          name: 'Holiday tools',
          itemListElement: TOOLS.map((t, i) => ({
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
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Free holiday tools</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Plan time off, count down to the next celebration and work around public holidays in 230+ countries.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
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
    </PageLayout>
  );
}
