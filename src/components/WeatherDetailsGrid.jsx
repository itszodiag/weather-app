import {
  Droplets,
  Eye,
  Gauge,
  CloudRain,
  Compass,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from 'lucide-react';
import Card, { CardTitle } from './ui/Card.jsx';
import {
  formatHour,
  formatTemp,
  formatWind,
  formatUvLabel,
  formatWindDirection,
} from '../utils/format.js';

/**
 * Grid of secondary weather details. Values arrive via props as a
 * `details` object; formatting stays here (presentation only).
 */
export default function WeatherDetailsGrid({ details, temperatureUnit, windUnit }) {
  const {
    feelsLike,
    humidity,
    precipitation,
    precipitationProbability,
    windSpeed,
    windDirection,
    uvIndex,
    visibility,
    pressure,
    sunrise,
    sunset,
  } = details ?? {};

  const items = [
    {
      key: 'feels-like',
      label: 'Feels like',
      icon: Thermometer,
      value: formatTemp(feelsLike, temperatureUnit),
    },
    {
      key: 'humidity',
      label: 'Humidity',
      icon: Droplets,
      value: humidity != null ? `${humidity}%` : '--',
    },
    {
      key: 'wind',
      label: 'Wind',
      icon: Wind,
      value: formatWind(windSpeed, windUnit),
      hint: formatWindDirection(windDirection),
    },
    {
      key: 'precipitation',
      label: 'Precipitation',
      icon: CloudRain,
      value: precipitation != null ? `${precipitation} mm` : '--',
    },
    {
      key: 'precipitation-probability',
      label: 'Rain chance',
      icon: Droplets,
      value:
        precipitationProbability != null
          ? `${precipitationProbability}%`
          : '--',
    },
    {
      key: 'uv-index',
      label: 'UV index',
      icon: Sun,
      value: uvIndex != null ? `${uvIndex}` : '--',
      hint: formatUvLabel(uvIndex),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      icon: Eye,
      value: visibility != null ? `${visibility} km` : '--',
    },
    {
      key: 'wind-direction',
      label: 'Wind direction',
      icon: Compass,
      value: formatWindDirection(windDirection) || '--',
    },
    {
      key: 'pressure',
      label: 'Pressure',
      icon: Gauge,
      value: pressure != null ? `${pressure} hPa` : '--',
    },
    {
      key: 'sunrise',
      label: 'Sunrise time',
      icon: Sunrise,
      value: sunrise ? formatHour(sunrise) : '--',
    },
    {
      key: 'sunset',
      label: 'Sunset time',
      icon: Sunset,
      value: sunset ? formatHour(sunset) : '--',
    },
  ];

  return (
    <Card>
      <CardTitle>Weather details</CardTitle>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              className="rounded-xl border border-edge bg-surface/60 p-4 transition-colors hover:border-accent/30"
            >
              <div className="flex items-center gap-2 text-muted">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-xs uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="mt-2 text-lg font-semibold tabular-nums">{item.value}</p>
              {item.hint ? (
                <p className="text-xs text-muted">{item.hint}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
