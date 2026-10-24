import { Link, useRouterState } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { CountryFlag } from '@/components/country-flag';
import { getCountryName } from '@/lib/countries-data';

const POOL = [
  'US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'AE', 'SG', 'BR', 'MX', 'JP',
  'IT', 'ES', 'NL', 'ZA', 'NZ', 'PH', 'MY', 'ID', 'SA', 'IE', 'PK', 'NG',
];
const COUNT = 8;

// Seeded by pathname so server and client render the same set (no hydration
// mismatch) while each page links to a different mix of countries.
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function PopularCountries() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const year = new Date().getFullYear();
  const current = pathname.split('/')[2]?.toUpperCase();
  const countries = seededShuffle(
    POOL.filter((c) => c !== current),
    pathname
  ).slice(0, COUNT);

  return (
    <section className="no-print mt-16 w-full border-t bg-secondary/30">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Popular countries</h2>
          <Link to="/countries" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {countries.map((code) => (
            <Link
              key={code}
              to="/holidays/$country/$slug"
              params={{ country: code.toLowerCase(), slug: String(year) }}
              className="group flex items-center justify-between gap-3 bg-card p-5 font-medium hover:bg-secondary"
            >
              <span className="flex min-w-0 items-center gap-3">
                <CountryFlag countryCode={code} className="h-4 w-6 shrink-0 rounded-[2px] shadow-sm" />
                <span className="truncate">
                  {getCountryName(code)} holidays {year}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
