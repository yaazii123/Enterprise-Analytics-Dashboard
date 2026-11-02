import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store';
import type { AnalyticsRecord, DashboardFilters } from '@/types';
import { filterRecords, records } from './analytics';
import { previousRange, addDays, rangeLength } from '@/utils/date';

export function summarizeCustomers(rows: AnalyticsRecord[], history = records) {
  const map = new Map<string, { email: string; name: string; orders: number; revenue: number; firstOrder: string; lastOrder: string; region: string }>();
  const firstDates = new Map<string, string>();
  history.forEach(r => { const first = firstDates.get(r.email); if (!first || r.date < first) firstDates.set(r.email, r.date); });
  rows.forEach(r => {
    const c = map.get(r.email) || { email: r.email, name: r.customer, orders: 0, revenue: 0, firstOrder: firstDates.get(r.email) || r.date, lastOrder: r.date, region: r.region };
    c.orders += r.orders;
    if (r.status === 'completed' || r.status === 'processing') c.revenue += r.revenue;
    if (r.date > c.lastOrder) { c.lastOrder = r.date; c.region = r.region; }
    map.set(r.email, c);
  });
  return [...map.values()];
}
export async function getCustomers(filters: DashboardFilters) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const rows = filterRecords(filters);
  const customers = summarizeCustomers(rows);
  const previous = summarizeCustomers(filterRecords({ ...filters, range: previousRange(filters.range) }));
  function metrics(list: typeof customers, from: string) {
    const returning = list.filter(c => c.firstOrder < from).length;
    return [list.length, list.length - returning, returning, list.length ? list.reduce((s, c) => s + c.orders, 0) / list.length : 0, list.length ? list.reduce((s, c) => s + c.revenue, 0) / list.length : 0, list.length ? returning / list.length * 100 : 0];
  }
  const byRegion = new Map<string, number>();
  customers.forEach(c => byRegion.set(c.region, (byRegion.get(c.region) || 0) + 1));
  const dates = Array.from({ length: rangeLength(filters.range) }, (_, i) => addDays(filters.range.from, i));
  const valueBands = [{ name: '$0', value: customers.filter(c => c.revenue === 0).length }, { name: '$1–$499', value: customers.filter(c => c.revenue > 0 && c.revenue < 500).length }, { name: '$500–$1,999', value: customers.filter(c => c.revenue >= 500 && c.revenue < 2000).length }, { name: '$2,000+', value: customers.filter(c => c.revenue >= 2000).length }];
  const activity = dates.map(name => ({ name, value: new Set(rows.filter(r => r.date === name).map(r => r.email)).size }));
  return { valueBands, activity, customers: customers.sort((a, b) => b.revenue - a.revenue), metrics: metrics(customers, filters.range.from), previous: metrics(previous, previousRange(filters.range).from), acquisition: dates.map(name => ({ name, value: customers.filter(c => c.firstOrder === name).length })), regions: [...byRegion].map(([name, value]) => ({ name, value })), segments: [{ name: 'New customers', value: customers.filter(c => c.firstOrder >= filters.range.from).length }, { name: 'Returning customers', value: customers.filter(c => c.firstOrder < filters.range.from).length }], frequency: [{ name: 'One order', value: customers.filter(c => c.orders === 1).length }, { name: '2–3 orders', value: customers.filter(c => c.orders >= 2 && c.orders <= 3).length }, { name: '4+ orders', value: customers.filter(c => c.orders >= 4).length }] };
}
export function useCustomers() {
  const filters = useAppSelector(s => s.filters);
  return useQuery({ queryKey: ['analytics', 'customers', filters], queryFn: () => getCustomers(filters), staleTime: 0, refetchOnMount: 'always' });
}
