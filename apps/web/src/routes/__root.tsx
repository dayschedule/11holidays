/// <reference types="vite/client" />
import type { ReactNode } from 'react';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider, themeScript } from '@/components/theme-provider';
import { NotFound } from '@/components/not-found';
import { OPENAPI_URL, organizationSchema, seo, websiteSchema } from '@/lib/seo';
import { currentYear } from '@/lib/holidays-api';
import { serverNow } from '@/hooks/use-today';
import appCss from '@/styles.css?url';

export const Route = createRootRoute({
  loader: () => ({ now: serverNow() }),
  head: () => {
    const { meta } = seo({
      title: `Holidays API & Calendar for ${currentYear()} - 11holidays.com`,
      description:
        'Public holidays for 230+ countries. Search holidays, build printable and embeddable holiday calendars, plan long weekends and access holiday data via API.',
      jsonLd: [organizationSchema(), websiteSchema()],
    });
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#e4572e' },
        ...meta,
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400..700;1,400..700&display=swap',
        },
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'alternate', type: 'text/plain', title: 'LLM-friendly site guide', href: '/llms.txt' },
        { rel: 'api-catalog', href: '/.well-known/api-catalog' },
        { rel: 'service-desc', type: 'application/vnd.oai.openapi+json', href: OPENAPI_URL },
        { rel: 'service-doc', href: '/docs/api' },
        { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      ],
    };
  },
  shellComponent: RootDocument,
  component: () => (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  ),
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
