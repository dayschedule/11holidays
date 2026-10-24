import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '../components/ui/sonner';
import { PromotionalPopup } from '../components/promotional-popup';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col w-full overflow-hidden">
            <Header />
            <main className="flex-1 w-full overflow-x-hidden">
              <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-4 md:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <footer className="border-t w-full overflow-x-hidden py-6">
              <div className="mx-auto w-full max-w-[1200px] flex flex-col items-center justify-between gap-3 px-3 sm:gap-4 sm:px-4 md:flex-row md:px-6 lg:px-8">
                <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
                  Built with ❤️ by{' '}
                  <a className="text-blue-600" href="https://dayschedule.com/">
                    DaySchedule
                  </a>{' '}
                  for the love of holidays 🎉
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-muted-foreground md:justify-end">
                  {footerLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      prefetch={false}
                      className="hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </footer>
            <PromotionalPopup />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8402459453084519"
        crossOrigin="anonymous"
      />
    </html>
  );
}
