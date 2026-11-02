import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Chart } from './Chart';

describe('Chart component integration', () => {
  it.each(['line', 'area', 'bar', 'horizontal', 'pie', 'donut', 'scatter', 'radar', 'funnel', 'treemap'] as const)('renders the real ECharts wrapper for %s data', kind => {
    // Use the actual package import so CommonJS/ESM interoperability regressions
    // fail here rather than being hidden by a mocked chart component.
    const markup = renderToString(
      <Provider store={store}>
        <Chart kind={kind} data={[{ name: 'Software', value: 120 }]} />
      </Provider>,
    );
    expect(markup).toContain('echarts-for-react');
  });

  it('renders the empty state without initializing a chart', () => {
    const markup = renderToString(<Provider store={store}><Chart data={[]} /></Provider>);
    expect(markup).toContain('No data for the selected filters.');
  });
});
