/** Minimal fetch Response stand-in for getJSON-based services. */
export function jsonResponse(data) {
  return { ok: true, status: 200, json: async () => data };
}

/** Geocoding response containing two identically named cities (France/Texas). */
export const geocodingResponse = {
  results: [
    {
      id: 2988507,
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      country: 'France',
      country_code: 'FR',
      admin1: 'Île-de-France',
      timezone: 'Europe/Paris',
    },
    {
      id: 4644585,
      name: 'Paris',
      latitude: 33.6609,
      longitude: -95.5555,
      country: 'United States',
      country_code: 'US',
      admin1: 'Texas',
      timezone: 'America/Chicago',
    },
  ],
};

/** Geocoding response for a name that matches nothing. */
export const geocodingEmptyResponse = { generationtime_ms: 0.4 };

function buildHourlyTimes(count) {
  const times = [];
  let day = 1;
  let hour = 0;
  for (let i = 0; i < count; i += 1) {
    times.push(
      `2026-11-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00`
    );
    hour += 1;
    if (hour === 24) {
      hour = 0;
      day += 1;
    }
  }
  return times;
}

const hourlyTimes = buildHourlyTimes(48);

export const forecastResponse = {
  latitude: 48.85,
  longitude: 2.35,
  timezone: 'Europe/Paris',
  current: {
    time: '2026-11-01T14:15',
    interval: 900,
    temperature_2m: 15.4,
    apparent_temperature: 14.2,
    relative_humidity_2m: 71,
    precipitation: 0.4,
    weather_code: 3,
    is_day: 1,
    wind_speed_10m: 12.6,
    wind_direction_10m: 220,
    surface_pressure: 1015.2,
    uv_index: 2.6,
    visibility: 18000,
  },
  hourly: {
    time: hourlyTimes,
    temperature_2m: hourlyTimes.map((_, i) => 10 + (i % 8)),
    weather_code: hourlyTimes.map(() => 3),
    is_day: hourlyTimes.map((_, i) => (i >= 7 && i <= 18 ? 1 : 0)),
    precipitation_probability: hourlyTimes.map((_, i) => i % 4 === 0 ? 50 : 0),
  },
  daily: {
    time: ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'],
    weather_code: [3, 61, 3, 80, 1, 0, 2],
    temperature_2m_max: [18, 17, 16, 15, 17, 19, 20],
    temperature_2m_min: [11, 10, 9, 8, 10, 11, 12],
    precipitation_probability_max: [20, 60, 30, 70, 10, 5, 15],
    sunrise: [
      '2026-11-01T07:12+01:00',
      '2026-11-02T07:13+01:00',
      '2026-11-03T07:15+01:00',
      '2026-11-04T07:16+01:00',
      '2026-11-05T07:18+01:00',
      '2026-11-06T07:19+01:00',
      '2026-11-07T07:21+01:00',
    ],
    sunset: [
      '2026-11-01T17:05+01:00',
      '2026-11-02T17:04+01:00',
      '2026-11-03T17:03+01:00',
      '2026-11-04T17:02+01:00',
      '2026-11-05T17:01+01:00',
      '2026-11-06T17:00+01:00',
      '2026-11-07T16:59+01:00',
    ],
  },
};
