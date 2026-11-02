import { useQuery } from '@tanstack/react-query';
import { CATEGORIES, REGIONS, type AnalyticsRecord, type DashboardFilters, type Role, type User } from '@/types';
import { addDays, todayISO, previousRange, isWithin } from '@/utils/date';
import { useAppSelector } from '@/store';
const names = ['Olivia Rhye', 'Phoenix Baker', 'Lana Steiner', 'Demi Wilkinson', 'Drew Cano', 'Natali Craig', 'Orlando Diggs', 'Andi Lane', 'Kate Morrison', 'Aarav Patel', 'Sofia Chen', 'James Wilson', 'Maya Singh', 'Noah Williams', 'Isabella Rossi', 'Lucas Martin', 'Amelia Brown', 'Ethan Park', 'Harper Davis', 'Leo Garcia', 'Aria Thompson', 'Oliver Taylor', 'Zoe Anderson', 'Elijah Moore'];
const products = [['Nexora Pro', 'Nexora Enterprise', 'Insights Studio', 'Forecast Engine'], ['Enterprise Gateway', 'Edge Server', 'Data Hub', 'Network Bridge'], ['Implementation', 'Data Migration', 'Analytics Consulting', 'Priority Support'], ['Cloud Suite', 'Team Monthly', 'Business Annual', 'Enterprise Annual'], ['Workspace Kit', 'Docking Station', 'Security Key', 'Travel Adapter']];
let seed = 42;
const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
export const records: AnalyticsRecord[] = Array.from({ length: 36000 }, (_, i) => {
  const category = Math.floor(random() * 5), customerId = Math.floor(random() * 1600), person = customerId % names.length;
  return { id: `ORD-${String(10001 + i)}`, customer: names[person], email: `${names[person].toLowerCase().replace(' ', '.')}${customerId}@example.com`, product: products[category][Math.floor(random() * 4)], category: CATEGORIES[category], region: REGIONS[Math.floor(random() * 5)], revenue: Math.round((80 + random() * 1500) * 100) / 100, orders: 1, status: (['completed', 'completed', 'completed', 'processing', 'pending', 'refunded', 'cancelled'] as const)[Math.floor(random() * 7)], date: addDays(todayISO(), -Math.floor(random() * 730)) };
}).sort((a, b) => b.date.localeCompare(a.date));
export function filterRecords(filters: DashboardFilters, all = records) {
  return all.filter(r => isWithin(r.date, filters.range) && (!filters.regions.length || filters.regions.includes(r.region)) && (!filters.categories.length || filters.categories.includes(r.category)));
}
export function aggregate(rows: AnalyticsRecord[]) {
  const paid = rows.filter(r => r.status === 'completed' || r.status === 'processing');
  const revenue = paid.reduce((s, r) => s + r.revenue, 0);
  const users = new Set(rows.map(r => r.email)).size;
  const active = new Set(paid.map(r => r.email)).size;
  const counts = new Map<string, number>();
  rows.forEach(r => counts.set(r.email, (counts.get(r.email) || 0) + 1));
  const repeat = [...counts.values()].filter(count => count > 1).length;
  return [revenue, users, active, rows.length ? paid.length / rows.length * 100 : 0, paid.length ? revenue / paid.length : 0, users ? repeat / users * 100 : 0];
}
export function group(rows: AnalyticsRecord[], field: 'category' | 'region' | 'product' | 'date' | 'status') {
  const totals = new Map<string, number>();
  rows.forEach(r => totals.set(r[field], (totals.get(r[field]) || 0) + (r.status === 'completed' || r.status === 'processing' ? r.revenue : 0)));
  return [...totals].map(([name, value]) => ({ name, value: Math.round(value) }));
}
export function pageMetrics(rows: AnalyticsRecord[], page = 'overview') {
  const base = aggregate(rows);
  const totalFor = (status: string) => rows.filter(r => r.status === status).reduce((sum, r) => sum + r.revenue, 0);
  if (page === 'revenue') return [base[0], totalFor('completed'), totalFor('processing'), totalFor('pending'), totalFor('refunded'), base[4]];
  if (page === 'orders') return [rows.length, rows.filter(r => r.status === 'completed').length, rows.filter(r => r.status === 'processing').length, rows.filter(r => r.status === 'pending').length, rows.filter(r => r.status === 'refunded' || r.status === 'cancelled').length, rows.reduce((sum, r) => sum + r.revenue, 0)];
  if (page === 'products') {
    const paid = rows.filter(r => r.status === 'completed' || r.status === 'processing');
    const productRevenue = group(rows, 'product');
    return [new Set(paid.map(r => r.product)).size, paid.reduce((sum, r) => sum + r.orders, 0), base[0], base[4], base[0] ? Math.max(0, ...productRevenue.map(r => r.value)) / base[0] * 100 : 0, rows.length ? rows.filter(r => r.status === 'refunded').length / rows.length * 100 : 0];
  }
  return base;
}
export function metricDefinitions(page: string) {
  if (page === 'orders') return { labels: ['Total orders', 'Completed orders', 'Processing orders', 'Pending orders', 'Refunded / cancelled', 'Total order value'], formats: ['number', 'number', 'number', 'number', 'number', 'currency'], lowerIsBetter: [4] };
  if (page === 'revenue') return { labels: ['Recognized revenue', 'Completed revenue', 'Processing revenue', 'Pending order value', 'Refunded order value', 'Average paid order'], formats: ['currency', 'currency', 'currency', 'currency', 'currency', 'currency'], lowerIsBetter: [4] };
  if (page === 'products') return { labels: ['Products sold', 'Paid units sold', 'Product revenue', 'Average paid order', 'Leading product share', 'Product refund rate'], formats: ['number', 'number', 'currency', 'currency', 'percent', 'percent'], lowerIsBetter: [5] };
  return { labels: ['Total revenue', 'Total users', 'Active users', 'Conversion rate', 'Average order value', 'Customer retention'], formats: ['currency', 'number', 'number', 'percent', 'currency', 'percent'], lowerIsBetter: [] };
}
const pause = () => new Promise(resolve => setTimeout(resolve, 250));
export const analyticsApi = {
  async get(filters: DashboardFilters, page = 'overview') { await pause(); const rows = filterRecords(filters); const days = [...new Set(rows.map(r => r.date))].sort(); const sparklines = Array.from({ length: 6 }, (_, metric) => days.map(day => pageMetrics(rows.filter(r => r.date === day), page)[metric])); const sources = ['Organic search', 'Direct', 'Referral', 'Social', 'Email'].map((name, i) => ({ name, value: rows.filter(r => Number(r.id.slice(4)) % 5 === i).length })); return { rows, sparklines, sources, metrics: pageMetrics(rows, page), previous: pageMetrics(filterRecords({ ...filters, range: previousRange(filters.range) }), page), trend: group(rows, 'date').sort((a, b) => a.name.localeCompare(b.name)), categories: group(rows, 'category'), regions: group(rows, 'region'), products: group(rows, 'product') }; },
  async login(email: string, password: string, role: Role): Promise<User> { await pause(); if (!email.includes('@') || password.length < 6) throw new Error('Enter a valid email and a password of at least 6 characters.'); return { id: 'demo-user', name: email.split('@')[0].replace(/[._]/g, ' '), email, role, avatarInitials: email.slice(0, 2).toUpperCase(), title: 'Analytics team' }; },
};
export function useAnalytics(page = 'overview') { const filters = useAppSelector(s => s.filters); return useQuery({ queryKey: ['analytics', page, filters], queryFn: () => analyticsApi.get(filters, page), staleTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true }); }
export type Analytics = Awaited<ReturnType<typeof analyticsApi.get>>;
