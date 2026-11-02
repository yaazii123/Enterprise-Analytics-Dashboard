import { describe, it, expect } from 'vitest';
import { aggregate, pageMetrics, metricDefinitions, analyticsApi, filterRecords, group, records } from './analytics';
import { presetToRange } from '@/utils/date';
import type { DashboardFilters } from '@/types';
const filters: DashboardFilters = { preset: '30d', range: presetToRange('30d'), regions: [], categories: [] };
describe('analytics service', () => {
  it('combines date, region and category filters', () => {
    const selected = { ...filters, regions: ['Europe'] as const, categories: ['Software'] as const };
    const rows = filterRecords({ ...selected, regions: [...selected.regions], categories: [...selected.categories] });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(r => r.region === 'Europe' && r.category === 'Software' && r.date >= filters.range.from && r.date <= filters.range.to)).toBe(true);
  });
  it('excludes cancelled and refunded revenue and reconciles categories', () => {
    const rows = filterRecords(filters);
    expect(aggregate(rows)[0]).toBeCloseTo(rows.filter(r => ['completed', 'processing'].includes(r.status)).reduce((sum, r) => sum + r.revenue, 0));
    expect(group(rows, 'category').reduce((sum, r) => sum + r.value, 0)).toBeCloseTo(aggregate(rows)[0], -1);
  });
  it('returns safe empty metrics', () => { expect(aggregate([])).toEqual([0, 0, 0, 0, 0, 0]); });
  it('returns query-ready data with matching sparklines and channels', async () => {
    const result = await analyticsApi.get(filters);
    expect(result.sparklines).toHaveLength(6);
    expect(result.sources.reduce((sum, r) => sum + r.value, 0)).toBe(result.rows.length);
    expect(result.rows.length).toBeLessThan(records.length);
  });
  it('gives revenue and products their own reconciled metrics', async () => {
    const revenue = await analyticsApi.get(filters, 'revenue');
    expect(revenue.metrics[0]).toBeCloseTo(revenue.metrics[1] + revenue.metrics[2]);
    expect(revenue.metrics[4]).toBeCloseTo(revenue.rows.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.revenue, 0));
    const products = await analyticsApi.get(filters, 'products');
    expect(products.metrics[2]).toBeCloseTo(revenue.metrics[0]);
    expect(products.metrics[1]).toBe(products.rows.filter(r => ['completed', 'processing'].includes(r.status)).length);
    expect(metricDefinitions('products').labels).not.toEqual(metricDefinitions('revenue').labels);
    expect(metricDefinitions('overview').labels).not.toEqual(metricDefinitions('products').labels);
  });
  it('keeps empty page-specific metrics safe and aligned with formatting', () => {
    for (const page of ['overview', 'revenue', 'products']) {
      expect(pageMetrics([], page)).toEqual([0, 0, 0, 0, 0, 0]);
      expect(metricDefinitions(page).labels).toHaveLength(6);
      expect(metricDefinitions(page).formats).toHaveLength(6);
    }
  });
  it('validates demo credentials and preserves the chosen role', async () => {
    await expect(analyticsApi.login('bad', 'x', 'admin')).rejects.toThrow();
    expect((await analyticsApi.login('analyst@example.com', 'demo123', 'analyst')).role).toBe('analyst');
  });
});
