import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

const DEFAULT_COUNTRY = 'US';

// IANA time zone -> ISO 3166-1 alpha-2, from tzdata zone.tab plus common legacy aliases
const ZONES: Record<string, string> = {
  'Europe/Andorra': 'AD', 'Asia/Dubai': 'AE', 'Asia/Kabul': 'AF', 'America/Antigua': 'AG', 'America/Anguilla': 'AI',
  'Europe/Tirane': 'AL', 'Asia/Yerevan': 'AM', 'Africa/Luanda': 'AO', 'Antarctica/McMurdo': 'AQ',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Argentina/Cordoba': 'AR', 'America/Argentina/Salta': 'AR',
  'America/Argentina/Jujuy': 'AR', 'America/Argentina/Tucuman': 'AR', 'America/Argentina/Catamarca': 'AR',
  'America/Argentina/La_Rioja': 'AR', 'America/Argentina/San_Juan': 'AR', 'America/Argentina/Mendoza': 'AR',
  'America/Argentina/San_Luis': 'AR', 'America/Argentina/Rio_Gallegos': 'AR', 'America/Argentina/Ushuaia': 'AR',
  'America/Buenos_Aires': 'AR', 'America/Cordoba': 'AR', 'Pacific/Pago_Pago': 'AS', 'Europe/Vienna': 'AT',
  'Australia/Lord_Howe': 'AU', 'Australia/Hobart': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Sydney': 'AU',
  'Australia/Broken_Hill': 'AU', 'Australia/Brisbane': 'AU', 'Australia/Lindeman': 'AU', 'Australia/Adelaide': 'AU',
  'Australia/Darwin': 'AU', 'Australia/Perth': 'AU', 'Australia/Eucla': 'AU', 'Australia/Canberra': 'AU',
  'Australia/ACT': 'AU', 'Australia/NSW': 'AU', 'Australia/Victoria': 'AU', 'Australia/Queensland': 'AU',
  'America/Aruba': 'AW', 'Europe/Mariehamn': 'AX', 'Asia/Baku': 'AZ', 'Europe/Sarajevo': 'BA', 'America/Barbados': 'BB',
  'Asia/Dhaka': 'BD', 'Asia/Dacca': 'BD', 'Europe/Brussels': 'BE', 'Africa/Ouagadougou': 'BF', 'Europe/Sofia': 'BG',
  'Asia/Bahrain': 'BH', 'Africa/Bujumbura': 'BI', 'Africa/Porto-Novo': 'BJ', 'America/St_Barthelemy': 'BL',
  'Atlantic/Bermuda': 'BM', 'Asia/Brunei': 'BN', 'America/La_Paz': 'BO', 'America/Kralendijk': 'BQ',
  'America/Noronha': 'BR', 'America/Belem': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR',
  'America/Araguaina': 'BR', 'America/Maceio': 'BR', 'America/Bahia': 'BR', 'America/Sao_Paulo': 'BR',
  'America/Campo_Grande': 'BR', 'America/Cuiaba': 'BR', 'America/Santarem': 'BR', 'America/Porto_Velho': 'BR',
  'America/Boa_Vista': 'BR', 'America/Manaus': 'BR', 'America/Eirunepe': 'BR', 'America/Rio_Branco': 'BR',
  'America/Nassau': 'BS', 'Asia/Thimphu': 'BT', 'Asia/Thimbu': 'BT', 'Africa/Gaborone': 'BW', 'Europe/Minsk': 'BY',
  'America/Belize': 'BZ', 'America/St_Johns': 'CA', 'America/Halifax': 'CA', 'America/Glace_Bay': 'CA',
  'America/Moncton': 'CA', 'America/Goose_Bay': 'CA', 'America/Toronto': 'CA', 'America/Montreal': 'CA',
  'America/Iqaluit': 'CA', 'America/Winnipeg': 'CA', 'America/Resolute': 'CA', 'America/Rankin_Inlet': 'CA',
  'America/Regina': 'CA', 'America/Swift_Current': 'CA', 'America/Edmonton': 'CA', 'America/Cambridge_Bay': 'CA',
  'America/Inuvik': 'CA', 'America/Dawson_Creek': 'CA', 'America/Fort_Nelson': 'CA', 'America/Whitehorse': 'CA',
  'America/Dawson': 'CA', 'America/Vancouver': 'CA', 'America/Atikokan': 'CA', 'America/Blanc-Sablon': 'CA',
  'America/Creston': 'CA', 'Indian/Cocos': 'CC', 'Africa/Kinshasa': 'CD', 'Africa/Lubumbashi': 'CD',
  'Africa/Bangui': 'CF', 'Africa/Brazzaville': 'CG', 'Europe/Zurich': 'CH', 'Africa/Abidjan': 'CI',
  'Pacific/Rarotonga': 'CK', 'America/Santiago': 'CL', 'America/Punta_Arenas': 'CL', 'Pacific/Easter': 'CL',
  'Africa/Douala': 'CM', 'Asia/Shanghai': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Chongqing': 'CN', 'Asia/Harbin': 'CN',
  'PRC': 'CN', 'America/Bogota': 'CO', 'America/Costa_Rica': 'CR', 'America/Havana': 'CU', 'Cuba': 'CU',
  'Atlantic/Cape_Verde': 'CV', 'America/Curacao': 'CW', 'Indian/Christmas': 'CX', 'Asia/Nicosia': 'CY',
  'Asia/Famagusta': 'CY', 'Europe/Nicosia': 'CY', 'Europe/Prague': 'CZ', 'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE',
  'Africa/Djibouti': 'DJ', 'Europe/Copenhagen': 'DK', 'America/Dominica': 'DM', 'America/Santo_Domingo': 'DO',
  'Africa/Algiers': 'DZ', 'America/Guayaquil': 'EC', 'Pacific/Galapagos': 'EC', 'Europe/Tallinn': 'EE',
  'Africa/Cairo': 'EG', 'Egypt': 'EG', 'Africa/El_Aaiun': 'EH', 'Africa/Asmara': 'ER', 'Europe/Madrid': 'ES',
  'Africa/Ceuta': 'ES', 'Atlantic/Canary': 'ES', 'Africa/Addis_Ababa': 'ET', 'Europe/Helsinki': 'FI',
  'Pacific/Fiji': 'FJ', 'Atlantic/Stanley': 'FK', 'Pacific/Chuuk': 'FM', 'Pacific/Pohnpei': 'FM', 'Pacific/Kosrae': 'FM',
  'Atlantic/Faroe': 'FO', 'Europe/Paris': 'FR', 'Africa/Libreville': 'GA', 'Europe/London': 'GB', 'Europe/Belfast': 'GB',
  'GB': 'GB', 'America/Grenada': 'GD', 'Asia/Tbilisi': 'GE', 'America/Cayenne': 'GF', 'Europe/Guernsey': 'GG',
  'Africa/Accra': 'GH', 'Europe/Gibraltar': 'GI', 'America/Nuuk': 'GL', 'America/Godthab': 'GL',
  'America/Danmarkshavn': 'GL', 'America/Scoresbysund': 'GL', 'America/Thule': 'GL', 'Africa/Banjul': 'GM',
  'Africa/Conakry': 'GN', 'America/Guadeloupe': 'GP', 'Africa/Malabo': 'GQ', 'Europe/Athens': 'GR',
  'Atlantic/South_Georgia': 'GS', 'America/Guatemala': 'GT', 'Pacific/Guam': 'GU', 'Africa/Bissau': 'GW',
  'America/Guyana': 'GY', 'Asia/Hong_Kong': 'HK', 'Hongkong': 'HK', 'America/Tegucigalpa': 'HN', 'Europe/Zagreb': 'HR',
  'America/Port-au-Prince': 'HT', 'Europe/Budapest': 'HU', 'Asia/Jakarta': 'ID', 'Asia/Pontianak': 'ID',
  'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID', 'Europe/Dublin': 'IE', 'Eire': 'IE', 'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL', 'Israel': 'IL', 'Europe/Isle_of_Man': 'IM', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Indian/Chagos': 'IO', 'Asia/Baghdad': 'IQ', 'Asia/Tehran': 'IR', 'Iran': 'IR', 'Atlantic/Reykjavik': 'IS',
  'Iceland': 'IS', 'Europe/Rome': 'IT', 'Europe/Jersey': 'JE', 'America/Jamaica': 'JM', 'Jamaica': 'JM',
  'Asia/Amman': 'JO', 'Asia/Tokyo': 'JP', 'Japan': 'JP', 'Africa/Nairobi': 'KE', 'Asia/Bishkek': 'KG',
  'Asia/Phnom_Penh': 'KH', 'Pacific/Tarawa': 'KI', 'Pacific/Kanton': 'KI', 'Pacific/Enderbury': 'KI',
  'Pacific/Kiritimati': 'KI', 'Indian/Comoro': 'KM', 'America/St_Kitts': 'KN', 'Asia/Pyongyang': 'KP',
  'Asia/Seoul': 'KR', 'ROK': 'KR', 'Asia/Kuwait': 'KW', 'America/Cayman': 'KY', 'Asia/Almaty': 'KZ',
  'Asia/Qyzylorda': 'KZ', 'Asia/Qostanay': 'KZ', 'Asia/Aqtobe': 'KZ', 'Asia/Aqtau': 'KZ', 'Asia/Atyrau': 'KZ',
  'Asia/Oral': 'KZ', 'Asia/Vientiane': 'LA', 'Asia/Beirut': 'LB', 'America/St_Lucia': 'LC', 'Europe/Vaduz': 'LI',
  'Asia/Colombo': 'LK', 'Africa/Monrovia': 'LR', 'Africa/Maseru': 'LS', 'Europe/Vilnius': 'LT',
  'Europe/Luxembourg': 'LU', 'Europe/Riga': 'LV', 'Africa/Tripoli': 'LY', 'Libya': 'LY', 'Africa/Casablanca': 'MA',
  'Europe/Monaco': 'MC', 'Europe/Chisinau': 'MD', 'Europe/Tiraspol': 'MD', 'Europe/Podgorica': 'ME',
  'America/Marigot': 'MF', 'Indian/Antananarivo': 'MG', 'Pacific/Majuro': 'MH', 'Pacific/Kwajalein': 'MH',
  'Europe/Skopje': 'MK', 'Africa/Bamako': 'ML', 'Asia/Yangon': 'MM', 'Asia/Rangoon': 'MM', 'Asia/Ulaanbaatar': 'MN',
  'Asia/Ulan_Bator': 'MN', 'Asia/Hovd': 'MN', 'Asia/Choibalsan': 'MN', 'Asia/Macau': 'MO', 'Asia/Macao': 'MO',
  'Pacific/Saipan': 'MP', 'America/Martinique': 'MQ', 'Africa/Nouakchott': 'MR', 'America/Montserrat': 'MS',
  'Europe/Malta': 'MT', 'Indian/Mauritius': 'MU', 'Indian/Maldives': 'MV', 'Africa/Blantyre': 'MW',
  'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'America/Merida': 'MX', 'America/Monterrey': 'MX',
  'America/Matamoros': 'MX', 'America/Chihuahua': 'MX', 'America/Ciudad_Juarez': 'MX', 'America/Ojinaga': 'MX',
  'America/Mazatlan': 'MX', 'America/Bahia_Banderas': 'MX', 'America/Hermosillo': 'MX', 'America/Tijuana': 'MX',
  'America/Ensenada': 'MX', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Africa/Maputo': 'MZ',
  'Africa/Windhoek': 'NA', 'Pacific/Noumea': 'NC', 'Africa/Niamey': 'NE', 'Pacific/Norfolk': 'NF', 'Africa/Lagos': 'NG',
  'America/Managua': 'NI', 'Europe/Amsterdam': 'NL', 'Europe/Oslo': 'NO', 'Asia/Kathmandu': 'NP',
  'Asia/Katmandu': 'NP', 'Pacific/Nauru': 'NR', 'Pacific/Niue': 'NU', 'Pacific/Auckland': 'NZ',
  'Pacific/Chatham': 'NZ', 'NZ': 'NZ', 'Asia/Muscat': 'OM', 'America/Panama': 'PA', 'America/Lima': 'PE',
  'Pacific/Tahiti': 'PF', 'Pacific/Marquesas': 'PF', 'Pacific/Gambier': 'PF', 'Pacific/Port_Moresby': 'PG',
  'Pacific/Bougainville': 'PG', 'Asia/Manila': 'PH', 'Asia/Karachi': 'PK', 'Europe/Warsaw': 'PL', 'Poland': 'PL',
  'America/Miquelon': 'PM', 'Pacific/Pitcairn': 'PN', 'America/Puerto_Rico': 'PR', 'Asia/Gaza': 'PS',
  'Asia/Hebron': 'PS', 'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT', 'Portugal': 'PT',
  'Pacific/Palau': 'PW', 'America/Asuncion': 'PY', 'Asia/Qatar': 'QA', 'Indian/Reunion': 'RE',
  'Europe/Bucharest': 'RO', 'Europe/Belgrade': 'RS', 'Europe/Kaliningrad': 'RU', 'Europe/Moscow': 'RU',
  'Europe/Kirov': 'RU', 'Europe/Volgograd': 'RU', 'Europe/Astrakhan': 'RU', 'Europe/Saratov': 'RU',
  'Europe/Ulyanovsk': 'RU', 'Europe/Samara': 'RU', 'Asia/Yekaterinburg': 'RU', 'Asia/Omsk': 'RU',
  'Asia/Novosibirsk': 'RU', 'Asia/Barnaul': 'RU', 'Asia/Tomsk': 'RU', 'Asia/Novokuznetsk': 'RU',
  'Asia/Krasnoyarsk': 'RU', 'Asia/Irkutsk': 'RU', 'Asia/Chita': 'RU', 'Asia/Yakutsk': 'RU', 'Asia/Khandyga': 'RU',
  'Asia/Vladivostok': 'RU', 'Asia/Ust-Nera': 'RU', 'Asia/Magadan': 'RU', 'Asia/Sakhalin': 'RU',
  'Asia/Srednekolymsk': 'RU', 'Asia/Kamchatka': 'RU', 'Asia/Anadyr': 'RU', 'W-SU': 'RU', 'Africa/Kigali': 'RW',
  'Asia/Riyadh': 'SA', 'Pacific/Guadalcanal': 'SB', 'Indian/Mahe': 'SC', 'Africa/Khartoum': 'SD',
  'Europe/Stockholm': 'SE', 'Asia/Singapore': 'SG', 'Singapore': 'SG', 'Atlantic/St_Helena': 'SH',
  'Europe/Ljubljana': 'SI', 'Arctic/Longyearbyen': 'SJ', 'Europe/Bratislava': 'SK', 'Africa/Freetown': 'SL',
  'Europe/San_Marino': 'SM', 'Africa/Dakar': 'SN', 'Africa/Mogadishu': 'SO', 'America/Paramaribo': 'SR',
  'Africa/Juba': 'SS', 'Africa/Sao_Tome': 'ST', 'America/El_Salvador': 'SV', 'America/Lower_Princes': 'SX',
  'Asia/Damascus': 'SY', 'Africa/Mbabane': 'SZ', 'America/Grand_Turk': 'TC', 'Africa/Ndjamena': 'TD',
  'Indian/Kerguelen': 'TF', 'Africa/Lome': 'TG', 'Asia/Bangkok': 'TH', 'Asia/Dushanbe': 'TJ', 'Pacific/Fakaofo': 'TK',
  'Asia/Dili': 'TL', 'Asia/Ashgabat': 'TM', 'Asia/Ashkhabad': 'TM', 'Africa/Tunis': 'TN', 'Pacific/Tongatapu': 'TO',
  'Europe/Istanbul': 'TR', 'Asia/Istanbul': 'TR', 'Turkey': 'TR', 'America/Port_of_Spain': 'TT',
  'Pacific/Funafuti': 'TV', 'Asia/Taipei': 'TW', 'ROC': 'TW', 'Africa/Dar_es_Salaam': 'TZ', 'Europe/Kyiv': 'UA',
  'Europe/Kiev': 'UA', 'Europe/Simferopol': 'UA', 'Europe/Uzhgorod': 'UA', 'Europe/Zaporozhye': 'UA',
  'Africa/Kampala': 'UG', 'Pacific/Midway': 'UM', 'Pacific/Wake': 'UM', 'America/New_York': 'US',
  'America/Detroit': 'US', 'America/Kentucky/Louisville': 'US', 'America/Kentucky/Monticello': 'US',
  'America/Louisville': 'US', 'America/Indiana/Indianapolis': 'US', 'America/Indianapolis': 'US',
  'America/Indiana/Vincennes': 'US', 'America/Indiana/Winamac': 'US', 'America/Indiana/Marengo': 'US',
  'America/Indiana/Petersburg': 'US', 'America/Indiana/Vevay': 'US', 'America/Indiana/Tell_City': 'US',
  'America/Indiana/Knox': 'US', 'America/Chicago': 'US', 'America/Menominee': 'US',
  'America/North_Dakota/Center': 'US', 'America/North_Dakota/New_Salem': 'US', 'America/North_Dakota/Beulah': 'US',
  'America/Denver': 'US', 'America/Boise': 'US', 'America/Phoenix': 'US', 'America/Los_Angeles': 'US',
  'America/Anchorage': 'US', 'America/Juneau': 'US', 'America/Sitka': 'US', 'America/Metlakatla': 'US',
  'America/Yakutat': 'US', 'America/Nome': 'US', 'America/Adak': 'US', 'Pacific/Honolulu': 'US',
  'US/Eastern': 'US', 'US/Central': 'US', 'US/Mountain': 'US', 'US/Pacific': 'US', 'US/Alaska': 'US',
  'US/Hawaii': 'US', 'US/Arizona': 'US', 'America/Montevideo': 'UY', 'Asia/Samarkand': 'UZ', 'Asia/Tashkent': 'UZ',
  'Europe/Vatican': 'VA', 'America/St_Vincent': 'VC', 'America/Caracas': 'VE', 'America/Tortola': 'VG',
  'America/St_Thomas': 'VI', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Pacific/Efate': 'VU',
  'Pacific/Wallis': 'WF', 'Pacific/Apia': 'WS', 'Asia/Aden': 'YE', 'Indian/Mayotte': 'YT',
  'Africa/Johannesburg': 'ZA', 'Africa/Lusaka': 'ZM', 'Africa/Harare': 'ZW',
};

/**
 * Visitor's country guessed from the browser time zone. The server has no way to know it, so
 * during SSR (and for unknown zones) this is the US.
 */
export function getVisitorCountry(): string {
  if (typeof window === 'undefined') return DEFAULT_COUNTRY;
  try {
    return ZONES[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? DEFAULT_COUNTRY;
  } catch {
    return DEFAULT_COUNTRY;
  }
}

/**
 * Pages are server-rendered for the default country. After hydration, reload the route's data
 * if the visitor's time zone points to a different one.
 */
export function useVisitorCountry(code: string, enabled = true) {
  const router = useRouter();
  useEffect(() => {
    if (enabled && getVisitorCountry() !== code) router.invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
