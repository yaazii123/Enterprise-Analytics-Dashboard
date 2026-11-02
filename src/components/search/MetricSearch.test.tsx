import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { store, actions } from '@/store';
import { MetricSearch } from './MetricSearch';
function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.hash}</output>; }
function setup(role: 'admin' | 'analyst' = 'admin') {
  store.dispatch(actions.login({ id: 'test', name: 'Test', email: 'test@example.com', role, avatarInitials: 'TE', title: 'Test' }));
  render(<Provider store={store}><MemoryRouter><MetricSearch /><Location /></MemoryRouter></Provider>);
}
afterEach(() => { cleanup(); store.dispatch(actions.logout()); vi.restoreAllMocks(); });
describe('metric search', () => {
  it('searches chart titles and navigates to the matching section', () => {
    setup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Product refund' } });
    fireEvent.click(screen.getByRole('option', { name: /Product refund rates/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/products#Product%20refund%20rates');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('supports keyboard metric selection and excludes restricted customer results', () => {
    setup('analyst');
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Returning customer' } });
    expect(screen.getByText('No matching charts or metrics.')).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Total revenue' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByTestId('location')).toHaveTextContent('/overview#Total%20revenue');
  });
});
