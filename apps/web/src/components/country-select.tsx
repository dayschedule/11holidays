import { useState } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { CountryFlag } from '@/components/country-flag';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COUNTRIES_WITH_SLUG, getCountryByCode, type Country } from '@/lib/countries-data';
import { cn } from '@/lib/utils';

interface CountrySelectProps {
  value: string;
  onChange: (country: Country) => void;
  className?: string;
  id?: string;
}

/** Searchable country picker */
export function CountrySelect({ value, onChange, className, id }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const selected = getCountryByCode(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between bg-background font-normal', className)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && <CountryFlag countryCode={selected.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />}
            <span className="truncate">{selected?.name ?? 'Select country'}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
        <CommandPrimitive>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandPrimitive.Input
              placeholder="Search country…"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandPrimitive.List className="max-h-72 overflow-y-auto p-1">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              No country found.
            </CommandPrimitive.Empty>
            {COUNTRIES_WITH_SLUG.map((c) => (
              <CommandPrimitive.Item
                key={c.code}
                value={`${c.name} ${c.official_name} ${c.code}`}
                onSelect={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent"
              >
                <CountryFlag countryCode={c.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                <span className="flex-1 truncate">{c.name}</span>
                {c.code === value && <Check className="h-4 w-4 text-primary" />}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
