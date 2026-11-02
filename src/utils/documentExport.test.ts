import { describe, expect, it } from 'vitest';
import { captureDashboard, createPdf, createPowerPoint, type DashboardDocument } from './documentExport';
const report: DashboardDocument = { title: 'Revenue analytics', filters: '2026-10-01 to 2026-10-30 | Regions: Europe', generated: '3 Nov 2026 IST', metrics: [{ label: 'Revenue', value: '$12,000', change: '+10% vs. previous period' }], sections: [{ title: 'Orders', description: 'Current rows', headers: ['Customer', 'Revenue'], rows: Array.from({ length: 25 }, (_, i) => [`Customer ${i}`, String(i * 100)]) }] };
describe('document exports', () => {
  it('creates a real multipage PDF with metrics and paginated rows', async () => {
    const pdf = await createPdf(report);
    expect(pdf.getNumberOfPages()).toBe(4);
    expect(pdf.output()).toContain('%PDF-');
    expect(pdf.output()).toContain('Revenue analytics');
    expect(pdf.output()).toContain('Customer 24');
  });
  it('creates a real PowerPoint ZIP with paginated table slides', async () => {
    const pptx = await createPowerPoint(report);
    const buffer = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
    expect([...new Uint8Array(buffer).slice(0, 2)]).toEqual([80, 75]);
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });
  it('captures the current metrics and table snapshot with filter context', () => {
    const root = document.createElement('main');
    root.innerHTML = '<h1>Products.</h1><div class="kpi"><span class="kpi-label">Units sold</span><span class="metric">42</span></div><section class="panel"><h2>Products</h2><table><thead><tr><th>Product</th><th>Units</th></tr></thead><tbody><tr><td>Cloud</td><td>42</td></tr></tbody></table></section>';
    const captured = captureDashboard(root, 'Region: Europe');
    expect(captured.title).toBe('Products');
    expect(captured.filters).toBe('Region: Europe');
    expect(captured.metrics[0].value).toBe('42');
    expect(captured.sections[0].rows).toEqual([['Cloud', '42']]);
  });
  it('rejects exports while loading or displaying an error', () => {
    const root = document.createElement('main');
    root.innerHTML = '<div aria-busy="true"></div>';
    expect(() => captureDashboard(root, '')).toThrow('finish loading');
    root.innerHTML = '<div role="alert">Failed</div>';
    expect(() => captureDashboard(root, '')).toThrow('page error');
  });
});
