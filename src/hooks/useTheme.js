import { useEffect, useState } from 'react';

const STORAGE_KEY = 'weather-app-theme';
const DARK = 'dark';
const LIGHT = 'light';

function getInitialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
  } catch {
    // localStorage unavailable — fall back to default theme
  }
  return DARK;
}

/**
 * Toggles the dark/light theme on <html> and persists the choice.
 * Dark navy is the default theme.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(DARK, theme === DARK);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persisting is best-effort; the in-memory theme still works
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === DARK ? LIGHT : DARK));

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === DARK,
  };
}

export default useTheme;
