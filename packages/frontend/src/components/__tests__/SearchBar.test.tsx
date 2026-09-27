import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar onChange={vi.fn()} placeholder="Хайх..." />);
    expect(screen.getByPlaceholderText('Хайх...')).toBeInTheDocument();
  });

  it('calls onChange after debounce', async () => {
    const handleChange = vi.fn();
    render(<SearchBar onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'react' } });

    await waitFor(
      () => {
        expect(handleChange).toHaveBeenCalledWith('react');
      },
      { timeout: 500 }
    );
  });

  it('shows clear button when text is entered', () => {
    render(<SearchBar onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByLabelText('Цэвэрлэх')).toBeInTheDocument();
  });

  it('clears input when clear button clicked', () => {
    render(<SearchBar onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(screen.getByLabelText('Цэвэрлэх'));

    expect(input).toHaveValue('');
  });
});