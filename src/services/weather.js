import { API_CONFIG } from '../config/api.js';
import { ApiError, getJSON, MissingDataError } from './http.js';

/** Only the variables the dashboard actually renders. */
const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation',
  'weather_code',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
  'uv_index',
  'visibility',
];
const HOURLY_FIELDS = [
  'temperature_2m',
  'weather_code',
  'is_day',
  'precipitation_probability',
];
const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
];

const INVALID_RESPONSE =
  'The weather service returned incomplete data. Please try again.';

function requireArray(container, key) {
  const value = container?.[key];
  if (!Array.isArray(value) || value.length === 0) {
    throw new MissingDataError(INVALID_RESPONSE);
  }
  return value;
}

/** Strip any UTC offset so city-local times display as returned. */
function localTime(value) {
  return typeof value === 'string' ? value.slice(0, 16) : value;
}

/**
 * Validates an Open-Meteo forecast response and normalizes it into the
 * dashboard model: current conditions (incl. today's high/low, sunrise,
 * sunset), the next hours and the 7-day outlook.
 * Throws ApiError when required fields are missing.
 */
export function normalizeForecast(data, { maxHours = 24 } = {}) {
  if (!data || typeof data !== 'object') throw new MissingDataError(INVALID_RESPONSE);

  const current = data.current;
  if (
    !current ||
    typeof current.time !== 'string' ||
    current.temperature_2m == null ||
    current.weather_code == null ||
    current.is_day == null
  ) {
    throw new MissingDataError(INVALID_RESPONSE);
  }

  const hourlyTimes = requireArray(data.hourly, 'time');
  const hourlyTemps = requireArray(data.hourly, 'temperature_2m');
  const hourlyCodes = requireArray(data.hourly, 'weather_code');
  const hourlyIsDay = requireArray(data.hourly, 'is_day');
  const hourlyPrecipitation = data.hourly?.precipitation_probability;
  if (
    hourlyTemps.length < hourlyTimes.length ||
    hourlyCodes.length < hourlyTimes.length ||
    hourlyIsDay.length < hourlyTimes.length
  ) {
    throw new MissingDataError(INVALID_RESPONSE);
  }

  const dailyDates = requireArray(data.daily, 'time');
  const dailyMax = requireArray(data.daily, 'temperature_2m_max');
  const dailyMin = requireArray(data.daily, 'temperature_2m_min');
  const dailyCodes = requireArray(data.daily, 'weather_code');
  const dailySunrise = data.daily?.sunrise;
  const dailySunset = data.daily?.sunset;
  if (
    dailyMax.length < dailyDates.length ||
    dailyMin.length < dailyDates.length ||
    dailyCodes.length < dailyDates.length
  ) {
    throw new MissingDataError(INVALID_RESPONSE);
  }

  // Window the hourly data to the next N hours starting at the current hour.
  const currentHour = `${current.time.slice(0, 13)}:00`;
  let start = hourlyTimes.findIndex((time) => time >= currentHour);
  if (start < 0) start = 0;
  const hourly = [];
  for (
    let i = start;
    i < hourlyTimes.length && hourly.length < maxHours;
    i += 1
  ) {
    hourly.push({
      time: hourlyTimes[i],
      temperature: hourlyTemps[i],
      code: hourlyCodes[i],
      isDay: hourlyIsDay[i] === 1,
      precipitationProbability: Array.isArray(hourlyPrecipitation)
        ? hourlyPrecipitation[i] ?? null
        : null,
      isCurrent: hourlyTimes[i] === currentHour,
    });
  }
  const currentHourly = hourly.find((hour) => hour.isCurrent);

  const daily = dailyDates.map((date, index) => ({
    date,
    min: dailyMin[index],
    max: dailyMax[index],
    code: dailyCodes[index],
    precipitationProbability: data.daily.precipitation_probability_max
      ? data.daily.precipitation_probability_max[index] ?? null
      : null,
  }));

  return {
    current: {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windDirection: current.wind_direction_10m ?? null,
      precipitation: current.precipitation ?? null,
      precipitationProbability: currentHourly?.precipitationProbability ?? null,
      pressure: current.surface_pressure ?? null,
      uvIndex: current.uv_index ?? null,
      visibility:
        current.visibility != null
          ? Math.round(current.visibility / 1000)
          : null,
      code: current.weather_code,
      isDay: current.is_day === 1,
      sunrise: Array.isArray(dailySunrise) ? localTime(dailySunrise[0]) : null,
      sunset: Array.isArray(dailySunset) ? localTime(dailySunset[0]) : null,
      high: dailyMax[0],
      low: dailyMin[0],
      updatedAt: localTime(current.time),
    },
    hourly,
    daily,
  };
}

/**
 * Fetch the forecast for a location. Aborts when `signal` is aborted;
 * throws ApiError with a user-readable message on failure.
 */
export async function fetchForecast(
  { latitude, longitude, timezone = API_CONFIG.timezone },
  { signal } = {}
) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new ApiError('No location coordinates were provided.');
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    current: CURRENT_FIELDS.join(','),
    hourly: HOURLY_FIELDS.join(','),
    daily: DAILY_FIELDS.join(','),
    forecast_days: String(API_CONFIG.forecastDays),
  });

  const data = await getJSON(
    `${API_CONFIG.forecastBaseUrl}/forecast?${params}`,
    { signal }
  );
  return normalizeForecast(data);
}

export default fetchForecast;
