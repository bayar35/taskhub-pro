import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      type="button"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}