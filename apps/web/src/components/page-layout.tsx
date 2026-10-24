import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AdSidebar } from './ad-sidebar';
import { Country } from '../lib/countries-data';

interface PageLayoutProps {
  children: ReactNode;
  sidebar?: boolean;
  country?: Country;
  className?: string;
}

export function PageLayout({
  children,
  sidebar = true,
  country,
  className,
}: PageLayoutProps) {
  return (
    <div className="py-8">
      {sidebar ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className={cn('flex min-w-0 flex-col gap-6 lg:col-span-9', className)}>
            {children}
          </div>
          <aside className="no-print lg:col-span-3">
            <AdSidebar country={country} />
          </aside>
        </div>
      ) : (
        <div className={cn('flex flex-col gap-8', className)}>{children}</div>
      )}
    </div>
  );
}
