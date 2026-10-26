/**
 * Canadian English formats for the GTA (L2-091). Calendar dates arrive from the API as ISO dates
 * already in America/Toronto; instants are converted to Toronto time here.
 */
export const torontoTimeZone = 'America/Toronto';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const longMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseIsoDate(isoDate: string): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const [year, month, day] = isoDate.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, weekday };
}

/** "Sat 14 Nov", or "Sat 14 Nov 2026" with the year. */
export function formatDate(isoDate: string, withYear = false): string {
  const { year, month, day, weekday } = parseIsoDate(isoDate);
  const date = `${weekdays[weekday]} ${day} ${months[month - 1]}`;
  return withYear ? `${date} ${year}` : date;
}

/** "Saturday 14 November 2026": the exact date offered on hover or focus. */
export function formatLongDate(isoDate: string): string {
  const { year, month, day, weekday } = parseIsoDate(isoDate);
  return `${longWeekdays[weekday]} ${day} ${longMonths[month - 1]} ${year}`;
}

function clock(time: string): { text: string; period: 'am' | 'pm' } {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours < 12 ? 'am' : 'pm';
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return { text: `${twelveHour}:${String(minutes).padStart(2, '0')}`, period };
}

/** "1:00 pm" */
export function formatTime(time: string): string {
  const { text, period } = clock(time);
  return `${text} ${period}`;
}

/** "1:00–3:30 pm", or "11:00 am–1:00 pm" when the range crosses noon. */
export function formatTimeRange(start: string, end: string): string {
  const from = clock(start);
  const to = clock(end);
  return from.period === to.period
    ? `${from.text}–${to.text} ${to.period}`
    : `${from.text} ${from.period}–${to.text} ${to.period}`;
}

/** "Today", "Tomorrow", "in 20 days", "Yesterday" or "3 days ago", from calendar days. */
export function formatRelativeDays(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

/** Canadian dollars with a $ sign; whole dollars unless cents are needed. Prices include HST. */
export function formatMoney(amount: number): string {
  const wholeDollars = Number.isInteger(amount);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: wholeDollars ? 0 : 2,
    maximumFractionDigits: wholeDollars ? 0 : 2,
  }).format(amount);
}

/** The hour of the day (0–23) in Toronto at the given instant. */
export function torontoHour(instant: Date): number {
  const hour = new Intl.DateTimeFormat('en-CA', {
    timeZone: torontoTimeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(instant);
  return Number(hour);
}

/** "Good morning", "Good afternoon" or "Good evening" by the time in Toronto. */
export function greetingAt(instant: Date): string {
  const hour = torontoHour(instant);
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "2:03 pm": the time in Toronto at the given instant. */
export function formatClockTime(instant: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: torontoTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return formatTime(`${hour}:${minute}`);
}

/** "7th", "1st", "22nd", "13th". */
export function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix = teen
    ? 'th'
    : (({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th');
  return `${n}${suffix}`;
}

/** Today's calendar date in Toronto, as an ISO date. */
export function torontoToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: torontoTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Adds calendar days to an ISO date. */
export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}
