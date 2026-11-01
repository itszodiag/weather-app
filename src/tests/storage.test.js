import { beforeEach, describe, expect, it } from 'vitest';
import { readFavorites, readJSON } from '../utils/storage.js';

beforeEach(() => window.localStorage.clear());

describe('storage utilities', () => {
  it('falls back safely for malformed JSON', () => {
    window.localStorage.setItem('broken', '{not-json');
    expect(readJSON('broken', { safe: true })).toEqual({ safe: true });
  });

  it('sanitizes and deduplicates persisted favorites', () => {
    window.localStorage.setItem(
      'favorites',
      JSON.stringify([
        {
          id: 1,
          name: 'Paris',
          country: 'France',
          latitude: 48.8566,
          longitude: 2.3522,
          timezone: 'Europe/Paris',
          temperature: 18,
        },
        {
          id: 1,
          name: 'Duplicate',
          latitude: 0,
          longitude: 0,
        },
        { name: 'Invalid', latitude: '48', longitude: 2 },
      ])
    );

    expect(readFavorites('favorites')).toEqual([
      {
        id: '1',
        name: 'Paris',
        country: 'France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
      },
    ]);
  });
});
