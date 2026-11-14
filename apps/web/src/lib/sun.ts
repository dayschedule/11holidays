const RAD = Math.PI / 180;
const J2000 = 2451545;
const UNIX_EPOCH_JD = 2440587.5;
const DAY_MS = 86_400_000;
/** Refraction plus the sun's radius: the sun "rises" when its centre is this far below the horizon */
const HORIZON = -0.833;
const AXIAL_TILT = 23.4397;

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  noon: Date;
  /** Daylight in minutes */
  dayLength: number;
  /** Set when the sun doesn't rise or set that day */
  polar: 'day' | 'night' | null;
}

const toDate = (julian: number) => new Date((julian - UNIX_EPOCH_JD) * DAY_MS);

/** Sunrise equation, good to a minute or two away from the poles. Date parts are the local calendar date. */
export function sunTimes(year: number, month: number, day: number, lat: number, lng: number): SunTimes {
  const julianDay = Date.UTC(year, month - 1, day, 12) / DAY_MS + UNIX_EPOCH_JD;
  const meanSolarTime = julianDay - J2000 + 0.0008 - lng / 360;

  const anomaly = ((357.5291 + 0.98560028 * meanSolarTime) % 360) * RAD;
  const center = 1.9148 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly) + 0.0003 * Math.sin(3 * anomaly);
  const longitude = ((anomaly / RAD + center + 180 + 102.9372) % 360) * RAD;

  const transit = J2000 + meanSolarTime + 0.0053 * Math.sin(anomaly) - 0.0069 * Math.sin(2 * longitude);
  const sinDeclination = Math.sin(longitude) * Math.sin(AXIAL_TILT * RAD);
  const cosDeclination = Math.cos(Math.asin(sinDeclination));

  const cosHourAngle =
    (Math.sin(HORIZON * RAD) - Math.sin(lat * RAD) * sinDeclination) / (Math.cos(lat * RAD) * cosDeclination);

  const noon = toDate(transit);
  if (cosHourAngle < -1) return { sunrise: null, sunset: null, noon, dayLength: 1440, polar: 'day' };
  if (cosHourAngle > 1) return { sunrise: null, sunset: null, noon, dayLength: 0, polar: 'night' };

  const hourAngle = Math.acos(cosHourAngle) / RAD;
  return {
    sunrise: toDate(transit - hourAngle / 360),
    sunset: toDate(transit + hourAngle / 360),
    noon,
    dayLength: Math.round((hourAngle / 180) * 1440),
    polar: null,
  };
}
