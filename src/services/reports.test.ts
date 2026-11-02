import { describe, expect, it } from 'vitest';
import { reportCsv } from './reports';
import { analyticsApi } from './analytics';
import { presetToRange } from '@/utils/date';
import type { DashboardFilters } from '@/types';
describe('expanded report types', () => {
  it('generates seven valid report datasets from the selected filters', async () => {
    const filters: DashboardFilters = { preset: '7d', range: presetToRange('7d'), regions: ['Europe'], categories: [] };
    const data = await analyticsApi.get(filters);
    for (const type of ['orders', 'analytics', 'customers', 'products', 'regions', 'daily', 'status']) {
      const csv = reportCsv(type, data, filters);
      expect(csv.split('\r\n').length).toBeGreaterThan(1);
      expect(csv).not.toContain('undefined');
    }
    expect(reportCsv('regions', data, filters)).toContain('Europe');
    expect(reportCsv('products', data, filters)).toContain('Recognized revenue');
  });
});
