import { describe, expect, it } from 'vitest';
import { getCustomers, summarizeCustomers } from './customers';
import { records } from './analytics';
import { presetToRange } from '@/utils/date';

describe('customer analytics', () => {
  it('groups distinct customers and counts revenue only for paid statuses', () => {
    const base = records[0];
    const rows = [{ ...base, email: 'one@example.com', date: '2026-10-10', revenue: 100, status: 'completed' as const }, { ...base, email: 'one@example.com', date: '2026-10-11', revenue: 75, status: 'cancelled' as const }];
    const history = [{ ...rows[0], date: '2026-09-01' }, ...rows];
    const summary = summarizeCustomers(rows, history);
    expect(summary).toHaveLength(1);
    expect(summary[0]).toMatchObject({ orders: 2, revenue: 100, firstOrder: '2026-09-01', lastOrder: '2026-10-11' });
  });
  it('reconciles customer metrics, segments and regions under global filters', async () => {
    const data = await getCustomers({ preset: '30d', range: presetToRange('30d'), regions: ['Europe'], categories: ['Software'] });
    expect(data.customers.length).toBeGreaterThan(0);
    expect(data.metrics[0]).toBe(data.customers.length);
    expect(data.metrics[1] + data.metrics[2]).toBe(data.metrics[0]);
    expect(data.segments.reduce((sum, r) => sum + r.value, 0)).toBe(data.metrics[0]);
    expect(data.regions).toEqual([{ name: 'Europe', value: data.metrics[0] }]);
    expect(data.frequency.reduce((sum, r) => sum + r.value, 0)).toBe(data.metrics[0]);
    expect(data.acquisition.reduce((sum, r) => sum + r.value, 0)).toBe(data.metrics[1]);
  });
});
