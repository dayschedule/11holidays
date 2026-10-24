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
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        {sidebar ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className={cn('lg:col-span-9 space-y-6', className)}>
              {children}
            </div>
            <aside className="lg:col-span-3">
              <AdSidebar country={country}/>
            </aside>
          </div>
        ) : (
          <div className={cn('space-y-8', className)}>{children}</div>
        )}
      </main>
    </div>
  );
}
