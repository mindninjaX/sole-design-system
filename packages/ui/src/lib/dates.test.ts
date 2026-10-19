import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  dateIn,
  daysBetween,
  dueChip,
  formatDate,
  formatDayTime,
  formatFullTimestamp,
  formatLongDate,
  formatRelative,
  formatTime,
  formatTimestampDate,
  greeting,
  isDateOnly,
  todayDate,
  weekdayIndex,
  weekOf,
} from './dates.ts';

// 29 Sep 2026 is a Tuesday. Sydney is UTC+10 until daylight saving starts on
// Sunday 4 Oct 2026 at 2:00 AM, then UTC+11.
const TUE = '2026-09-29';
const at = (iso: string) => new Date(iso);

describe('the Sydney work clock', () => {
  it('uses the Sydney date, not the UTC one', () => {
    // 1:00 AM on 29 Sep in Sydney is still 28 Sep in UTC: Taskmate's old bug.
    expect(dateIn(at('2026-09-28T15:00:00Z'))).toBe('2026-09-29');
    expect(dateIn(at('2026-09-28T15:00:00Z'), 'UTC')).toBe('2026-09-28');
    expect(todayDate(at('2026-09-28T15:00:00Z'))).toBe('2026-09-29');
  });

  it('rolls over at midnight Sydney time', () => {
    expect(dateIn('2026-09-28T13:59:59Z')).toBe('2026-09-28');
    expect(dateIn('2026-09-28T14:00:00Z')).toBe('2026-09-29');
  });

  it('follows daylight saving', () => {
    // After 4 Oct, midnight in Sydney is 13:00 UTC, not 14:00.
    expect(dateIn('2026-10-05T13:00:00Z')).toBe('2026-10-06');
    expect(dateIn('2026-10-05T12:59:59Z')).toBe('2026-10-05');
  });

  it('can read another timezone for display', () => {
    expect(dateIn('2026-09-29T05:00:00Z', 'Australia/Perth')).toBe('2026-09-29');
    expect(dateIn('2026-09-29T20:00:00Z', 'Australia/Perth')).toBe('2026-09-30');
  });
});

describe('calendar arithmetic', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-09-29', 3)).toBe('2026-10-02');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29');
  });

  it('is not moved by daylight saving', () => {
    expect(addDays('2026-10-03', 1)).toBe('2026-10-04');
    expect(addDays('2026-10-04', 1)).toBe('2026-10-05');
    expect(daysBetween('2026-10-03', '2026-10-05')).toBe(2);
  });

  it('adds calendar months, clamping to the end of the month', () => {
    expect(addMonths('2026-09-29', 6)).toBe('2027-03-29');
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28');
    expect(addMonths('2027-08-31', 6)).toBe('2028-02-29');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-15');
    expect(addMonths('2026-03-31', -1)).toBe('2026-02-28');
  });

  it('counts days in both directions', () => {
    expect(daysBetween('2026-09-29', '2026-10-13')).toBe(14);
    expect(daysBetween('2026-09-29', '2026-09-26')).toBe(-3);
    expect(daysBetween(TUE, TUE)).toBe(0);
  });

  it('validates calendar dates', () => {
    expect(isDateOnly('2026-09-29')).toBe(true);
    expect(isDateOnly('2026-02-30')).toBe(false);
    expect(isDateOnly('2026-9-29')).toBe(false);
    expect(isDateOnly(null)).toBe(false);
  });
});

describe('the Monday to Sunday week', () => {
  it('starts on Monday', () => {
    expect(weekdayIndex('2026-09-28')).toBe(0);
    expect(weekdayIndex(TUE)).toBe(1);
    expect(weekdayIndex('2026-10-04')).toBe(6);
  });

  it('gives the same week for every day in it', () => {
    for (const day of ['2026-09-28', TUE, '2026-10-01', '2026-10-04']) {
      expect(weekOf(day)).toEqual({ start: '2026-09-28', end: '2026-10-04' });
    }
    expect(weekOf('2026-10-05')).toEqual({ start: '2026-10-05', end: '2026-10-11' });
  });
});

describe('the due chip', () => {
  it('shows an overdue date in solid red with the date as the words', () => {
    expect(dueChip('2026-09-26', TUE)).toMatchObject({ tone: 'overdue', label: '26 Sep', ariaLabel: 'Overdue, due 26 Sep' });
  });

  it('adds the year to an overdue date from another year', () => {
    expect(dueChip('2025-12-30', TUE).label).toBe('30 Dec 2025');
  });

  it('says Today and Tomorrow', () => {
    expect(dueChip(TUE, TUE)).toMatchObject({ tone: 'today', label: 'Today' });
    expect(dueChip('2026-09-30', TUE)).toMatchObject({ tone: 'soon', label: 'Tomorrow' });
    // Tomorrow is still Tomorrow on a Sunday, although it is next week.
    expect(dueChip('2026-10-05', '2026-10-04')).toMatchObject({ tone: 'soon', label: 'Tomorrow' });
  });

  it('uses the weekday for the rest of this week', () => {
    expect(dueChip('2026-10-01', TUE)).toMatchObject({ tone: 'soon', label: 'Thu', ariaLabel: 'Due Thursday' });
    expect(dueChip('2026-10-02', TUE).label).toBe('Fri');
    expect(dueChip('2026-10-04', TUE).label).toBe('Sun');
  });

  it('is plain text later on', () => {
    expect(dueChip('2026-10-09', TUE)).toMatchObject({ tone: 'plain', label: '9 Oct' });
    expect(dueChip('2027-01-05', TUE)).toMatchObject({ tone: 'plain', label: '5 Jan 2027' });
  });

  it('is never red on a done item', () => {
    expect(dueChip('2026-09-26', TUE, true)).toMatchObject({ tone: 'done', label: '26 Sep' });
    expect(dueChip(TUE, TUE, true)).toMatchObject({ tone: 'done', label: '29 Sep' });
  });

  it('puts the full date in the tooltip', () => {
    expect(dueChip('2026-10-02', TUE).title).toBe('Friday, 2 October 2026');
  });
});

describe('en-AU formatting', () => {
  it('writes dates as 9 Sep and 9 Sep 2026', () => {
    expect(formatDate('2026-09-09', TUE)).toBe('9 Sep');
    expect(formatDate('2027-09-09', TUE)).toBe('9 Sep 2027');
    expect(formatDate('2026-09-09')).toBe('9 Sep 2026');
    expect(formatDate('2026-09-09', TUE, { year: true })).toBe('9 Sep 2026');
  });

  it('never writes Sept', () => {
    expect(formatDate('2026-09-01', TUE)).not.toContain('Sept');
  });

  it('writes long dates', () => {
    expect(formatLongDate('2026-09-09')).toBe('9 September 2026');
    expect(formatLongDate(TUE, { weekday: true, year: false })).toBe('Tuesday, 29 September');
    expect(formatLongDate('2026-09-07', { weekday: true })).toBe('Monday, 7 September 2026');
  });

  it('writes times as 3:00 PM, in Sydney unless asked otherwise', () => {
    expect(formatTime('2026-09-29T05:00:00Z')).toBe('3:00 PM');
    expect(formatTime('2026-09-28T23:30:00Z')).toBe('9:30 AM');
    expect(formatTime('2026-09-28T14:05:00Z')).toBe('12:05 AM');
    expect(formatTime('2026-09-29T02:00:00Z')).toBe('12:00 PM');
    expect(formatTime('2026-10-05T05:00:00Z')).toBe('4:00 PM');
    expect(formatTime('2026-09-29T05:00:00Z', 'Australia/Perth')).toBe('1:00 PM');
  });

  it('formats a timestamp as a date in the viewer timezone', () => {
    const now = at('2026-09-29T05:00:00Z');
    expect(formatTimestampDate('2026-09-08T23:00:00Z', now)).toBe('9 Sep');
    expect(formatTimestampDate('2025-09-08T23:00:00Z', now)).toBe('9 Sep 2025');
  });

  it('writes a full stamp for tooltips', () => {
    expect(formatFullTimestamp('2026-09-29T05:12:00Z')).toBe('Tuesday, 29 September 2026, 3:12 PM');
  });
});

describe('relative time (Inbox and comments)', () => {
  const now = at('2026-09-29T05:00:00Z'); // 3:00 PM Tuesday in Sydney

  it('counts minutes and hours today', () => {
    expect(formatRelative('2026-09-29T04:59:30Z', now)).toBe('Just now');
    expect(formatRelative('2026-09-29T04:48:00Z', now)).toBe('12 min ago');
    expect(formatRelative('2026-09-29T03:00:00Z', now)).toBe('2 h ago');
    // 12:30 AM today is still today, 14 hours ago.
    expect(formatRelative('2026-09-28T14:30:00Z', now)).toBe('14 h ago');
  });

  it('says Yesterday for the previous Sydney day', () => {
    expect(formatRelative('2026-09-28T04:12:00Z', now)).toBe('Yesterday');
    expect(formatRelative('2026-09-28T13:30:00Z', now)).toBe('Yesterday');
  });

  it('names the weekday within the last week, then gives the date', () => {
    expect(formatRelative('2026-09-25T00:00:00Z', now)).toBe('Friday');
    expect(formatRelative('2026-09-23T00:00:00Z', now)).toBe('Wednesday');
    expect(formatRelative('2026-09-22T00:00:00Z', now)).toBe('22 Sep');
  });

  it('never says a future time is ago', () => {
    expect(formatRelative('2026-10-01T00:00:00Z', now)).toBe('1 Oct');
  });

  it('writes day and time for comment stamps', () => {
    expect(formatDayTime('2026-09-28T05:12:00Z', now)).toBe('Yesterday 3:12 PM');
    expect(formatDayTime('2026-09-29T00:05:00Z', now)).toBe('Today 10:05 AM');
    expect(formatDayTime('2026-09-25T05:12:00Z', now)).toBe('Fri 3:12 PM');
    expect(formatDayTime('2026-09-09T05:12:00Z', now)).toBe('9 Sep, 3:12 PM');
  });
});

describe('the greeting', () => {
  it('follows the Sydney clock', () => {
    expect(greeting(at('2026-09-28T21:00:00Z'))).toBe('Good morning');
    expect(greeting(at('2026-09-29T01:59:00Z'))).toBe('Good morning');
    expect(greeting(at('2026-09-29T02:00:00Z'))).toBe('Good afternoon');
    expect(greeting(at('2026-09-29T08:00:00Z'))).toBe('Good evening');
  });
});
