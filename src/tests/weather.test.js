import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchForecast, normalizeForecast } from '../services/weather.js';
import { ApiError } from '../services/http.js';
import { forecastResponse, jsonResponse } from './fixtures.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchForecast', () => {
  it('requests only the required variables with timezone=auto and 7 days', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(forecastResponse));
    vi.stubGlobal('fetch', fetchMock);

    await fetchForecast({ latitude: 48.8566, longitude: 2.3522 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain('api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=48.8566');
    expect(url).toContain('longitude=2.3522');
    expect(url).toContain('timezone=auto');
    expect(url).toContain('forecast_days=7');

    const params = new URL(url).searchParams;
    const current = params.get('current').split(',');
    expect(current).toEqual(
      expect.arrayContaining([
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'precipitation',
        'weather_code',
        'is_day',
        'wind_speed_10m',
      ])
    );
    expect(params.get('hourly').split(',')).toEqual(
      expect.arrayContaining([
        'temperature_2m',
        'weather_code',
        'precipitation_probability',
      ])
    );
    expect(params.get('daily').split(',')).toEqual(
      expect.arrayContaining([
        'temperature_2m_max',
        'temperature_2m_min',
        'weather_code',
        'sunrise',
        'sunset',
      ])
    );
  });

  it('returns a normalized model with a 24-hour window starting now', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(forecastResponse))
    );

    const model = await fetchForecast({
      latitude: 48.8566,
      longitude: 2.3522,
    });

    expect(model.current).toMatchObject({
      temperature: 15.4,
      feelsLike: 14.2,
      humidity: 71,
      windSpeed: 12.6,
      precipitation: 0.4,
      code: 3,
      isDay: true,
      high: 18,
      low: 11,
      sunrise: '2026-11-01T07:12', // UTC offset stripped for local display
      sunset: '2026-11-01T17:05',
    });
    expect(model.current.visibility).toBe(18); // metres -> km

    // 14:15 -> window starts at 14:00, crosses midnight, and covers 24 hours
    expect(model.hourly).toHaveLength(24);
    expect(model.hourly[0].time).toBe('2026-11-01T14:00');
    expect(model.hourly[0].isCurrent).toBe(true);
    expect(model.hourly[10].time).toBe('2026-11-02T00:00');
    expect(model.hourly[2].precipitationProbability).toBe(50);
    expect(model.hourly[0]).toHaveProperty('temperature');
    expect(model.hourly[0]).toHaveProperty('code');

    expect(model.daily).toHaveLength(7);
    expect(model.daily[0]).toEqual({
      date: '2026-11-01',
      min: 11,
      max: 18,
      code: 3,
      precipitationProbability: 20,
    });
  });

  it('throws a readable ApiError when required fields are missing', async () => {
    const broken = { ...forecastResponse, current: { ...forecastResponse.current } };
    delete broken.current.temperature_2m;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(broken)));

    await expect(
      fetchForecast({ latitude: 1, longitude: 2 })
    ).rejects.toThrow(/incomplete data/i);
  });

  it('throws a readable ApiError on non-successful HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({}) })
    );

    await expect(
      fetchForecast({ latitude: 999, longitude: 0 })
    ).rejects.toThrow(/weather service responded with an error \(HTTP 400\)/i);
  });

  it('throws a readable ApiError on network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );

    await expect(
      fetchForecast({ latitude: 1, longitude: 2 })
    ).rejects.toThrow(/internet connection/i);
  });

  it('rejects when coordinates are missing', async () => {
    await expect(fetchForecast({})).rejects.toBeInstanceOf(ApiError);
    await expect(fetchForecast({})).rejects.toThrow(/coordinates/i);
  });
});

describe('normalizeForecast', () => {
  it('throws on non-object responses', () => {
    expect(() => normalizeForecast(null)).toThrow(ApiError);
    expect(() => normalizeForecast('nope')).toThrow(ApiError);
  });
});
