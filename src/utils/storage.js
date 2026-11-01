/** Best-effort JSON persistence (localStorage) that never throws. */
export function readJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode/quota) — persistence is best-effort
  }
}

function fallbackFavoriteId(favorite) {
  const name = String(favorite.name ?? '').trim().toLowerCase();
  const country = String(favorite.country ?? '').trim().toLowerCase();
  return `${name}|${country}|${favorite.latitude}|${favorite.longitude}`;
}

/** Return safe, location-only favorite records from persisted JSON. */
export function readFavorites(key, fallback = []) {
  const stored = readJSON(key, fallback);
  if (!Array.isArray(stored)) return [];

  const seen = new Set();
  return stored
    .filter(
      (favorite) =>
        favorite &&
        typeof favorite.name === 'string' &&
        typeof favorite.latitude === 'number' &&
        Number.isFinite(favorite.latitude) &&
        typeof favorite.longitude === 'number' &&
        Number.isFinite(favorite.longitude)
    )
    .map((favorite) => {
      const id =
        favorite.id != null && String(favorite.id).trim()
          ? String(favorite.id)
          : fallbackFavoriteId(favorite);
      return {
        id,
        name: favorite.name.trim(),
        country: typeof favorite.country === 'string' ? favorite.country : '',
        latitude: favorite.latitude,
        longitude: favorite.longitude,
        timezone: typeof favorite.timezone === 'string' ? favorite.timezone : null,
      };
    })
    .filter((favorite) => {
      if (seen.has(favorite.id)) return false;
      seen.add(favorite.id);
      return true;
    });
}
