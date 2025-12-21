export interface Holiday {
  date: string;
  name: string;
  type: string;
  localName?: string;
  countryCode: string;
}

export interface HolidaysResponse {
  holidays: Holiday[];
  country: string;
  year: number;
}

export async function fetchHolidays(
  countryCode: string,
  year: number
): Promise<HolidaysResponse> {
  const mockHolidays: Record<string, Holiday[]> = {
    US: [
      { date: `${year}-01-01`, name: "New Year's Day", type: "Public", countryCode: "US" },
      { date: `${year}-01-15`, name: "Martin Luther King Jr. Day", type: "Public", countryCode: "US" },
      { date: `${year}-02-19`, name: "Presidents' Day", type: "Public", countryCode: "US" },
      { date: `${year}-05-27`, name: "Memorial Day", type: "Public", countryCode: "US" },
      { date: `${year}-06-19`, name: "Juneteenth", type: "Public", countryCode: "US" },
      { date: `${year}-07-04`, name: "Independence Day", type: "Public", countryCode: "US" },
      { date: `${year}-09-02`, name: "Labor Day", type: "Public", countryCode: "US" },
      { date: `${year}-10-14`, name: "Columbus Day", type: "Public", countryCode: "US" },
      { date: `${year}-11-11`, name: "Veterans Day", type: "Public", countryCode: "US" },
      { date: `${year}-11-28`, name: "Thanksgiving", type: "Public", countryCode: "US" },
      { date: `${year}-12-25`, name: "Christmas Day", type: "Public", countryCode: "US" },
    ],
    GB: [
      { date: `${year}-01-01`, name: "New Year's Day", type: "Public", countryCode: "GB" },
      { date: `${year}-04-07`, name: "Good Friday", type: "Public", countryCode: "GB" },
      { date: `${year}-04-10`, name: "Easter Monday", type: "Public", countryCode: "GB" },
      { date: `${year}-05-06`, name: "Early May Bank Holiday", type: "Public", countryCode: "GB" },
      { date: `${year}-05-27`, name: "Spring Bank Holiday", type: "Public", countryCode: "GB" },
      { date: `${year}-08-26`, name: "Summer Bank Holiday", type: "Public", countryCode: "GB" },
      { date: `${year}-12-25`, name: "Christmas Day", type: "Public", countryCode: "GB" },
      { date: `${year}-12-26`, name: "Boxing Day", type: "Public", countryCode: "GB" },
    ],
    CA: [
      { date: `${year}-01-01`, name: "New Year's Day", type: "Public", countryCode: "CA" },
      { date: `${year}-04-07`, name: "Good Friday", type: "Public", countryCode: "CA" },
      { date: `${year}-05-20`, name: "Victoria Day", type: "Public", countryCode: "CA" },
      { date: `${year}-07-01`, name: "Canada Day", type: "Public", countryCode: "CA" },
      { date: `${year}-09-02`, name: "Labour Day", type: "Public", countryCode: "CA" },
      { date: `${year}-10-14`, name: "Thanksgiving", type: "Public", countryCode: "CA" },
      { date: `${year}-12-25`, name: "Christmas Day", type: "Public", countryCode: "CA" },
      { date: `${year}-12-26`, name: "Boxing Day", type: "Public", countryCode: "CA" },
    ],
  };

  const holidays = mockHolidays[countryCode.toUpperCase()] || [];

  return {
    holidays: holidays.sort((a, b) => a.date.localeCompare(b.date)),
    country: countryCode.toUpperCase(),
    year,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
}

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
