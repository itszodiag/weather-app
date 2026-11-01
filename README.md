# Weather Dashboard

A responsive React weather dashboard powered by live Open-Meteo forecast and
geocoding data. Search for a city, inspect current conditions and forecasts,
view temperature charts, optionally use browser geolocation, save favorite
cities, and persist theme and unit preferences.

## Technology stack

- React 19
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Vitest
- React Testing Library

## Installation

Requirements:

- Node.js with npm
- Network access to the Open-Meteo APIs

Install dependencies:

```bash
npm install
```

## Development

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite. Browser geolocation generally requires HTTPS or
`localhost`.

## Testing

Run the deterministic Vitest suite:

```bash
npm test -- --run
```

Run Vitest in watch mode:

```bash
npm run test:watch
```

Tests mock external API responses and do not require live weather data.

## Production build

Create the deployable production bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

## Weather API attribution

Weather forecasts and city geocoding are provided by
[Open-Meteo](https://open-meteo.com/). The application uses the documented
Open-Meteo WMO weather codes for descriptions and icons.

## Known limitations

- Weather and geocoding require network access; there is no backend proxy or
  offline cache.
- Favorites and settings are stored only in the browser's LocalStorage and are
  not synchronized between devices.
- Browser geolocation is optional and depends on user permission, device
  support, and a secure context (HTTPS or localhost). Coordinates are not
  persisted as a location unless the user explicitly saves a supported city as
  a favorite.
- Open-Meteo can omit optional fields. The dashboard displays placeholders
  rather than fabricating values.
- The production bundle includes Recharts and currently exceeds Vite's default
  500 kB chunk warning threshold; the build still succeeds.
- This project does not define a separate lint command. Static diagnostics and
  the production build are used alongside the automated test suite.
