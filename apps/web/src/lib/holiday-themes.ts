/**
 * Visual themes for popular holidays. A theme is picked by matching the
 * holiday name (and optionally the country) so detail pages, cards and
 * calendars can feel like the festival they represent.
 */

export type ParticleMotion = 'rise' | 'fall' | 'twinkle';

export interface HolidayTheme {
  key: string;
  label: string;
  /** Hero background (CSS background value) */
  background: string;
  /** Text color used on top of the hero background */
  ink: string;
  /** Accent used for chips, buttons and calendar highlights */
  accent: string;
  /** Soft tint used for cards on the page */
  tint: string;
  particles: string[];
  motion: ParticleMotion;
  greeting: string;
  traditions: string[];
}

interface ThemeRule {
  match: RegExp;
  countries?: string[];
  theme: HolidayTheme;
}

const diwali: HolidayTheme = {
  key: 'diwali',
  label: 'Festival of Lights',
  background:
    'radial-gradient(ellipse at 20% 0%, #ffb347 0%, transparent 55%), radial-gradient(ellipse at 90% 30%, #ff5e62 0%, transparent 50%), linear-gradient(160deg, #3a0d4f 0%, #1b0b2e 60%, #120720 100%)',
  ink: '#fff7e6',
  accent: '#ffb000',
  tint: 'rgba(255, 176, 0, 0.10)',
  particles: ['🪔', '✨', '🎆', '🪔', '✨', '🌟'],
  motion: 'rise',
  greeting: 'Wishing you a bright and joyful Diwali!',
  traditions: [
    'Lighting diyas and candles to welcome prosperity',
    'Drawing colourful rangoli at the entrance',
    'Lakshmi puja in the evening',
    'Sharing sweets and gifts with family and friends',
  ],
};

const christmas: HolidayTheme = {
  key: 'christmas',
  label: 'Season of Joy',
  background:
    'radial-gradient(ellipse at 80% -10%, rgba(255,255,255,0.18) 0%, transparent 50%), linear-gradient(160deg, #0f5132 0%, #0b3d2e 45%, #7f1d1d 100%)',
  ink: '#f8fafc',
  accent: '#ef4444',
  tint: 'rgba(22, 101, 52, 0.10)',
  particles: ['❄️', '❅', '🎄', '❆', '🎁', '⭐'],
  motion: 'fall',
  greeting: 'Merry Christmas and happy holidays!',
  traditions: [
    'Decorating the Christmas tree',
    'Exchanging gifts with loved ones',
    'Christmas carols and midnight mass',
    'A festive family dinner',
  ],
};

const newYear: HolidayTheme = {
  key: 'new-year',
  label: 'Fresh Start',
  background:
    'radial-gradient(ellipse at 15% 10%, rgba(250,204,21,0.35) 0%, transparent 45%), radial-gradient(ellipse at 85% 20%, rgba(168,85,247,0.45) 0%, transparent 50%), linear-gradient(170deg, #111827 0%, #1e1b4b 60%, #0f172a 100%)',
  ink: '#fefce8',
  accent: '#facc15',
  tint: 'rgba(250, 204, 21, 0.10)',
  particles: ['🎆', '🎇', '✨', '🥂', '🎉', '⭐'],
  motion: 'twinkle',
  greeting: 'Happy New Year! Here’s to new beginnings.',
  traditions: [
    'Countdown to midnight and fireworks',
    'Making new year resolutions',
    'Celebrating with friends and family',
  ],
};

const lunarNewYear: HolidayTheme = {
  key: 'lunar-new-year',
  label: 'Spring Festival',
  background:
    'radial-gradient(ellipse at 80% 0%, rgba(253,224,71,0.35) 0%, transparent 50%), linear-gradient(160deg, #b91c1c 0%, #7f1d1d 70%, #450a0a 100%)',
  ink: '#fff7ed',
  accent: '#fbbf24',
  tint: 'rgba(220, 38, 38, 0.10)',
  particles: ['🏮', '🧧', '🎆', '🏮', '✨', '🐉'],
  motion: 'twinkle',
  greeting: 'Wishing you luck and prosperity this Lunar New Year!',
  traditions: [
    'Red envelopes (hongbao) for good fortune',
    'Family reunion dinner on New Year’s Eve',
    'Lion and dragon dances',
    'Lantern decorations',
  ],
};

const holi: HolidayTheme = {
  key: 'holi',
  label: 'Festival of Colours',
  background:
    'radial-gradient(circle at 15% 25%, #f472b6 0%, transparent 35%), radial-gradient(circle at 80% 20%, #facc15 0%, transparent 35%), radial-gradient(circle at 60% 85%, #22d3ee 0%, transparent 40%), radial-gradient(circle at 25% 85%, #a855f7 0%, transparent 35%), linear-gradient(135deg, #fb7185, #f97316)',
  ink: '#ffffff',
  accent: '#db2777',
  tint: 'rgba(219, 39, 119, 0.08)',
  particles: ['🎨', '💗', '💛', '💚', '💙', '💜'],
  motion: 'rise',
  greeting: 'Happy Holi! May your life be full of colour.',
  traditions: [
    'Holika Dahan bonfire on the eve',
    'Playing with gulal and coloured water',
    'Sharing gujiya and thandai',
  ],
};

const eid: HolidayTheme = {
  key: 'eid',
  label: 'Celebration of Faith',
  background:
    'radial-gradient(ellipse at 85% 10%, rgba(253,230,138,0.35) 0%, transparent 45%), linear-gradient(165deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
  ink: '#ecfdf5',
  accent: '#fbbf24',
  tint: 'rgba(5, 150, 105, 0.10)',
  particles: ['🌙', '⭐', '✨', '🕌', '⭐', '🌙'],
  motion: 'twinkle',
  greeting: 'Eid Mubarak! Wishing you peace and happiness.',
  traditions: [
    'Special Eid prayers in the morning',
    'Giving to charity (zakat / sadaqah)',
    'Visiting family and sharing festive meals',
    'Gifts and eidi for children',
  ],
};

const ramadan: HolidayTheme = {
  ...eid,
  key: 'ramadan',
  label: 'Holy Month',
  greeting: 'Ramadan Kareem!',
  traditions: [
    'Fasting from dawn to sunset',
    'Iftar meals with family and community',
    'Night prayers (taraweeh)',
  ],
};

const easter: HolidayTheme = {
  key: 'easter',
  label: 'Spring & Renewal',
  background:
    'radial-gradient(circle at 20% 20%, #fde68a 0%, transparent 40%), radial-gradient(circle at 80% 30%, #c4b5fd 0%, transparent 40%), radial-gradient(circle at 50% 90%, #a7f3d0 0%, transparent 45%), linear-gradient(135deg, #fbcfe8, #ddd6fe)',
  ink: '#3b0764',
  accent: '#8b5cf6',
  tint: 'rgba(139, 92, 246, 0.08)',
  particles: ['🥚', '🐣', '🌷', '🐰', '🌼', '🥚'],
  motion: 'rise',
  greeting: 'Happy Easter!',
  traditions: [
    'Easter egg hunts and painting eggs',
    'Church services and sunrise gatherings',
    'Family brunch',
  ],
};

const halloween: HolidayTheme = {
  key: 'halloween',
  label: 'Spooky Season',
  background:
    'radial-gradient(circle at 80% 15%, #fde68a 0%, #f59e0b 6%, transparent 7%), linear-gradient(170deg, #1c1917 0%, #431407 60%, #7c2d12 100%)',
  ink: '#ffedd5',
  accent: '#f97316',
  tint: 'rgba(249, 115, 22, 0.10)',
  particles: ['🎃', '🦇', '👻', '🕸️', '🍬', '🦇'],
  motion: 'fall',
  greeting: 'Happy Halloween! Trick or treat?',
  traditions: ['Carving jack-o’-lanterns', 'Costumes and trick-or-treating', 'Haunted houses'],
};

const thanksgiving: HolidayTheme = {
  key: 'thanksgiving',
  label: 'Grateful Harvest',
  background:
    'radial-gradient(ellipse at 15% 0%, rgba(253,186,116,0.5) 0%, transparent 50%), linear-gradient(160deg, #9a3412 0%, #78350f 60%, #451a03 100%)',
  ink: '#fff7ed',
  accent: '#f59e0b',
  tint: 'rgba(180, 83, 9, 0.10)',
  particles: ['🍂', '🍁', '🦃', '🥧', '🍂', '🌽'],
  motion: 'fall',
  greeting: 'Happy Thanksgiving! Grateful for you.',
  traditions: ['Turkey dinner with family', 'Sharing what we’re thankful for', 'Parades and football'],
};

const valentine: HolidayTheme = {
  key: 'valentine',
  label: 'Day of Love',
  background:
    'radial-gradient(circle at 20% 20%, #fecdd3 0%, transparent 40%), linear-gradient(140deg, #e11d48 0%, #be123c 50%, #881337 100%)',
  ink: '#fff1f2',
  accent: '#fb7185',
  tint: 'rgba(225, 29, 72, 0.08)',
  particles: ['❤️', '💕', '💖', '🌹', '💘', '💗'],
  motion: 'rise',
  greeting: 'Happy Valentine’s Day!',
  traditions: ['Cards and flowers', 'Romantic dinners', 'Chocolates and gifts'],
};

const hanukkah: HolidayTheme = {
  key: 'hanukkah',
  label: 'Festival of Lights',
  background:
    'radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.35) 0%, transparent 50%), linear-gradient(165deg, #1e3a8a 0%, #172554 70%, #0b1437 100%)',
  ink: '#eff6ff',
  accent: '#facc15',
  tint: 'rgba(37, 99, 235, 0.10)',
  particles: ['🕎', '✡️', '✨', '🕯️', '⭐', '✨'],
  motion: 'twinkle',
  greeting: 'Happy Hanukkah!',
  traditions: ['Lighting the menorah for eight nights', 'Playing dreidel', 'Latkes and sufganiyot'],
};

const navratri: HolidayTheme = {
  key: 'navratri',
  label: 'Nine Nights',
  background:
    'radial-gradient(circle at 80% 10%, #fde047 0%, transparent 40%), linear-gradient(150deg, #be123c 0%, #c2410c 55%, #7c2d12 100%)',
  ink: '#fff7ed',
  accent: '#fde047',
  tint: 'rgba(234, 88, 12, 0.10)',
  particles: ['🪔', '🌺', '✨', '🔱', '🌼', '🪘'],
  motion: 'rise',
  greeting: 'Wishing you a blessed festive season!',
  traditions: ['Garba and dandiya nights', 'Fasting and prayers', 'Durga puja pandals'],
};

const ganesh: HolidayTheme = {
  ...navratri,
  key: 'ganesh',
  label: 'Ganesh Utsav',
  particles: ['🐘', '🌺', '🪔', '🌼', '✨', '🪘'],
  greeting: 'Ganpati Bappa Morya!',
  traditions: ['Installing Ganesha idols', 'Modak offerings', 'Visarjan processions'],
};

const stPatrick: HolidayTheme = {
  key: 'st-patrick',
  label: 'Luck of the Irish',
  background:
    'radial-gradient(circle at 80% 15%, #bbf7d0 0%, transparent 40%), linear-gradient(150deg, #15803d 0%, #166534 60%, #14532d 100%)',
  ink: '#f0fdf4',
  accent: '#facc15',
  tint: 'rgba(22, 163, 74, 0.10)',
  particles: ['☘️', '🍀', '🌈', '🪙', '☘️', '🍀'],
  motion: 'fall',
  greeting: 'Happy St. Patrick’s Day!',
  traditions: ['Wearing green', 'Parades', 'Irish music and dancing'],
};

const mothersDay: HolidayTheme = {
  key: 'mothers-day',
  label: 'For Mom',
  background:
    'radial-gradient(circle at 25% 20%, #fbcfe8 0%, transparent 45%), linear-gradient(140deg, #f9a8d4 0%, #f472b6 50%, #db2777 100%)',
  ink: '#500724',
  accent: '#be185d',
  tint: 'rgba(219, 39, 119, 0.08)',
  particles: ['💐', '🌸', '💗', '🌷', '🌸', '💝'],
  motion: 'rise',
  greeting: 'Happy Mother’s Day!',
  traditions: ['Flowers and cards', 'Breakfast in bed', 'Family time'],
};

const labour: HolidayTheme = {
  key: 'labour',
  label: 'Workers’ Day',
  background:
    'radial-gradient(circle at 85% 15%, rgba(254,215,170,0.45) 0%, transparent 45%), linear-gradient(150deg, #1d4ed8 0%, #1e3a8a 60%, #172554 100%)',
  ink: '#eff6ff',
  accent: '#f97316',
  tint: 'rgba(29, 78, 216, 0.08)',
  particles: ['🛠️', '⚙️', '✊', '🌟', '⚙️', '🛠️'],
  motion: 'twinkle',
  greeting: 'Happy Labour Day!',
  traditions: ['A well-deserved day off', 'Parades and rallies', 'Picnics and barbecues'],
};

/** Generic "national" palette, optionally overridden with flag colors per country. */
function nationalTheme(colors: [string, string, string], ink = '#ffffff'): HolidayTheme {
  return {
    key: 'national',
    label: 'National Pride',
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 30%, ${colors[1]} 30%, ${colors[1]} 62%, ${colors[2]} 62%, ${colors[2]} 100%)`,
    ink,
    accent: colors[0],
    tint: 'rgba(100, 116, 139, 0.08)',
    particles: ['🎉', '✨', '🎆', '🎊', '⭐', '🎇'],
    motion: 'twinkle',
    greeting: 'Celebrating the nation with pride!',
    traditions: ['Flag hoisting ceremonies', 'Parades and cultural programs', 'Fireworks'],
  };
}

const FLAG_COLORS: Record<string, [string, string, string]> = {
  IN: ['#FF9933', '#1f2a6b', '#138808'],
  US: ['#B22234', '#1e2a5a', '#3C3B6E'],
  FR: ['#0055A4', '#334155', '#EF4135'],
  MX: ['#006847', '#334155', '#CE1126'],
  BR: ['#009C3B', '#1e3a8a', '#d4a106'],
  PK: ['#01411C', '#14532d', '#0f3d1e'],
  BD: ['#006A4E', '#0b4f3a', '#c8102e'],
  ID: ['#CE1126', '#991b1b', '#7f1d1d'],
  PH: ['#0038A8', '#1e293b', '#CE1126'],
  NG: ['#008751', '#14532d', '#008751'],
  KE: ['#006600', '#111827', '#BB0000'],
  GH: ['#CE1126', '#b38600', '#006B3F'],
  ZA: ['#007A4D', '#1e293b', '#DE3831'],
  CA: ['#D80621', '#991b1b', '#7f1d1d'],
  AU: ['#012169', '#1e3a8a', '#E4002B'],
  DE: ['#1f1f1f', '#DD0000', '#b38600'],
  IT: ['#009246', '#334155', '#CE2B37'],
  IE: ['#169B62', '#334155', '#FF883E'],
  AR: ['#4b9cd3', '#1e3a8a', '#4b9cd3'],
  CL: ['#0039A6', '#1e293b', '#D52B1E'],
  CO: ['#b38600', '#003893', '#CE1126'],
  PE: ['#D91023', '#7f1d1d', '#D91023'],
  VN: ['#DA251D', '#991b1b', '#7f1d1d'],
  KR: ['#003478', '#1e293b', '#C60C30'],
  JP: ['#BC002D', '#7f1d1d', '#450a0a'],
  CN: ['#DE2910', '#991b1b', '#7f1d1d'],
};

const RULES: ThemeRule[] = [
  { match: /diwali|deepavali|deepawali|lakshmi puja|kali puja/i, theme: diwali },
  { match: /christmas|xmas|nativity/i, theme: christmas },
  { match: /lunar new year|chinese new year|spring festival|tết|tet nguyen|seollal/i, theme: lunarNewYear },
  { match: /new year/i, theme: newYear },
  { match: /holi\b|holika|dhulandi|dhuleti/i, theme: holi },
  { match: /ramadan|ramzan/i, theme: ramadan },
  { match: /eid|id-ul|idul|bakri|bakrid|hari raya|kurban|bayram/i, theme: eid },
  { match: /easter|good friday|holy saturday/i, theme: easter },
  { match: /halloween/i, theme: halloween },
  { match: /thanksgiving/i, theme: thanksgiving },
  { match: /valentine/i, theme: valentine },
  { match: /hanukkah|chanukah/i, theme: hanukkah },
  { match: /navratri|dussehra|durga|vijaya dashami|dasara/i, theme: navratri },
  { match: /ganesh|ganesha|vinayaka/i, theme: ganesh },
  { match: /patrick/i, theme: stPatrick },
  { match: /mother'?s day/i, theme: mothersDay },
  { match: /labou?r day|may day|workers'? day/i, theme: labour },
];

const NATIONAL = /independence|republic day|national day|constitution day|freedom day|unity day|liberation day|4th of july|fourth of july|bastille|federation day|australia day|canada day/i;

export function getHolidayTheme(name: string, countryCode?: string): HolidayTheme | null {
  const rule = RULES.find(
    (r) => r.match.test(name) && (!r.countries || (countryCode && r.countries.includes(countryCode.toUpperCase())))
  );
  if (rule) return rule.theme;

  if (NATIONAL.test(name)) {
    const colors = countryCode ? FLAG_COLORS[countryCode.toUpperCase()] : undefined;
    return nationalTheme(colors ?? ['#2563eb', '#1e293b', '#dc2626']);
  }

  return null;
}

export const defaultHolidayTheme: HolidayTheme = {
  key: 'default',
  label: 'Holiday',
  background:
    'radial-gradient(ellipse at 10% 0%, rgba(255,179,71,0.55) 0%, transparent 50%), radial-gradient(ellipse at 90% 20%, rgba(168,85,247,0.45) 0%, transparent 50%), linear-gradient(160deg, #e2553b 0%, #b83280 55%, #4c1d95 100%)',
  ink: '#fffaf0',
  accent: '#f97316',
  tint: 'rgba(249, 115, 22, 0.08)',
  particles: ['🎉', '✨', '🎊', '⭐', '🎈', '✨'],
  motion: 'rise',
  greeting: 'Enjoy the holiday!',
  traditions: [],
};

/** Featured festivals shown on the home page */
export const FEATURED_FESTIVALS = [
  { name: 'Diwali', query: 'Diwali', theme: diwali, emoji: '🪔' },
  { name: 'Christmas', query: 'Christmas', theme: christmas, emoji: '🎄' },
  { name: 'New Year', query: 'New Year', theme: newYear, emoji: '🎆' },
  { name: 'Eid', query: 'Eid', theme: eid, emoji: '🌙' },
  { name: 'Holi', query: 'Holi', theme: holi, emoji: '🎨' },
  { name: 'Lunar New Year', query: 'Lunar New Year', theme: lunarNewYear, emoji: '🏮' },
  { name: 'Easter', query: 'Easter', theme: easter, emoji: '🐣' },
  { name: 'Independence Day', query: 'Independence', theme: nationalTheme(['#FF9933', '#1f2a6b', '#138808']), emoji: '🎇' },
] as const;
