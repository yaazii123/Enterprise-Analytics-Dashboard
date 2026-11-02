import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { OrdersTable } from './OrdersTable';
import { records } from '@/services/analytics';
afterEach(cleanup);
describe('orders workflow', () => {
  it('searches, selects rows and changes visible columns', () => {
    render(<OrdersTable rows={records.slice(0, 30)} />);
    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: records[0].id } });
    expect(screen.getByText(records[0].id)).toBeInTheDocument();
    expect(screen.getByText('0 selected · 1 records')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(`Select ${records[0].id}`));
    expect(screen.getByText('1 selected · 1 records')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Columns'));
    fireEvent.click(screen.getByLabelText('region'));
    expect(screen.queryByRole('button', { name: /Region/ })).not.toBeInTheDocument();
  });
  it('paginates and shows an empty state for unmatched search', () => {
    render(<OrdersTable rows={records.slice(0, 30)} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search orders'), { target: { value: 'no-such-customer' } });
    expect(screen.getByText('No matching orders. Try adjusting your filters.')).toBeInTheDocument();
  });
});
