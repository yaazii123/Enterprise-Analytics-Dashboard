import type { AnalyticsRecord } from '@/types';
import { downloadCsv, toCsv } from './csv';
export function exportRows(rows: AnalyticsRecord[], name = 'nexora-orders') { downloadCsv(name, toCsv(['Order', 'Customer', 'Email', 'Product', 'Category', 'Region', 'Revenue', 'Status', 'Date'], rows.map(r => [r.id, r.customer, r.email, r.product, r.category, r.region, r.revenue, r.status, r.date]))); }
