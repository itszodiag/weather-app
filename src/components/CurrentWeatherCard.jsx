import { ArrowDown, ArrowUp, Droplet, MapPin, Sunrise, Sunset } from 'lucide-react';
import Card from './ui/Card.jsx';
import { formatFullDate, formatHour, formatTemp } from '../utils/format.js';
import { getWeatherIcon, getWeatherLabel } from '../utils/weatherIcons.js';

/**
 * Hero card showing the current conditions for a location.
 * All values come in via props — nothing here is fetched or hardcoded as real.
 */
export default function CurrentWeatherCard({ location, current, temperatureUnit }) {
  const {
    temperature,
    feelsLike,
    high,
    low,
    precipitation,
    code,
    isDay = true,
    sunrise,
    sunset,
    updatedAt,
  } = current ?? {};
  const WeatherIcon = getWeatherIcon(code, isDay);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-accent/[0.18] via-card to-card">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate font-medium text-ink">
              {location?.name ?? '--'}
              {location?.country ? `, ${location.country}` : ''}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {formatFullDate(updatedAt)} · {formatHour(updatedAt)}
          </p>

          <div className="mt-4 flex items-start">
            <span className="text-6xl font-light tracking-tight sm:text-7xl">
              {formatTemp(temperature, temperatureUnit)}
            </span>
          </div>

          <p className="mt-1 text-lg font-medium">{getWeatherLabel(code)}</p>
          <p className="text-sm text-muted">
            Feels like {formatTemp(feelsLike, temperatureUnit)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <ArrowUp className="h-4 w-4 text-red-400" aria-hidden="true" />
              <span className="sr-only">High</span>
              <span className="font-medium tabular-nums">{formatTemp(high, temperatureUnit)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowDown className="h-4 w-4 text-sky-400" aria-hidden="true" />
              <span className="sr-only">Low</span>
              <span className="font-medium tabular-nums">{formatTemp(low, temperatureUnit)}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplet className="h-4 w-4 text-sky-400" aria-hidden="true" />
              <span className="sr-only">Precipitation</span>
              <span className="font-medium tabular-nums">
                {precipitation != null ? `${precipitation} mm` : '--'}
              </span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Sunrise
                className="h-4 w-4 text-amber-400"
                aria-hidden="true"
              />
              <span className="sr-only">Sunrise</span>
              {sunrise ? formatHour(sunrise) : '--'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sunset
                className="h-4 w-4 text-orange-400"
                aria-hidden="true"
              />
              <span className="sr-only">Sunset</span>
              {sunset ? formatHour(sunset) : '--'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 self-center sm:self-start">
          <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400/30 to-blue-600/20 p-5 ring-1 ring-edge">
            <WeatherIcon
              className="h-12 w-12 text-sky-300 sm:h-14 sm:w-14"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          {updatedAt ? (
            <span className="text-xs text-muted">
              Updated {formatHour(updatedAt)}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
