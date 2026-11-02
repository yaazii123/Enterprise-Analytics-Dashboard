import type { Category, DateRange, Region } from './filters';

export type TrendDirection = 'up' | 'down' | 'flat';
export type KpiKey =
  | 'totalRevenue'
  | 'totalUsers'
  | 'activeUsers'
  | 'conversionRate'
  | 'averageOrderValue'
  | 'customerRetention';

export type KpiFormat = 'currency' | 'number' | 'percent';

export interface KpiMetric {
  key: KpiKey;
  label: string;
  format: KpiFormat;
  value: number;
  previousValue: number;
  /** Percentage change vs previous period (e.g. 12.4 = +12.4%). */
  changePct: number;
  /** For metrics where lower is better this stays "up" = numerically higher. */
  trend: TrendDirection;
  sparkline: number[];
  previousPeriod: DateRange;
}

export interface TimeSeriesPoint {
  /** Bucket label start date (YYYY-MM-DD). */
  date: string;
  label: string;
  value: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface MonthlySales {
  month: string;
  label: string;
  revenue: number;
  target: number;
}

export interface RegionPerformance {
  region: Region;
  revenue: number;
  orders: number;
  users: number;
  growthPct: number;
  share: number;
}

export type OrderStatus = 'completed' | 'pending' | 'processing' | 'refunded' | 'cancelled';

/** One row of the analytics / orders table. */
export interface AnalyticsRecord {
  id: string;
  customer: string;
  email: string;
  product: string;
  category: Category;
  region: Region;
  revenue: number;
  orders: number;
  status: OrderStatus;
  /** YYYY-MM-DD */
  date: string;
}
