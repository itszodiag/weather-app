import { useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage.js';

const STORAGE_KEY = 'weather-app-settings';
const DEFAULTS = { temperatureUnit: 'celsius', windUnit: 'kmh' };

function readSettings() {
  const stored = readJSON(STORAGE_KEY, {});
  return {
    temperatureUnit:
      stored?.temperatureUnit === 'fahrenheit'
        ? 'fahrenheit'
        : DEFAULTS.temperatureUnit,
    windUnit: ['kmh', 'ms', 'mph'].includes(stored?.windUnit)
      ? stored.windUnit
      : DEFAULTS.windUnit,
  };
}

export default function useSettings() {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    writeJSON(STORAGE_KEY, settings);
  }, [settings]);

  const updateSettings = (changes) => {
    setSettings((current) => ({ ...current, ...changes }));
  };

  return { ...settings, updateSettings };
}
