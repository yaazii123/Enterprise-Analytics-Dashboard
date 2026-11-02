export const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
] as const;
export type Region = (typeof REGIONS)[number];

export const CATEGORIES = [
  'Software',
  'Hardware',
  'Services',
  'Subscriptions',
  'Accessories',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type DatePreset = 'today' | '7d' | '30d' | '90d' | 'custom';

/** Inclusive date range, both ends as local `YYYY-MM-DD` strings. */
export interface DateRange {
  from: string;
  to: string;
}

export interface DashboardFilters {
  preset: DatePreset;
  range: DateRange;
  /** Empty array means "all regions". */
  regions: Region[];
  /** Empty array means "all categories". */
  categories: Category[];
}
