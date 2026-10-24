import type { ReactNode } from 'react';
import { CountryFlag } from '@/components/country-flag';

interface CountryHeadingProps {
  countryCode: string;
  title: ReactNode;
  description?: ReactNode;
  /** Controls shown centered below the description */
  children?: ReactNode;
}

/** Country page heading: on mobile the flag is centered above the title, from `sm` it sits beside it */
export function CountryHeading({ countryCode, title, description, children }: CountryHeadingProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center sm:items-start sm:gap-5 sm:text-left">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <CountryFlag countryCode={countryCode} className="h-12 w-[72px] shrink-0 rounded-md shadow-md sm:h-12 sm:w-16" />
        <div className="space-y-2 sm:space-y-0">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}
