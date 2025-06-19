import { useEffect, useState } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const handleSystemTheme = () => {
    setTheme(getSystemTheme());
  };

  return (
    <div className="flex items-center justify-center space-x-1 rounded-full bg-white/80 p-1 shadow-lg ring-1 ring-gray-900/5 backdrop-blur dark:bg-gray-800/90 dark:ring-white/10">
      <button
        onClick={() => setTheme('light')}
        className={`rounded-full p-2 transition-colors ${
          theme === 'light'
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
        }`}
        aria-label="Light mode"
      >
        <SunIcon className="h-5 w-5" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`rounded-full p-2 transition-colors ${
          theme === 'dark'
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
        }`}
        aria-label="Dark mode"
      >
        <MoonIcon className="h-5 w-5" />
      </button>
      
      <button
        onClick={handleSystemTheme}
        className={`rounded-full p-2 transition-colors ${
          theme === getSystemTheme() && theme !== 'light' && theme !== 'dark'
            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
        }`}
        aria-label="System theme"
      >
        <ComputerDesktopIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ThemeToggle;
