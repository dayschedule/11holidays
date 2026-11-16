import { offsetMinutes } from './time';
import { ZONE_RECORDS } from './timezones-data';

export interface ZoneRecord {
  /** IANA name, for example "America/New_York" */
  name: string;
  /** "Eastern Time" */
  label: string;
  continent: string;
  country: string;
  countryName: string;
  cities: string[];
  /** Other IANA names that keep the same time */
  aliases: string[];
  /** Standard offset in minutes */
  std: number;
  abbr: string;
  /** Empty when the zone has no daylight saving time */
  dstAbbr: string;
}

export interface Zone extends ZoneRecord {
  slug: string;
}

/** "America/New_York" -> "america-new-york" */
export const zoneSlug = (name: string) => name.toLowerCase().replace(/[/_]/g, '-');

const UTC_ZONE: ZoneRecord = {
  name: 'UTC',
  label: 'Coordinated Universal Time',
  continent: 'Global',
  country: '',
  countryName: '',
  cities: [],
  aliases: ['Etc/UTC', 'Etc/GMT', 'GMT', 'Etc/Universal', 'Etc/Zulu'],
  std: 0,
  abbr: 'UTC',
  dstAbbr: '',
};

export const ZONES: Zone[] = [UTC_ZONE, ...ZONE_RECORDS].map((z) => ({ ...z, slug: zoneSlug(z.name) }));

const bySlug = new Map(ZONES.map((z) => [z.slug, z]));
const byName = new Map(ZONES.flatMap((z) => [z.name, ...z.aliases].map((name) => [name, z] as const)));

export const getZoneBySlug = (slug: string) => bySlug.get(slug);

/** Accepts canonical names and aliases such as "Asia/Calcutta" */
export const getZone = (name: string) => byName.get(name);

/** "EST" or "EDT" for the date; empty for zones that only have a numeric abbreviation */
export const zoneAbbreviation = (zone: Zone, date: Date) => abbreviationAtOffset(zone, offsetMinutes(date, zone.name));

/** Same as zoneAbbreviation, for an offset that is already known */
export const abbreviationAtOffset = (zone: Zone, offset: number) => (offset > zone.std ? zone.dstAbbr : zone.abbr) || '';

export const ZONE_REGIONS = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'] as const;

/** Popular abbreviations and a zone that uses them; several are shared, which is why IANA names are safer */
export const ZONE_ABBREVIATIONS = [
  { abbr: 'UTC', name: 'Coordinated Universal Time', offset: 'UTC+00:00', zone: 'UTC' },
  { abbr: 'GMT', name: 'Greenwich Mean Time', offset: 'UTC+00:00', zone: 'Europe/London' },
  { abbr: 'BST', name: 'British Summer Time', offset: 'UTC+01:00', zone: 'Europe/London' },
  { abbr: 'CET', name: 'Central European Time', offset: 'UTC+01:00', zone: 'Europe/Paris' },
  { abbr: 'CEST', name: 'Central European Summer Time', offset: 'UTC+02:00', zone: 'Europe/Paris' },
  { abbr: 'EET', name: 'Eastern European Time', offset: 'UTC+02:00', zone: 'Europe/Athens' },
  { abbr: 'EEST', name: 'Eastern European Summer Time', offset: 'UTC+03:00', zone: 'Europe/Athens' },
  { abbr: 'MSK', name: 'Moscow Time', offset: 'UTC+03:00', zone: 'Europe/Moscow' },
  { abbr: 'GST', name: 'Gulf Standard Time', offset: 'UTC+04:00', zone: 'Asia/Dubai' },
  { abbr: 'PKT', name: 'Pakistan Standard Time', offset: 'UTC+05:00', zone: 'Asia/Karachi' },
  { abbr: 'IST', name: 'India Standard Time', offset: 'UTC+05:30', zone: 'Asia/Kolkata' },
  { abbr: 'SGT', name: 'Singapore Time', offset: 'UTC+08:00', zone: 'Asia/Singapore' },
  { abbr: 'JST', name: 'Japan Standard Time', offset: 'UTC+09:00', zone: 'Asia/Tokyo' },
  { abbr: 'KST', name: 'Korea Standard Time', offset: 'UTC+09:00', zone: 'Asia/Seoul' },
  { abbr: 'AEST', name: 'Australian Eastern Standard Time', offset: 'UTC+10:00', zone: 'Australia/Sydney' },
  { abbr: 'AEDT', name: 'Australian Eastern Daylight Time', offset: 'UTC+11:00', zone: 'Australia/Sydney' },
  { abbr: 'NZST', name: 'New Zealand Standard Time', offset: 'UTC+12:00', zone: 'Pacific/Auckland' },
  { abbr: 'NZDT', name: 'New Zealand Daylight Time', offset: 'UTC+13:00', zone: 'Pacific/Auckland' },
  { abbr: 'HST', name: 'Hawaii Standard Time', offset: 'UTC-10:00', zone: 'Pacific/Honolulu' },
  { abbr: 'AKST', name: 'Alaska Standard Time', offset: 'UTC-09:00', zone: 'America/Anchorage' },
  { abbr: 'PST', name: 'Pacific Standard Time', offset: 'UTC-08:00', zone: 'America/Los_Angeles' },
  { abbr: 'PDT', name: 'Pacific Daylight Time', offset: 'UTC-07:00', zone: 'America/Los_Angeles' },
  { abbr: 'MST', name: 'Mountain Standard Time', offset: 'UTC-07:00', zone: 'America/Denver' },
  { abbr: 'MDT', name: 'Mountain Daylight Time', offset: 'UTC-06:00', zone: 'America/Denver' },
  { abbr: 'CST', name: 'Central Standard Time', offset: 'UTC-06:00', zone: 'America/Chicago' },
  { abbr: 'CDT', name: 'Central Daylight Time', offset: 'UTC-05:00', zone: 'America/Chicago' },
  { abbr: 'EST', name: 'Eastern Standard Time', offset: 'UTC-05:00', zone: 'America/New_York' },
  { abbr: 'EDT', name: 'Eastern Daylight Time', offset: 'UTC-04:00', zone: 'America/New_York' },
] as const;
