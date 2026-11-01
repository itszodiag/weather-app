import Card, { CardTitle } from './ui/Card.jsx';

export default function SettingsPanel({
  isDark,
  setTheme,
  temperatureUnit,
  windUnit,
  updateSettings,
}) {
  return (
    <Card className="settings-panel absolute right-0 top-12 z-50 w-[min(18rem,calc(100vw-2rem))] shadow-xl">
      <CardTitle>Settings</CardTitle>
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
          Theme
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['light', 'Light'],
            ['dark', 'Dark'],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-edge p-2.5 text-sm">
              <input
                type="radio"
                name="theme"
                checked={(isDark ? 'dark' : 'light') === value}
                onChange={() => setTheme(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
          Temperature
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['celsius', 'Celsius (°C)'],
            ['fahrenheit', 'Fahrenheit (°F)'],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-edge p-2.5 text-sm">
              <input
                type="radio"
                name="temperature-unit"
                checked={temperatureUnit === value}
                onChange={() => updateSettings({ temperatureUnit: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-4 space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">
          Wind speed
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {[
            ['kmh', 'km/h'],
            ['ms', 'm/s'],
            ['mph', 'mph'],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-1 rounded-lg border border-edge p-2.5 text-sm">
              <input
                type="radio"
                name="wind-unit"
                checked={windUnit === value}
                onChange={() => updateSettings({ windUnit: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    </Card>
  );
}
