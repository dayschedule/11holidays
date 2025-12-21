import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '../components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '11holidays.com - Public Holidays API & Calendar',
  description:
    'Access public holidays for 30+ countries. Get holiday data via API with our free service. Perfect for developers and businesses.',
  keywords: [
    'holidays',
    'public holidays',
    'API',
    'calendar',
    'international holidays',
  ],
};

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
          <div className="relative flex min-h-screen flex-col">
            {/* Header */}
            <header className="border-b">
              <div className="mx-auto max-w-[1200px]">
                <Header />
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
              <div className="mx-auto max-w-[1200px] py-6">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t py-6">
              <div className="mx-auto max-w-[1200px] flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with ❤️ by <a className='text-blue-600' href="https://dayschedule.com/">DaySchedule</a> for the love of holidays 🎉
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <Link
                    href="/about"
                    className="transition-colors hover:text-primary"
                  >
                    About
                  </Link>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-primary"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-primary"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-primary"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </footer>
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
