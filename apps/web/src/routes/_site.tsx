import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { Header, Logo } from '@/components/header';
import { PopularCountries } from '@/components/popular-countries';
import { PromotionalPopup } from '@/components/promotional-popup';
import { Toaster } from '@/components/ui/sonner';

export const Route = createFileRoute('/_site')({
  head: () => ({
    scripts: [
      {
        async: true,
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8402459453084519',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  component: SiteLayout,
});

const footerColumns = [
  {
    title: 'Holidays',
    links: [
      { to: '/holidays', label: 'Holidays this year' },
      { to: '/countries', label: 'All countries' },
      { to: '/search', label: 'Search holidays' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/calendars', label: 'Calendar maker' },
      { to: '/widget', label: 'Embeddable widget' },
      { to: '/my-calendars', label: 'My saved calendars' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { to: '/api-key', label: 'Get API key' },
      { to: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/terms', label: 'Terms' },
    ],
  },
] as const;

function SiteLayout() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="w-full flex-1">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <PopularCountries />
      <footer className="no-print w-full border-t bg-card/50">
        <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)] md:px-6 lg:px-8">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Public holidays for 230+ countries, printable calendars and a
              free holidays widget. Built with ❤️ by{' '}
              <a className="font-medium text-primary hover:underline" href="https://dayschedule.com/">
                DaySchedule
              </a>{' '}
              for the love of holidays 🎉
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ribbon h-1 w-full opacity-80" />
      </footer>
      <PromotionalPopup />
      <Toaster />
    </div>
  );
}
