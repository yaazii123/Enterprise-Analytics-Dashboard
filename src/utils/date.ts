import type { DatePreset, DateRange } from '@/types';

const MS_PER_DAY = 86_400_000;

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parses `YYYY-MM-DD` as a *local* date (avoids the UTC off-by-one bug). */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a: string, b: string): number {
  const da = parseISODate(a);
  const db = parseISODate(b);
  const utcA = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const utcB = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

/** Number of days in an inclusive range. */
export function rangeLength(range: DateRange): number {
  return diffDays(range.from, range.to) + 1;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function presetToRange(preset: Exclude<DatePreset, 'custom'>, today = todayISO()): DateRange {
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case '7d':
      return { from: addDays(today, -6), to: today };
    case '30d':
      return { from: addDays(today, -29), to: today };
    case '90d':
      return { from: addDays(today, -89), to: today };
  }
}

/** The immediately preceding range of identical length. */
export function previousRange(range: DateRange): DateRange {
  const len = rangeLength(range);
  return { from: addDays(range.from, -len), to: addDays(range.from, -1) };
}

export function isWithin(iso: string, range: DateRange): boolean {
  return iso >= range.from && iso <= range.to;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function startOfWeek(iso: string): string {
  const d = parseISODate(iso);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return toISODate(d);
}

export type Granularity = 'day' | 'week' | 'month';

export function pickGranularity(range: DateRange): Granularity {
  const len = rangeLength(range);
  if (len <= 45) return 'day';
  if (len <= 200) return 'week';
  return 'month';
}

export function bucketKey(iso: string, g: Granularity): string {
  if (g === 'day') return iso;
  if (g === 'week') return startOfWeek(iso);
  return `${monthKey(iso)}-01`;
}

const SHORT_MONTH = new Intl.DateTimeFormat('en-US', { month: 'short' });
const MONTH_DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
const LONG_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatBucketLabel(iso: string, g: Granularity): string {
  const d = parseISODate(iso);
  if (g === 'month') return MONTH_YEAR.format(d);
  return MONTH_DAY.format(d);
}

export function formatShortMonth(iso: string): string {
  return SHORT_MONTH.format(parseISODate(iso));
}

export function formatDate(iso: string): string {
  return LONG_DATE.format(parseISODate(iso));
}

export function formatRange(range: DateRange): string {
  if (range.from === range.to) return formatDate(range.from);
  return `${MONTH_DAY.format(parseISODate(range.from))} – ${LONG_DATE.format(parseISODate(range.to))}`;
}
