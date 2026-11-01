/** Temperature in whole Celsius degrees, or a clear placeholder when unavailable. */
export function formatTemp(value, unit = 'celsius') {
  if (value == null || Number.isNaN(value)) {
    return `--°${unit === 'fahrenheit' ? 'F' : 'C'}`;
  }
  const converted = unit === 'fahrenheit' ? (value * 9) / 5 + 32 : value;
  return `${Math.round(converted)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

export function temperatureUnitLabel(unit) {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatWind(value, unit = 'kmh') {
  if (value == null || Number.isNaN(value)) return '--';
  const conversions = {
    kmh: [value, 'km/h'],
    ms: [value / 3.6, 'm/s'],
    mph: [value * 0.621371, 'mph'],
  };
  const [converted, label] = conversions[unit] ?? conversions.kmh;
  return `${Math.round(converted * 10) / 10} ${label}`;
}

/** Parse an ISO date or datetime safely for display (date-only anchored to noon). */
function parseDate(iso) {
  if (!iso) return null;
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
}

/** e.g. "2 PM" */
export function formatHour(iso) {
  const localMatch =
    typeof iso === 'string' && iso.match(/T(\d{2}):(\d{2})/);
  if (localMatch) {
    const hour = Number(localMatch[1]);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${localMatch[2]} ${period}`;
  }
  const date = parseDate(iso);
  if (!date || Number.isNaN(date.getTime())) return '--';
  return date
    .toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (period) => period.toUpperCase());
}

/** e.g. "Sun" */
export function formatWeekday(iso) {
  const date = parseDate(iso);
  if (!date || Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString([], { weekday: 'short' });
}

/** e.g. "Nov 1"; date-only API values are treated as local calendar dates. */
export function formatDate(iso) {
  const date = parseDate(iso);
  if (!date || Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** e.g. "Sunday, November 1" */
export function formatFullDate(iso) {
  const date = parseDate(iso);
  if (!date || Number.isNaN(date.getTime())) return '---';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Degrees to compass label, e.g. 250 -> "WSW" */
export function formatWindDirection(degrees) {
  if (degrees == null || Number.isNaN(degrees)) return '';
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
}

/** Qualitative UV index label. */
export function formatUvLabel(value) {
  if (value == null || Number.isNaN(value)) return '';
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Moderate';
  if (value <= 7) return 'High';
  if (value <= 10) return 'Very high';
  return 'Extreme';
}
