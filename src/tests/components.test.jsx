import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeatherCard from '../components/CurrentWeatherCard.jsx';
import ErrorState from '../components/ErrorState.jsx';
import HourlyForecast from '../components/HourlyForecast.jsx';
import LoadingState from '../components/LoadingState.jsx';
import SevenDayForecast from '../components/SevenDayForecast.jsx';

const current = {
  temperature: 20,
  feelsLike: 19,
  high: 22,
  low: 12,
  precipitation: 0.4,
  code: 0,
  isDay: true,
  sunrise: '2026-11-01T07:12',
  sunset: '2026-11-01T17:05',
  updatedAt: '2026-11-01T14:15',
};

describe('weather components', () => {
  it('renders current conditions and selected temperature units', () => {
    render(
      <CurrentWeatherCard
        location={{ name: 'Paris', country: 'France' }}
        current={current}
        temperatureUnit="fahrenheit"
      />
    );

    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('68°F')).toBeInTheDocument();
    expect(screen.getByText('Clear sky')).toBeInTheDocument();
  });

  it('renders hourly and daily forecast values', () => {
    render(
      <>
        <HourlyForecast
          hours={[
            {
              time: '2026-11-01T14:00',
              temperature: 15,
              code: 3,
              isDay: true,
              isCurrent: true,
              precipitationProbability: 20,
            },
          ]}
        />
        <SevenDayForecast
          days={[
            { date: '2026-11-01', min: 11, max: 18, code: 3, precipitationProbability: 20 },
          ]}
        />
      </>
    );

    expect(screen.getByRole('list', { name: /hourly weather/i })).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getAllByText('20%').length).toBeGreaterThanOrEqual(2);
  });

  it('renders loading, error, and missing values safely', () => {
    render(
      <>
        <LoadingState />
        <ErrorState message="Weather service unavailable" />
        <CurrentWeatherCard location={{ name: 'Paris' }} current={{}} />
      </>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Weather service unavailable');
    expect(screen.getAllByText('--°C').length).toBeGreaterThan(0);
  });
});
