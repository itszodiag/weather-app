import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card, { CardTitle } from './ui/Card.jsx';
import { formatDate, formatHour, formatTemp, temperatureUnitLabel } from '../utils/format.js';

const chartMargin = { top: 8, right: 8, left: -18, bottom: 0 };

function ChartEmpty({ children }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

function TemperatureTooltip({ active, payload, label, temperatureUnit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-edge bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatTemp(item.value, temperatureUnit)}
        </p>
      ))}
    </div>
  );
}

function ChartFrame({ children }) {
  return <div className="h-48 w-full min-w-0 overflow-hidden sm:h-56">{children}</div>;
}

/** Responsive temperature charts built from the normalized API model. */
export default function WeatherCharts({ hours = [], days = [], temperatureUnit }) {
  const hourlyData = hours
    .filter((hour) => hour.temperature != null)
    .map((hour) => ({
      ...hour,
      label: formatHour(hour.time),
    }));
  const dailyData = days
    .slice(0, 7)
    .filter((day) => day.min != null || day.max != null)
    .map((day, index) => ({
      ...day,
      label: index === 0 ? 'Today' : formatDate(day.date),
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardTitle hint={temperatureUnitLabel(temperatureUnit)}>Hourly temperature</CardTitle>
        {hourlyData.length < 2 ? (
          <ChartEmpty>No hourly temperature data available.</ChartEmpty>
        ) : (
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={chartMargin}>
                <CartesianGrid stroke="var(--edge)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  interval="preserveStartEnd"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  tickFormatter={(value) => formatTemp(value, temperatureUnit)}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                />
                <Tooltip content={<TemperatureTooltip temperatureUnit={temperatureUnit} />} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        )}
      </Card>

      <Card>
        <CardTitle hint={temperatureUnitLabel(temperatureUnit)}>Temperature trend</CardTitle>
        {dailyData.length < 2 ? (
          <ChartEmpty>No daily temperature data available.</ChartEmpty>
        ) : (
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={chartMargin}>
                <CartesianGrid stroke="var(--edge)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  tickFormatter={(value) => formatTemp(value, temperatureUnit)}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                />
                <Tooltip content={<TemperatureTooltip temperatureUnit={temperatureUnit} />} />
                <Line
                  type="monotone"
                  dataKey="max"
                  name="High"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="min"
                  name="Low"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartFrame>
        )}
      </Card>
    </div>
  );
}
