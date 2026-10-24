import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Github, Menu, Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { SearchCommand } from './search-command';
import { Button } from './ui/button';
import { Kbd } from './ui/kbd';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const navItems = [
  { to: '/holidays', label: 'Holidays' },
  { to: '/calendars', label: 'Calendars' },
  { to: '/widget', label: 'Widget' },
  { to: '/countries', label: 'Countries' },
  { to: '/pricing', label: 'API Pricing' },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-festive-gradient text-sm font-semibold tracking-[-0.03em] text-white shadow-sm">
        <span className="absolute inset-x-0 top-0 h-2 bg-black/15" />
        11
      </span>
      <span className="text-lg font-bold tracking-tight">
        holidays<span className="text-primary">.com</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: 'text-foreground bg-accent' }}
            >
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
              <nav className="flex flex-col gap-1 px-4">
                {[...navItems, { to: '/my-calendars', label: 'My calendars' } as const, { to: '/api-key', label: 'Get API Key' } as const].map(
                  ({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                      activeProps={{ className: 'bg-accent text-primary' }}
                    >
                      {label}
                    </Link>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
