import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Github, Globe } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-[1200px] flex h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex gap-4 md:gap-6 lg:gap-10 items-center min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="hidden sm:inline font-bold text-sm sm:text-base md:text-lg lg:text-xl">
              11holidays.com
            </span>
            <span className="sm:hidden font-bold text-sm">11h</span>
          </Link>
          <nav className="hidden lg:flex gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex items-center text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
            >
              Home
            </Link>
            <Link
              href="/countries"
              className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Countries
            </Link>
            <Link
              href="/pricing"
              className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="flex items-center text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-primary whitespace-nowrap"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
            <a
              href="https://github.com/dayschedule/11holidays"
              target="_blank"
              rel="nofollow noreferrer"
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </Button>

          <ThemeToggle />

          <Button asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
            <Link href="/api-key">API Key</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
