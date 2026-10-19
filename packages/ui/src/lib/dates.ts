import { TZDate } from '@date-fns/tz';

/** A calendar date as `YYYY-MM-DD`, with no time zone. */
export type DateOnly = string;
/** An instant as an ISO 8601 string. */
export type Timestamp = string;

// Every date rule in one place (brand-and-ux 5.10 and 5.19, behaviour-core 3.3, D15).
//
// Two clocks, on purpose:
// - The WORK clock is Australia/Sydney, always. "Today", "overdue" and "this week"
//   must mean the same thing for every colleague, whatever their own timezone is.
// - DISPLAY of timestamps (a comment's time) uses the viewer's profile timezone,
//   which defaults to Sydney too.
//
// Names of months and weekdays are written out here rather than taken from Intl:
// current ICU prints "Sept" for en-AU, and the house format is "9 Sep".
// Nothing reads the clock: every function that needs the moment takes `now` or `today`.
// A screen gets them from SoleProvider (useNow, useToday).

export const SYDNEY = 'Australia/Sydney';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
/** Index 0 is Monday, the first day of the work week. */
const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const pad = (n: number) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- calendar dates

interface Ymd {
  y: number;
  m: number; // 1 to 12
  d: number;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateOnly(value: unknown): value is DateOnly {
  if (typeof value !== 'string') return false;
  const m = DATE_ONLY.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

function ymd(date: DateOnly): Ymd {
  const m = DATE_ONLY.exec(date);
  if (!m) throw new Error(`Not a calendar date: ${date}`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function fromUtc(t: Date): DateOnly {
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

function toUtc(date: DateOnly): Date {
  const { y, m, d } = ymd(date);
  return new Date(Date.UTC(y, m - 1, d));
}

/** The calendar date at instant `at` in `tz`. */
export function dateIn(at: Date | Timestamp, tz: string = SYDNEY): DateOnly {
  const t = typeof at === 'string' ? new Date(at) : at;
  const z = new TZDate(t.getTime(), tz);
  return `${z.getFullYear()}-${pad(z.getMonth() + 1)}-${pad(z.getDate())}`;
}

/** Today on the work clock (Sydney unless told otherwise). */
export function todayDate(now: Date, tz: string = SYDNEY): DateOnly {
  return dateIn(now, tz);
}

export function addDays(date: DateOnly, days: number): DateOnly {
  const t = toUtc(date);
  t.setUTCDate(t.getUTCDate() + days);
  return fromUtc(t);
}

/** Calendar months, clamped: 31 Aug plus 6 months is 28 Feb (29 in a leap year). */
export function addMonths(date: DateOnly, months: number): DateOnly {
  const { y, m, d } = ymd(date);
  const index = y * 12 + (m - 1) + months;
  const ny = Math.floor(index / 12);
  const nm = index - ny * 12; // 0 to 11
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return fromUtc(new Date(Date.UTC(ny, nm, Math.min(d, last))));
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: DateOnly, to: DateOnly): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** 0 for Monday to 6 for Sunday. */
export function weekdayIndex(date: DateOnly): number {
  return (toUtc(date).getUTCDay() + 6) % 7;
}

/** The work week containing `date`: Monday to Sunday. */
export function weekOf(date: DateOnly): { start: DateOnly; end: DateOnly } {
  const start = addDays(date, -weekdayIndex(date));
  return { start, end: addDays(start, 6) };
}

// ---------------------------------------------------------------- due dates

export type DueTone = 'overdue' | 'today' | 'soon' | 'plain' | 'done';

export interface DueChipModel {
  tone: DueTone;
  /** What the chip says: "9 Sep", "Today", "Tomorrow", "Fri", "9 Oct 2027". */
  label: string;
  /** For screen readers, e.g. "Overdue, due 9 Sep". */
  ariaLabel: string;
  /** The full date, for the tooltip. */
  title: string;
}

/**
 * The due-date chip (brand-and-ux 5.10). `done` is true for completed and cancelled
 * items: their date is a plain fact and is never red.
 */
export function dueChip(due: DateOnly, today: DateOnly, done = false): DueChipModel {
  const title = formatLongDate(due, { weekday: true });
  const short = formatDate(due, today);
  if (done) return { tone: 'done', label: short, ariaLabel: `Due ${short}`, title };
  if (due < today) return { tone: 'overdue', label: short, ariaLabel: `Overdue, due ${short}`, title };
  if (due === today) return { tone: 'today', label: 'Today', ariaLabel: 'Due today', title };
  if (due === addDays(today, 1)) return { tone: 'soon', label: 'Tomorrow', ariaLabel: 'Due tomorrow', title };
  if (due <= weekOf(today).end) {
    const day = WEEKDAYS_SHORT[weekdayIndex(due)]!;
    return { tone: 'soon', label: day, ariaLabel: `Due ${WEEKDAYS_LONG[weekdayIndex(due)]}`, title };
  }
  return { tone: 'plain', label: short, ariaLabel: `Due ${short}`, title };
}

// ---------------------------------------------------------------- formatting

/** "9 Sep" in the current year, "9 Sep 2027" otherwise. Pass `today` to decide the year. */
export function formatDate(date: DateOnly, today?: DateOnly, opts: { year?: boolean } = {}): string {
  const { y, m, d } = ymd(date);
  const withYear = opts.year ?? (today ? ymd(today).y !== y : true);
  return withYear ? `${d} ${MONTHS_SHORT[m - 1]} ${y}` : `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** "9 September 2026", or "Wednesday, 9 September 2026" with `weekday`. `year: false` drops the year. */
export function formatLongDate(date: DateOnly, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const { y, m, d } = ymd(date);
  const core = opts.year === false ? `${d} ${MONTHS_LONG[m - 1]}` : `${d} ${MONTHS_LONG[m - 1]} ${y}`;
  return opts.weekday ? `${WEEKDAYS_LONG[weekdayIndex(date)]}, ${core}` : core;
}

/** "3:00 PM", "9:30 AM": no leading zero, always minutes, upper-case AM and PM. */
export function formatTime(at: Date | Timestamp, tz: string = SYDNEY): string {
  const t = typeof at === 'string' ? new Date(at) : at;
  const z = new TZDate(t.getTime(), tz);
  const h = z.getHours();
  return `${h % 12 || 12}:${pad(z.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}

/** A timestamp as a date: "9 Sep", or "9 Sep 2025" in another year. */
export function formatTimestampDate(at: Date | Timestamp, now: Date, tz: string = SYDNEY): string {
  return formatDate(dateIn(at, tz), dateIn(now, tz));
}

/**
 * Relative time for the Inbox and comments only (brand-and-ux 5.19): "Just now",
 * "5 min ago", "2 h ago" today; "Yesterday"; the weekday within the last week;
 * then the date. Always pair it with the absolute time in a tooltip.
 */
export function formatRelative(at: Date | Timestamp, now: Date, tz: string = SYDNEY): string {
  const t = typeof at === 'string' ? new Date(at) : at;
  const seconds = Math.floor((now.getTime() - t.getTime()) / 1000);
  const day = dateIn(t, tz);
  const current = dateIn(now, tz);
  const ago = daysBetween(day, current);
  if (seconds < 0 || ago < 0) return formatDate(day, current);
  if (ago === 0) {
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    return `${Math.floor(seconds / 3600)} h ago`;
  }
  if (ago === 1) return 'Yesterday';
  if (ago < 7) return WEEKDAYS_LONG[weekdayIndex(day)]!;
  return formatDate(day, current);
}

/** "Today 3:12 PM", "Yesterday 3:12 PM", "Fri 3:12 PM" within a week, else "9 Sep, 3:12 PM". */
export function formatDayTime(at: Date | Timestamp, now: Date, tz: string = SYDNEY): string {
  const day = dateIn(at, tz);
  const current = dateIn(now, tz);
  const ago = daysBetween(day, current);
  const time = formatTime(at, tz);
  if (ago === 0) return `Today ${time}`;
  if (ago === 1) return `Yesterday ${time}`;
  if (ago > 1 && ago < 7) return `${WEEKDAYS_SHORT[weekdayIndex(day)]} ${time}`;
  return `${formatDate(day, current)}, ${time}`;
}

/** The full stamp for tooltips: "Tuesday, 29 September 2026, 3:12 PM". */
export function formatFullTimestamp(at: Date | Timestamp, tz: string = SYDNEY): string {
  return `${formatLongDate(dateIn(at, tz), { weekday: true })}, ${formatTime(at, tz)}`;
}

/** Home's greeting: before 12 is morning, before 6 PM is afternoon. */
export function greeting(now: Date, tz: string = SYDNEY): 'Good morning' | 'Good afternoon' | 'Good evening' {
  const h = new TZDate(now.getTime(), tz).getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
