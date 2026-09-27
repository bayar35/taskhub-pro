import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Хайх...',
}: SearchBarProps) {
  const [input, setInput] = useState(value);
  const debouncedValue = useDebounce(input, 300);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Хайх"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>
      {input && (
        <button
          onClick={() => setInput('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Цэвэрлэх"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}