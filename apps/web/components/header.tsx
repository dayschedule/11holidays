import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Github, Globe } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span className="font-bold text-xl">11holidays.com</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/countries"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Countries
            </Link>
            <Link
              href="/pricing"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="gap-3 flex items-center">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/dayschedule/11holidays"
              target="_blank"
              rel="nofollow noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>

          <ThemeToggle />

          <Button asChild>
            <Link href="/api-key">Get API Key</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
