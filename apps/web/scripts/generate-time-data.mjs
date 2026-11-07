// Regenerates src/lib/timezones-data.ts and src/lib/cities-data.ts.
// Run after a tzdata change: `npm run generate:time-data -w 11holidays-web`
//
// Sources (both MIT): @vvo/tzdb for zones, city-timezones (Natural Earth) for cities.
// Offsets are not stored: they are computed live with Intl so DST is always right.
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { rawTimeZones } = require('@vvo/tzdb');
const { cityMapping } = require('city-timezones');

const LIB = join(dirname(fileURLToPath(import.meta.url)), '../src/lib');
const YEAR = new Date().getFullYear();

/** Top cities by population, plus enough per country that every country has a page */
const TOP_CITIES = 450;
const PER_COUNTRY = 2;

/** Well known cities a population ranking would miss: `name|ISO2` */
const MUST_INCLUDE = [
  'San Francisco|US', 'Seattle|US', 'Boston|US', 'Austin|US', 'Denver|US', 'Las Vegas|US', 'Honolulu|US', 'Anchorage|US',
  'Washington, D.C.|US', 'Vancouver|CA', 'Toronto|CA', 'Montreal|CA', 'Ottawa|CA', 'Calgary|CA', 'Geneva|CH', 'Zurich|CH',
  'Amsterdam|NL', 'Dublin|IE', 'Edinburgh|GB', 'Manchester|GB', 'Lisbon|PT', 'Oslo|NO', 'Stockholm|SE', 'Copenhagen|DK',
  'Helsinki|FI', 'Prague|CZ', 'Vienna|AT', 'Brussels|BE', 'Luxembourg|LU', 'Reykjavik|IS', 'Munich|DE', 'Frankfurt|DE',
  'Barcelona|ES', 'Milan|IT', 'Doha|QA', 'Abu Dhabi|AE', 'Dubai|AE', 'Kathmandu|NP', 'Colombo|LK', 'Perth|AU', 'Adelaide|AU',
  'Brisbane|AU', 'Canberra|AU', 'Auckland|NZ', 'Wellington|NZ', 'Cape Town|ZA', 'Hobart|AU', 'Darwin|AU', 'Pune|IN',
];

const toSlug = (value) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function offsetAt(date, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(date).map((x) => [x.type, Number(x.value)])
  );
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(date / 60000) * 60000) / 60000;
}

/** en-US only names US zones, so try the English locales that know the others */
const ABBR_LOCALES = ['en-US', 'en-GB', 'en-AU', 'en-NZ', 'en-CA', 'en-IN', 'en-ZA', 'en-SG'];
function abbreviationAt(date, timeZone) {
  for (const locale of ABBR_LOCALES) {
    const name = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
      .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value;
    if (name && !/^(GMT|UTC)[+-−]/.test(name)) return name;
  }
  return '';
}

/** Summer abbreviations no English ICU locale reports */
const DST_ABBR = { 'Europe/Dublin': 'IST' };

const samples = Array.from({ length: 12 }, (_, m) => new Date(Date.UTC(YEAR, m, 15)));

const zones = rawTimeZones
  .filter((z) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: z.name });
      return true;
    } catch {
      return false;
    }
  })
  .map((z) => {
    const offsets = samples.map((d) => offsetAt(d, z.name));
    const std = Math.min(...offsets);
    const dst = Math.max(...offsets);
    const stdDate = samples[offsets.indexOf(std)];
    const dstDate = samples[offsets.indexOf(dst)];
    const stdAbbr = abbreviationAt(stdDate, z.name);
    return {
      name: z.name,
      label: z.alternativeName,
      continent: z.continentName,
      country: z.countryCode,
      countryName: z.countryName,
      cities: z.mainCities.slice(0, 4),
      aliases: z.group.filter((g) => g !== z.name),
      std,
      // tzdb's own abbreviation is fine for zones without DST, it can't be the wrong half of the year
      abbr: stdAbbr || (std === dst ? z.abbreviation : ''),
      dstAbbr: std === dst ? '' : (DST_ABBR[z.name] ?? abbreviationAt(dstDate, z.name)),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const canonical = new Map();
for (const z of zones) {
  canonical.set(z.name, z.name);
  for (const alias of z.aliases) canonical.set(alias, z.name);
}

const usable = cityMapping
  // The source marks places without an ISO code as -99
  .filter((c) => /^[A-Z]{2}$/.test(c.iso2) && canonical.has(c.timezone) && c.city)
  .sort((a, b) => b.pop - a.pop);

const picked = new Map();
const add = (c) => picked.set(`${c.city}|${c.iso2}`, c);

usable.slice(0, TOP_CITIES).forEach(add);
const seen = new Map();
for (const c of usable) {
  const n = seen.get(c.iso2) ?? 0;
  if (n < PER_COUNTRY) add(c);
  seen.set(c.iso2, n + 1);
}
const missing = [];
for (const key of MUST_INCLUDE) {
  const [name, iso2] = key.split('|');
  const match = usable.find((c) => c.iso2 === iso2 && toSlug(c.city) === toSlug(name));
  if (match) add(match);
  else missing.push(key);
}
if (missing.length) console.warn('Not in the source data:', missing.join(', '));

// When two cities share a name the bigger one keeps the short slug
const slugs = new Set();
const cities = [...picked.values()]
  .sort((a, b) => b.pop - a.pop)
  .map((c) => {
    let slug = toSlug(c.city);
    if (!slug) return null;
    if (slugs.has(slug)) slug = `${slug}-${c.iso2.toLowerCase()}`;
    if (slugs.has(slug)) return null;
    slugs.add(slug);
    return [slug, c.city, c.iso2, canonical.get(c.timezone), +c.lat.toFixed(3), +c.lng.toFixed(3), Math.round(c.pop), String(c.province ?? '')];
  })
  .filter(Boolean);

const banner = '// Generated by scripts/generate-time-data.mjs. Do not edit by hand.\n';

writeFileSync(
  join(LIB, 'timezones-data.ts'),
  `${banner}// Zone data credit: https://github.com/vvo/tzdb (MIT)
import type { ZoneRecord } from './timezones';

export const ZONE_RECORDS: ZoneRecord[] = ${JSON.stringify(zones)};
`
);

writeFileSync(
  join(LIB, 'cities-data.ts'),
  `${banner}// City data credit: https://github.com/kevinroberts/city-timezones (MIT), from Natural Earth (public domain)
// [slug, name, ISO 3166-1 alpha-2, IANA zone, latitude, longitude, population, province]
export type CityRow = [string, string, string, string, number, number, number, string];

export const CITY_ROWS: CityRow[] = ${JSON.stringify(cities)};
`
);

console.log(`${zones.length} zones, ${cities.length} cities`);
