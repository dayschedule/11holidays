import { useEffect, useId, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Briefcase,
  Calendar,
  CalendarDays,
  ChevronDown,
  Code2,
  Github,
  Globe2,
  LayoutGrid,
  Menu,
  Palmtree,
  Search,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { SearchCommand } from './search-command';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Kbd } from './ui/kbd';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

type NavTo =
  | '/holidays'
  | '/countries'
  | '/search'
  | '/countdown'
  | '/leave-planner'
  | '/working-days-calculator'
  | '/calendars'
  | '/widget'
  | '/tools'
  | '/pricing'
  | '/my-calendars'
  | '/api-key';

interface NavLink {
  to: NavTo;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavLink[];
  /** "See all" link under the items */
  footer?: NavLink;
}

const navGroups: NavGroup[] = [
  {
    label: 'Holidays',
    items: [
      { to: '/holidays', label: 'Holidays this year', description: 'Festivals and holidays worldwide', icon: CalendarDays },
      { to: '/countries', label: 'Countries', description: 'Public holidays for 230+ countries', icon: Globe2 },
      { to: '/search', label: 'Search holidays', description: 'Find a holiday in every country', icon: Search },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/countdown', label: 'Countdown timer', description: 'Count down to any date or event', icon: Timer },
      { to: '/leave-planner', label: 'Leave planner', description: 'Most days off from your leaves', icon: Palmtree },
      { to: '/working-days-calculator', label: 'Working days calculator', description: 'Business days between dates', icon: Briefcase },
      { to: '/calendars', label: 'Calendar maker', description: 'Printable holiday calendars', icon: Calendar },
      { to: '/widget', label: 'Holidays widget', description: 'Embed holidays on your website', icon: Code2 },
    ],
    footer: { to: '/tools', label: 'All tools', icon: LayoutGrid },
  },
];

const navLinks: NavLink[] = [{ to: '/pricing', label: 'API Pricing' }];

const navLinkClass =
  'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground';

const groupLinks = (group: NavGroup) => (group.footer ? [...group.items, group.footer] : group.items);

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = groupLinks(group).some((l) => pathname === l.to || pathname.startsWith(`${l.to}/`));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(navLinkClass, active && 'bg-accent text-foreground')}>
        {group.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-1.5">
        {group.items.map((item) => (
          <DropdownMenuItem key={item.to} asChild className="cursor-pointer items-start gap-3 p-2">
            <Link to={item.to}>
              {item.icon && (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                {item.description && <span className="text-xs text-muted-foreground">{item.description}</span>}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        {group.footer && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer text-sm font-medium text-primary">
              <Link to={group.footer.to}>
                {group.footer.icon && <group.footer.icon className="h-4 w-4 text-primary" />}
                {group.footer.label}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2643A" />
          <stop offset="0.55" stopColor="#E4572E" />
          <stop offset="1" stopColor="#A63FCB" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <rect width="64" height="64" rx="15" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="64" height="64" fill={`url(#${id}g)`} />
        <rect width="64" height="17" fill="#000" fillOpacity=".18" />
      </g>
      <rect x="17" y="5" width="5" height="13" rx="2.5" fill="#fff" />
      <rect x="42" y="5" width="5" height="13" rx="2.5" fill="#fff" />
      <path fill="#fff" d="M28 24v29h-7.5V33.6l-5 2.9v-6.9L22 24zM45.5 24v29H38V33.6l-5 2.9v-6.9L39.5 24z" />
      <path fill="#FFD25A" d="M53 22l1.3 3.2 3.2 1.3-3.2 1.3L53 31l-1.3-3.2-3.2-1.3 3.2-1.3z" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="11holidays home">
      <LogoMark className="h-9 w-9 shrink-0 drop-shadow-sm" />
      <span className="text-lg font-bold tracking-tight">
        holidays<span className="text-primary">.com</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, [contenteditable=true]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="no-print sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="ribbon h-1 w-full opacity-90" />
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {navGroups.map((group) => (
            <NavDropdown key={group.label} group={group} pathname={pathname} />
          ))}
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={navLinkClass} activeProps={{ className: 'text-foreground bg-accent' }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-full border bg-card px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-foreground md:w-64"
            aria-label="Search holidays"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search holidays…</span>
            <Kbd className="ml-auto hidden md:inline-flex">⌘K</Kbd>
          </button>

          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <a href="https://github.com/dayschedule/11holidays" target="_blank" rel="nofollow noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>

          <ThemeToggle />

          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link to="/api-key">Get API Key</Link>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
                {[
                  ...navGroups.map((g) => ({ label: g.label, items: groupLinks(g) })),
                  {
                    label: 'Developers',
                    items: [
                      ...navLinks,
                      { to: '/my-calendars', label: 'My calendars' },
                      { to: '/api-key', label: 'Get API Key' },
                    ] satisfies NavLink[],
                  },
                ].map((group) => (
                  <div key={group.label} className="flex flex-col gap-0.5">
                    <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMenuOpen(false)}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                        activeProps={{ className: 'bg-accent text-primary' }}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
