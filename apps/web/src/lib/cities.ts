import { CITY_ROWS } from './cities-data';
import { getCountryByCode } from './countries-data';
import { getZone } from './timezones';

export interface City {
  slug: string;
  name: string;
  /** ISO 3166-1 alpha-2; empty for UTC, which is a place in pickers but has no country */
  code: string;
  timeZone: string;
  lat: number;
  lng: number;
  population: number;
  province: string;
}

export const CITIES: City[] = CITY_ROWS.map(([slug, name, code, timeZone, lat, lng, population, province]) => ({
  slug,
  name,
  code,
  timeZone,
  lat,
  lng,
  population,
  province,
}));

const UTC_PLACE: City = { slug: 'utc', name: 'UTC', code: '', timeZone: 'UTC', lat: 0, lng: 0, population: 0, province: '' };

/** Everything a time picker can offer */
export const PLACES: City[] = [UTC_PLACE, ...CITIES];

const bySlug = new Map(CITIES.map((c) => [c.slug, c]));

/** Names people type that the source data spells differently */
export const CITY_SLUG_ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  'new-delhi': 'delhi',
  nyc: 'new-york',
  'new-york-city': 'new-york',
  washington: 'washington-d-c',
  'washington-dc': 'washington-d-c',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  saigon: 'ho-chi-minh-city',
  peking: 'beijing',
};

export const getCityBySlug = (slug: string) => bySlug.get(slug);

export const getPlace = (slug: string) => (slug === 'utc' ? UTC_PLACE : bySlug.get(slug));

/** Parses a comma list of slugs from a URL, dropping unknown ones and repeats */
export const parsePlaces = (value: string | undefined): City[] =>
  [...new Set(value?.split(',') ?? [])].flatMap((slug) => getPlace(slug) ?? []);

export const countryNameOf = (city: City) => (city.code ? (getCountryByCode(city.code)?.name ?? '') : '');

/** "Tokyo, Japan" */
export function cityLabel(city: City) {
  const country = countryNameOf(city);
  return country ? `${city.name}, ${country}` : city.name;
}

export const citiesInCountry = (code: string) => CITIES.filter((c) => c.code === code);

export const citiesInZone = (timeZone: string) => CITIES.filter((c) => c.timeZone === timeZone);

/** The largest city that keeps the same time as this zone, which is how a browser zone becomes a place */
export function cityForTimeZone(timeZone: string): City | undefined {
  const zone = getZone(timeZone);
  return zone && (zone.name === 'UTC' ? UTC_PLACE : CITIES.find((c) => c.timeZone === zone.name));
}

const REGION_ORDER = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];

/** Cities grouped by continent, biggest first, for directory pages */
export function citiesByRegion() {
  const groups = new Map<string, City[]>(REGION_ORDER.map((r) => [r, []]));
  for (const city of CITIES) {
    const region = getCountryByCode(city.code)?.region;
    if (region) groups.get(region)?.push(city);
  }
  return [...groups].map(([region, cities]) => ({ region, cities }));
}

/** Global business hubs, used as the default world clock and to compare a city with the rest of the world */
export const HUB_CITIES = ['new-york', 'london', 'dubai', 'mumbai', 'singapore', 'tokyo', 'sydney', 'los-angeles'];
