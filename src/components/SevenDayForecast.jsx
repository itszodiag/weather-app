import { Droplet } from 'lucide-react';
import Card, { CardTitle } from './ui/Card.jsx';
import { formatDate, formatTemp, formatWeekday } from '../utils/format.js';
import { getWeatherIcon, getWeatherLabel } from '../utils/weatherIcons.js';

/**
 * Seven-day forecast list with a min/max range bar per day.
 * Purely presentational — receives days via props.
 */
export default function SevenDayForecast({ days = [], temperatureUnit }) {
  const availableDays = days.slice(0, 7);
  const numericMins = availableDays
    .map((day) => day.min)
    .filter((value) => Number.isFinite(value));
  const numericMaxes = availableDays
    .map((day) => day.max)
    .filter((value) => Number.isFinite(value));
  const weekMin = numericMins.length ? Math.min(...numericMins) : 0;
  const weekMax = numericMaxes.length ? Math.max(...numericMaxes) : 1;
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <Card>
      <CardTitle hint="This week">7-day forecast</CardTitle>
      {availableDays.length === 0 ? (
        <p className="py-4 text-sm text-muted">No daily data available.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {availableDays.map((day, index) => {
            const WeatherIcon = getWeatherIcon(day.code, true);
            const hasRange =
              Number.isFinite(day.min) && Number.isFinite(day.max);
            const left = hasRange ? ((day.min - weekMin) / span) * 100 : 0;
            const width = hasRange
              ? Math.max(((day.max - day.min) / span) * 100, 4)
              : 0;
            const isToday = index === 0;
            return (
              <li
                key={day.date}
                aria-current={isToday ? 'date' : undefined}
                className={`rounded-xl border p-3 transition-colors hover:border-accent/40 sm:p-4 ${
                  isToday
                    ? 'border-accent/50 bg-accent-soft/50'
                    : 'border-edge bg-surface/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {isToday ? 'Today' : formatWeekday(day.date)}
                    </p>
                    <p className="text-xs text-muted">{formatDate(day.date)}</p>
                  </div>
                  <WeatherIcon
                    className="h-7 w-7 shrink-0 text-sky-300"
                    strokeWidth={1.75}
                    aria-label={getWeatherLabel(day.code)}
                  />
                </div>
                <p className="mt-3 truncate text-xs text-muted">
                  {getWeatherLabel(day.code)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted">{formatTemp(day.min, temperatureUnit)}</span>
                  <span
                    className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-edge"
                    aria-hidden="true"
                  >
                    {hasRange ? (
                      <span
                        className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-500 to-blue-400"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    ) : null}
                  </span>
                  <span className="font-semibold">{formatTemp(day.max, temperatureUnit)}</span>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                  <Droplet className="h-3 w-3" aria-hidden="true" />
                  {day.precipitationProbability != null
                    ? `${day.precipitationProbability}%`
                    : '--'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
