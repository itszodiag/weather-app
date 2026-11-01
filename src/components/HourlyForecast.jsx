import Card, { CardTitle } from './ui/Card.jsx';
import { formatHour, formatTemp } from '../utils/format.js';
import { getWeatherIcon } from '../utils/weatherIcons.js';

/**
 * Horizontally scrollable hourly forecast. Optimized for mobile with
 * snap scrolling; hours come in via props.
 */
export default function HourlyForecast({ hours = [], temperatureUnit }) {
  return (
    <Card>
      <CardTitle hint="Next 24 hours">Hourly forecast</CardTitle>
      {hours.length === 0 ? (
        <p className="py-4 text-sm text-muted">No hourly data available.</p>
      ) : (
        <ul
          aria-label="Hourly weather forecast"
          className="-mx-1 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2"
        >
          {hours.map((hour, index) => {
            const WeatherIcon = getWeatherIcon(hour.code, hour.isDay);
            const isCurrent = hour.isCurrent ?? index === 0;
            return (
              <li
                key={hour.time}
                aria-current={isCurrent ? 'true' : undefined}
                className={`flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-colors hover:border-edge hover:bg-accent-soft ${
                  isCurrent
                    ? 'border-accent/50 bg-accent-soft ring-1 ring-accent/20'
                    : 'border-transparent'
                }`}
              >
                <span className="text-xs font-medium text-muted">
                  {formatHour(hour.time)}
                </span>
                {isCurrent ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Now
                  </span>
                ) : (
                  <span className="h-[15px]" aria-hidden="true" />
                )}
                <WeatherIcon
                  className="h-6 w-6 text-sky-300"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold tabular-nums">
                  {formatTemp(hour.temperature, temperatureUnit)}
                </span>
                <span className="text-[11px] tabular-nums text-muted">
                  {hour.precipitationProbability != null
                    ? `${hour.precipitationProbability}%`
                    : '--'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
