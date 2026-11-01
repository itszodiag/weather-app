import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from '../pages/DashboardPage.jsx';
import {
  forecastResponse,
  geocodingEmptyResponse,
  geocodingResponse,
  jsonResponse,
} from './fixtures.js';

function mockFetch({ geocoding, forecast } = {}) {
  const fetchMock = vi.fn((input) => {
    const url = String(input);
    if (url.includes('geocoding-api.open-meteo.com')) {
      if (geocoding instanceof Error) return Promise.reject(geocoding);
      return Promise.resolve(jsonResponse(geocoding));
    }
    if (url.includes('api.open-meteo.com')) {
      if (forecast instanceof Error) return Promise.reject(forecast);
      return Promise.resolve(jsonResponse(forecast));
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function searchAndSelect(user, cityName = 'Paris') {
  const searchbox = screen.getByRole('searchbox');
  await user.type(searchbox, cityName);
  await user.click(screen.getByRole('button', { name: /^search$/i }));
  const matches = await screen.findAllByRole('button', { name: /Paris/ });
  await user.click(matches[0]);
}

describe('DashboardPage', () => {
  it('renders the header, search and an empty state before any search', () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /weather/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /no location selected/i })
    ).toBeInTheDocument();
    // No placeholder preview data anymore
    expect(screen.queryByText(/preview mode/i)).not.toBeInTheDocument();
  });

  it('searches for a city, selects it and renders real forecast data', async () => {
    const fetchMock = mockFetch({
      geocoding: geocodingResponse,
      forecast: forecastResponse,
    });
    const user = userEvent.setup();
    render(<DashboardPage />);

    await searchAndSelect(user);

    // Selected city and country are displayed
    expect(await screen.findByText('Paris, France')).toBeInTheDocument();

    // Forecast was requested with the selected city's coordinates
    const forecastCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes('/v1/forecast')
    );
    expect(forecastCall).toBeDefined();
    expect(String(forecastCall[0])).toContain('latitude=48.8566');
    expect(String(forecastCall[0])).toContain('longitude=2.3522');
    expect(forecastCall[1]).toMatchObject({
      signal: expect.any(AbortSignal),
    });

    // Sections receive the normalized data (humidity 71% from the fixture)
    expect(await screen.findByText('71%')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /hourly forecast/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /7-day forecast/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /weather details/i })
    ).toBeInTheDocument();
    // Sunrise/sunset from the API response (offset stripped, local display)
    expect(screen.getByText('Sunrise').parentElement).toHaveTextContent('7:12 AM');
  }, 10000);

  it('shows an explicit message when the city is not found', async () => {
    mockFetch({ geocoding: geocodingEmptyResponse });
    const user = userEvent.setup();
    render(<DashboardPage />);

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'Qwertyuiopasdfgh');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    expect(
      await screen.findByText(/no cities found for/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /no location selected/i })
    ).toBeInTheDocument();
  });

  it('shows a readable error when city search fails', async () => {
    mockFetch({ geocoding: new TypeError('Failed to fetch') });
    const user = userEvent.setup();
    render(<DashboardPage />);

    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'Paris');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /internet connection/i
    );
  });

  it('shows a readable error when the forecast request fails, with retry', async () => {
    const fetchMock = mockFetch({
      geocoding: geocodingResponse,
      forecast: new TypeError('Failed to fetch'),
    });
    const user = userEvent.setup();
    render(<DashboardPage />);

    await searchAndSelect(user);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/unable to reach the weather service/i);

    // Retry refetches the same location (a second forecast request fires)
    const forecastCalls = () =>
      fetchMock.mock.calls.filter(([url]) => String(url).includes('/v1/forecast'));
    expect(forecastCalls()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(forecastCalls()).toHaveLength(2);
    expect(String(forecastCalls()[1][0])).toContain('latitude=48.8566');
  });

  it('adds a selected city to favorites, changes units, and restores them on reload', async () => {
    const fetchMock = mockFetch({
      geocoding: geocodingResponse,
      forecast: forecastResponse,
    });
    const user = userEvent.setup();
    const { unmount } = render(<DashboardPage />);

    await searchAndSelect(user);
    await user.click(screen.getByRole('button', { name: 'Add current city' }));

    expect(
      await screen.findByRole('button', { name: /Load weather for Paris, France/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open settings' }));
    await user.click(screen.getByRole('radio', { name: /Fahrenheit/ }));
    expect(screen.getAllByText('60°F').length).toBeGreaterThan(0);

    unmount();
    render(<DashboardPage />);

    expect(
      await screen.findByRole('button', { name: /Load weather for Paris, France/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('60°F').length).toBeGreaterThan(0);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/v1/forecast')).length).toBeGreaterThanOrEqual(2);
  }, 10000);
});
