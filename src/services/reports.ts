import type { DashboardFilters } from '@/types';
import type { Analytics } from './analytics';
import { group, metricDefinitions } from './analytics';
import { summarizeCustomers } from './customers';
import { toCsv } from '@/utils/csv';
export function reportCsv(kind: string, data: Analytics, filters: DashboardFilters) {
  if (kind === 'orders') return toCsv(['Order', 'Customer', 'Email', 'Product', 'Category', 'Region', 'Revenue', 'Status', 'Date'], data.rows.map(r => [r.id, r.customer, r.email, r.product, r.category, r.region, r.revenue, r.status, r.date]));
  if (kind === 'customers') return toCsv(['Customer', 'Email', 'Region', 'Orders', 'Revenue', 'First order', 'Latest order'], summarizeCustomers(data.rows).map(c => [c.name, c.email, c.region, c.orders, c.revenue, c.firstOrder, c.lastOrder]));
  if (['products', 'regions', 'daily'].includes(kind)) {
    const field = kind === 'products' ? 'product' : kind === 'regions' ? 'region' : 'date';
    return toCsv([field, 'Recognized revenue', 'Orders', 'From', 'To'], group(data.rows, field).map(item => [item.name, item.value, data.rows.filter(r => r[field] === item.name).length, filters.range.from, filters.range.to]));
  }
  if (kind === 'status') return toCsv(['Status', 'Orders', 'Order value'], ['completed', 'processing', 'pending', 'refunded', 'cancelled'].map(status => { const rows = data.rows.filter(r => r.status === status); return [status, rows.length, rows.reduce((sum, r) => sum + r.revenue, 0)]; }));
  return toCsv(['Metric', 'Value', 'From', 'To'], metricDefinitions('overview').labels.map((label, i) => [label, data.metrics[i], filters.range.from, filters.range.to]));
}
