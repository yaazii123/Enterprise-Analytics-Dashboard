import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LoginCarousel } from './LoginCarousel';
afterEach(cleanup);

describe('login carousel', () => {
  it('navigates slides, wraps around, and supports direct selection', () => {
    render(<LoginCarousel />);
    expect(screen.getByRole('heading', { name: 'Your next insight is already here.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByRole('heading', { name: 'Good insights deserve to travel.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('heading', { name: 'Your next insight is already here.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }));
    expect(screen.getByRole('heading', { name: 'A fresh perspective. Every time.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
  });
  it('supports keyboard navigation and lets the user control autoplay', () => {
    render(<LoginCarousel />);
    fireEvent.keyDown(screen.getByRole('region', { name: 'Explore Nexora' }), { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'A fresh perspective. Every time.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(screen.getByRole('button', { name: 'Pause slideshow' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeInTheDocument();
  });
});
