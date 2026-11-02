import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CustomersTable } from './CustomersTable';
const customers = Array.from({ length: 40 }, (_, i) => ({ name: `Customer ${i}`, email: `client${i}@example.com`, region: 'Europe', orders: i + 1, revenue: i * 100, firstOrder: '2026-01-01', lastOrder: '2026-11-03' }));
afterEach(cleanup);
describe('customer directory', () => {
  it('paginates the full directory and searches hidden email addresses', () => {
    render(<CustomersTable customers={customers} />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next customer page'));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search customers'), { target: { value: 'client31@example.com' } });
    expect(screen.getByText('Customer 31')).toBeInTheDocument();
    expect(screen.getByText('1 customers')).toBeInTheDocument();
  });
});
