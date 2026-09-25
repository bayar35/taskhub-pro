import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../src/pages/NotFoundPage';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('NotFoundPage', () => {
  it('should render 404 heading', () => {
    renderWithRouter(<NotFoundPage />);
    expect(
      screen.getByRole('heading', { name: '404' })
    ).toBeInTheDocument();
  });

  it('should render "Хуудас олдсонгүй" message', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText('Хуудас олдсонгүй')).toBeInTheDocument();
  });

  it('should render a link back to home page', () => {
    renderWithRouter(<NotFoundPage />);
    const homeLink = screen.getByRole('link', { name: 'Нүүр хуудас' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should apply correct CSS classes to the container', () => {
    const { container } = renderWithRouter(<NotFoundPage />);
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('min-h-screen');
    expect(outerDiv).toHaveClass('flex');
  });
});