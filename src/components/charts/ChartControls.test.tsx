import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Chart } from './Chart';

// The real package import is covered by Chart.test.tsx. This isolates controls
// from the canvas implementation that jsdom cannot paint.
vi.mock('echarts-for-react/esm/core', () => ({ default: () => <div data-testid="chart-canvas" /> }));
afterEach(cleanup);
describe('chart exploration', () => {
  it('switches to exact filtered data and updates when filters change', () => {
    const { rerender } = render(<Provider store={store}><Chart title="Revenue" data={[{ name: 'Europe', value: 1234.56 }]} /></Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Show Revenue table' }));
    expect(screen.getByRole('cell', { name: 'Europe' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1,234.56' })).toBeInTheDocument();
    expect(screen.queryByTestId('chart-canvas')).not.toBeInTheDocument();
    rerender(<Provider store={store}><Chart title="Revenue" data={[{ name: 'Software', value: 90 }]} /></Provider>);
    expect(screen.getByRole('cell', { name: 'Software' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Europe' })).not.toBeInTheDocument();
  });
  it('offers ten chart types and returns from the table to a selected chart', () => {
    render(<Provider store={store}><Chart title="Revenue" data={[{ name: 'Europe', value: 100 }]} /></Provider>);
    expect(screen.getAllByRole('option')).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', { name: 'Show Revenue table' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Revenue chart type' }), { target: { value: 'area' } });
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Revenue chart' })).toHaveAttribute('aria-pressed', 'true');
  });
});
