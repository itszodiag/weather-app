import { API_CONFIG } from '../config/api.js';
import { getJSON } from './http.js';

/**
 * Normalizes a geocoding result to the fields the app needs:
 * name, country, latitude, longitude and timezone (when available).
 * Identical city names in different countries stay distinct via
 * country/admin1 and the unique geocoding id.
 */
function normalizeResult(result) {
  return {
    id: result.id ?? `${result.latitude},${result.longitude}`,
    name: result.name ?? '',
    country: result.country ?? '',
    countryCode: result.country_code ?? '',
    admin1: result.admin1 ?? '',
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? null,
  };
}

/**
 * Search for cities by name via the Open-Meteo Geocoding API.
 * Returns [] for empty queries and for searches with no matches;
 * throws ApiError for network/HTTP failures.
 */
export async function searchCities(
  query,
  { signal, count = API_CONFIG.geocodingCount } = {}
) {
  const trimmed = (query ?? '').trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: String(count),
    language: API_CONFIG.language,
    format: 'json',
  });

  const data = await getJSON(
    `${API_CONFIG.geocodingBaseUrl}/search?${params}`,
    { signal, service: 'city search service' }
  );

  // Unknown cities simply come back without a `results` array.
  const results = Array.isArray(data?.results) ? data.results : [];
  return results
    .filter(
      (item) =>
        item &&
        item.name &&
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number'
    )
    .map(normalizeResult);
}

export default searchCities;
