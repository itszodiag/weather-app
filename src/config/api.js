/**
 * Single configuration location for Open-Meteo endpoints.
 * Open-Meteo is keyless, so no API keys or environment variables are needed.
 */
export const API_CONFIG = Object.freeze({
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1',
  forecastBaseUrl: 'https://api.open-meteo.com/v1',
  language: 'en',
  geocodingCount: 8,
  timezone: 'auto',
  forecastDays: 7,
});
