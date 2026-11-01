import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatHour,
  formatTemp,
  formatWind,
} from '../utils/format.js';
import { getWeatherLabel } from '../utils/weatherIcons.js';

describe('weather formatting utilities', () => {
  it('maps documented weather codes to readable descriptions', () => {
    expect(getWeatherLabel(0)).toBe('Clear sky');
    expect(getWeatherLabel(45)).toBe('Fog');
    expect(getWeatherLabel(63)).toBe('Moderate rain');
    expect(getWeatherLabel(73)).toBe('Moderate snow fall');
    expect(getWeatherLabel(95)).toBe('Thunderstorm');
    expect(getWeatherLabel(999)).toBe('Unknown');
  });

  it('formats Celsius and converts Celsius to Fahrenheit once', () => {
    expect(formatTemp(20)).toBe('20°C');
    expect(formatTemp(20, 'fahrenheit')).toBe('68°F');
    expect(formatTemp(null, 'fahrenheit')).toBe('--°F');
  });

  it('converts canonical km/h wind values to supported units', () => {
    expect(formatWind(36, 'kmh')).toBe('36 km/h');
    expect(formatWind(36, 'ms')).toBe('10 m/s');
    expect(formatWind(36, 'mph')).toBe('22.4 mph');
    expect(formatWind(null, 'mph')).toBe('--');
  });

  it('formats local API timestamps without applying browser timezone conversion', () => {
    expect(formatHour('2026-11-02T00:00')).toBe('12:00 AM');
    expect(formatDate('2026-11-02')).toMatch(/(?:Nov 2|2 Nov)/i);
    expect(formatHour(null)).toBe('--');
  });
});
