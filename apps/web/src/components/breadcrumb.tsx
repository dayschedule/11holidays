import { Link, useRouter } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '@/lib/seo';

type BreadcrumbItem =
  | { label: string; to?: undefined }
  | { label: string; to: '/' | '/countries' | '/holidays' | '/calendars' | '/my-calendars' | '/widget' }
  | { label: string; to: '/holidays/$country'; params: { country: string } };

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.to && {
        item: new URL(
          router.buildLocation(item.to === '/holidays/$country' ? { to: item.to, params: item.params } : { to: item.to }).href,
          SITE_URL
        ).toString(),
      }),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="no-print flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}

            {item.to === '/holidays/$country' ? (
              <Link to={item.to} params={item.params} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : item.to ? (
              <Link to={item.to} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="line-clamp-1 font-medium text-foreground">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
