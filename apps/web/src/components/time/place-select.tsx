import { useState } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { CountryFlag } from '@/components/country-flag';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cityLabel, countryNameOf, getPlace, PLACES, type City } from '@/lib/cities';
import { cn } from '@/lib/utils';

function PlaceFlag({ city }: { city: City }) {
  return city.code ? (
    <CountryFlag countryCode={city.code} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
  ) : (
    <span className="h-3.5 w-5 shrink-0" />
  );
}

interface PlaceSelectProps {
  value?: string;
  onChange: (city: City) => void;
  /** Shown instead of the selected place, turning this into an "add" button */
  addLabel?: string;
  className?: string;
  id?: string;
}

/** Searchable picker of cities and UTC */
export function PlaceSelect({ value, onChange, addLabel, className, id }: PlaceSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? getPlace(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(addLabel ? '' : 'w-full justify-between bg-background font-normal', className)}
        >
          {addLabel ? (
            <>
              <Plus className="h-4 w-4" /> {addLabel}
            </>
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-2">
                {selected && <PlaceFlag city={selected} />}
                <span className="truncate">{selected ? cityLabel(selected) : 'Select city'}</span>
              </span>
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <CommandPrimitive>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandPrimitive.Input
              placeholder="Search city or country…"
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandPrimitive.List className="max-h-72 overflow-y-auto p-1">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">No city found.</CommandPrimitive.Empty>
            {PLACES.map((city) => (
              <CommandPrimitive.Item
                key={city.slug}
                value={`${city.name} ${countryNameOf(city)} ${city.province} ${city.slug}`}
                onSelect={() => {
                  onChange(city);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent"
              >
                <PlaceFlag city={city} />
                <span className="flex-1 truncate">{cityLabel(city)}</span>
                {city.slug === value && <Check className="h-4 w-4 text-primary" />}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
