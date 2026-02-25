import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '../components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

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
              <div className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-12 lg:px-8">
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
                  <Link
                    href="/about"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-primary transition-colors"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/contact"
                    className="hover:text-primary transition-colors"
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

  //   return (
  //     <html lang="en" suppressHydrationWarning>
  //       <body className={inter.className}>
  //         <ThemeProvider
  //           attribute="class"
  //           defaultTheme="system"
  //           enableSystem
  //           disableTransitionOnChange
  //         >
  //           <div className="relative flex min-h-screen flex-col">
  //             {/* Header */}
  //             <header className="border-b">
  //               <div className="mx-auto max-w-[1200px]">
  //                 <Header />
  //               </div>
  //             </header>

  //             {/* Main content */}
  //             <main className="flex-1">
  //               <div className="mx-auto max-w-[1200px] py-6">{children}</div>
  //             </main>

  //             {/* Footer */}
  //             <footer className="border-t py-6">
  //               <div className="mx-auto max-w-[1200px] flex flex-col items-center justify-between gap-4 md:flex-row">
  //                 <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
  //                   Built with ❤️ by{' '}
  //                   <a className="text-blue-600" href="https://dayschedule.com/">
  //                     DaySchedule
  //                   </a>{' '}
  //                   for the love of holidays 🎉
  //                 </p>
  //                 <div className="flex gap-4 text-sm text-muted-foreground">
  //                   <Link
  //                     href="/about"
  //                     className="transition-colors hover:text-primary"
  //                   >
  //                     About
  //                   </Link>
  //                   <Link
  //                     href="/pricing"
  //                     className="transition-colors hover:text-primary"
  //                   >
  //                     Pricing
  //                   </Link>
  //                   <Link
  //                     href="/terms"
  //                     className="transition-colors hover:text-primary"
  //                   >
  //                     Terms
  //                   </Link>
  //                   <Link
  //                     href="/contact"
  //                     className="transition-colors hover:text-primary"
  //                   >
  //                     Contact
  //                   </Link>
  //                 </div>
  //               </div>
  //             </footer>
  //           </div>

  //           <Toaster />
  //         </ThemeProvider>
  //       </body>
  //     </html>
  //   );
  //
}
