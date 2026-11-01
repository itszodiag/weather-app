import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities } from '../services/geocoding.js';
import { ApiError } from '../services/http.js';
import {
  geocodingEmptyResponse,
  geocodingResponse,
  jsonResponse,
} from './fixtures.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('returns [] for empty queries without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await searchCities('')).toEqual([]);
    expect(await searchCities('   ')).toEqual([]);
    expect(await searchCities(null)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes name, country, latitude, longitude and timezone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(geocodingResponse))
    );

    const cities = await searchCities('Paris');

    expect(cities).toHaveLength(2);
    expect(cities[0]).toMatchObject({
      name: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: 'Europe/Paris',
    });
  });

  it('keeps identically named cities in different countries distinct', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(geocodingResponse))
    );

    const cities = await searchCities('Paris');
    const countries = cities.map((city) => city.country);

    expect(countries).toContain('France');
    expect(countries).toContain('United States');
    expect(cities[0].id).not.toBe(cities[1].id);
  });

  it('returns [] when the API reports no matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(geocodingEmptyResponse))
    );

    expect(await searchCities('Qwertyuiopasdfgh')).toEqual([]);
  });

  it('throws a friendly ApiError on non-successful HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );

    await expect(searchCities('Paris')).rejects.toThrow(
      /city search service.*HTTP 500/i
    );
    await expect(searchCities('Paris')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws a friendly ApiError on network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );

    await expect(searchCities('Paris')).rejects.toThrow(/internet connection/i);
  });

  it('propagates AbortError untouched so cancellations are not treated as failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))
    );

    await expect(searchCities('Paris')).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
