import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SearchResults from '../components/SearchResults.jsx';
import CurrentWeatherCard from '../components/CurrentWeatherCard.jsx';
import HourlyForecast from '../components/HourlyForecast.jsx';
import SevenDayForecast from '../components/SevenDayForecast.jsx';
import WeatherDetailsGrid from '../components/WeatherDetailsGrid.jsx';
import WeatherCharts from '../components/WeatherCharts.jsx';
import FavoritesSection from '../components/FavoritesSection.jsx';
import LoadingState from '../components/LoadingState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import MissingDataState from '../components/MissingDataState.jsx';
import useTheme from '../hooks/useTheme.js';
import useSettings from '../hooks/useSettings.js';
import { searchCities } from '../services/geocoding.js';
import { fetchForecast } from '../services/weather.js';
import { MissingDataError } from '../services/http.js';
import { readFavorites, readJSON, writeJSON } from '../utils/storage.js';

const LAST_LOCATION_KEY = 'weather-app-last-location';
const FAVORITES_KEY = 'weather-app-favorites';

function isSamePlace(a, b) {
  return (
    a &&
    b &&
    a.latitude === b.latitude &&
    a.longitude === b.longitude
  );
}

function getLocationId(location) {
  return location?.id != null
    ? String(location.id)
    : `${location?.name ?? ''}|${location?.country ?? ''}|${location?.latitude},${location?.longitude}`;
}

/**
 * Dashboard page: layout, search flow and data orchestration.
 * All API work happens in the services layer; this page only wires
 * the UI to them (search -> select city -> fetch forecast -> render).
 */
export default function DashboardPage() {
  const { isDark, setTheme, toggleTheme } = useTheme();
  const { temperatureUnit, windUnit, updateSettings } = useSettings();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeResult, setActiveResult] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);

  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  // 'empty' | 'loading' | 'refreshing' | 'ready' | 'error' | 'missing'
  const [status, setStatus] = useState('empty');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshError, setRefreshError] = useState('');

  const [favorites, setFavorites] = useState(() =>
    readFavorites(FAVORITES_KEY)
  );

  const searchControllerRef = useRef(null);
  const weatherControllerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const weatherRequestRef = useRef(0);
  const searchRequestRef = useRef(0);

  const loadWeather = async (
    loc,
    { persist = true, keepWeather = false } = {}
  ) => {
    const requestId = weatherRequestRef.current + 1;
    weatherRequestRef.current = requestId;
    // Cancel any in-flight forecast request: only the latest may render.
    weatherControllerRef.current?.abort();
    searchControllerRef.current?.abort();
    searchRequestRef.current += 1;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    const controller = new AbortController();
    weatherControllerRef.current = controller;

    setStatus(keepWeather && weather ? 'refreshing' : 'loading');
    setErrorMessage('');
    setRefreshError('');
    setLocation(loc); // so error retry knows which location to reload
    if (!keepWeather) setWeather(null);
    try {
      const forecast = await fetchForecast(
        { latitude: loc.latitude, longitude: loc.longitude },
        { signal: controller.signal }
      );
      if (requestId !== weatherRequestRef.current || controller.signal.aborted) {
        return;
      }
      setWeather(forecast);
      setStatus('ready');
      if (persist) writeJSON(LAST_LOCATION_KEY, loc);
    } catch (error) {
      if (
        error.name === 'AbortError' ||
        requestId !== weatherRequestRef.current ||
        controller.signal.aborted
      ) {
        return;
      }
      if (error instanceof MissingDataError) {
        if (keepWeather && weather) {
          setStatus('ready');
          setRefreshError(error.message);
        } else {
          setStatus('missing');
          setErrorMessage(error.message);
        }
        return;
      }
      const message =
        error.message || 'Something went wrong while loading the weather.';
      if (keepWeather && weather) {
        setStatus('ready');
        setRefreshError(message);
      } else {
        setStatus('error');
        setErrorMessage(message);
      }
    }
  };

  // Restore the last selected location, and cancel requests on unmount.
  useEffect(() => {
    const last = readJSON(LAST_LOCATION_KEY);
    if (last && typeof last.latitude === 'number' && typeof last.longitude === 'number') {
      setLocation(last);
      loadWeather(last);
    }
    return () => {
      searchControllerRef.current?.abort();
      weatherControllerRef.current?.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === FAVORITES_KEY) {
        setFavorites(readFavorites(FAVORITES_KEY));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const searchForCities = async (value) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setSearchError('');
      setActiveResult(-1);
      return;
    }

    // One search at a time: abort the previous geocoding request.
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    setIsSearching(true);
    setSearchError('');
    setResults([]);
    setHasSearched(true);
    setActiveResult(-1);
    try {
      const found = await searchCities(trimmed, { signal: controller.signal });
      if (requestId !== searchRequestRef.current || controller.signal.aborted) return;
      setResults(found);
    } catch (error) {
      if (
        error.name === 'AbortError' ||
        requestId !== searchRequestRef.current ||
        controller.signal.aborted
      ) {
        return;
      }
      setSearchError(
        error.message || 'City search is unavailable right now. Please try again.'
      );
    } finally {
      if (
        !controller.signal.aborted &&
        requestId === searchRequestRef.current
      ) {
        setIsSearching(false);
      }
    }
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    await searchForCities(query);
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      searchControllerRef.current?.abort();
      searchRequestRef.current += 1;
      setResults([]);
      setHasSearched(false);
      setSearchError('');
      setActiveResult(-1);
      return undefined;
    }
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      return undefined;
    }
    const timer = setTimeout(() => {
      searchDebounceRef.current = null;
      searchForCities(trimmed);
    }, 500);
    searchDebounceRef.current = timer;
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchKeyDown = (event) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResult((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResult((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeResult >= 0) {
      event.preventDefault();
      handleSelectCity(results[activeResult]);
    } else if (event.key === 'Escape') {
      setResults([]);
      setHasSearched(false);
      setActiveResult(-1);
    }
  };

  const handleSelectCity = (city) => {
    const loc = {
      id: city.id,
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
    };

    // Avoid duplicate requests when re-selecting the loaded location.
    if (isSamePlace(location, loc) && status === 'ready') {
      setResults([]);
      setHasSearched(false);
      setQuery('');
      return;
    }

    setResults([]);
    setHasSearched(false);
    setQuery('');
    loadWeather(loc);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setSearchError(
        'Location is unavailable in this browser. Search for a city instead.'
      );
      return;
    }
    setIsLocating(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocating(false);
        setResults([]);
        setHasSearched(false);
        setQuery('');
        loadWeather(
          {
            name: 'Current location',
            country: '',
            latitude: coords.latitude,
            longitude: coords.longitude,
            timezone: 'auto',
            isUserLocation: true,
          },
          { persist: false }
        );
      },
      (error) => {
        setIsLocating(false);
        const messages = {
          1: 'Location permission was denied. Allow access or search for a city instead.',
          2: 'Your location could not be determined. Search for a city instead.',
          3: 'Location request timed out. Try again or search for a city.',
        };
        setSearchError(
          `${messages[error.code] || 'Unable to retrieve your location.'} Geolocation generally requires HTTPS or localhost.`
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const updateFavorites = (next) => {
    const deduped = readFavorites(FAVORITES_KEY).concat(next).reduce(
      (items, favorite) => {
        if (!items.some((item) => item.id === favorite.id)) items.push(favorite);
        return items;
      },
      []
    );
    setFavorites(deduped);
    writeJSON(FAVORITES_KEY, deduped);
  };

  const handleRemoveFavorite = (id) => {
    const next = favorites.filter((item) => item.id !== id);
    setFavorites(next);
    writeJSON(FAVORITES_KEY, next);
  };

  const handleAddCurrent = () => {
    if (!location || location.isUserLocation) return;
    const id = getLocationId(location);
    if (favorites.some((item) => item.id === id)) return;
    updateFavorites([
      ...favorites,
      {
        id,
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      },
    ]);
  };

  const handleSelectFavorite = (favorite) => {
    loadWeather({
      id: favorite.id,
      name: favorite.name,
      country: favorite.country,
      latitude: favorite.latitude,
      longitude: favorite.longitude,
      timezone: favorite.timezone,
    });
  };

  const renderContent = () => {
    if (status === 'loading') return <LoadingState />;
    if (status === 'empty') {
      return (
        <EmptyState
          actionLabel="Search for a city"
          onAction={() => document.getElementById('city-search')?.focus()}
        />
      );
    }
    if (status === 'error') {
      return <ErrorState message={errorMessage} onRetry={() => location && loadWeather(location)} />;
    }
    if (status === 'missing') {
      return <MissingDataState onRetry={() => location && loadWeather(location)} />;
    }

    return (
      <div className="space-y-6">
        {status === 'refreshing' ? (
          <p role="status" className="rounded-xl border border-edge bg-card px-4 py-3 text-sm text-muted">
            Refreshing weather data…
          </p>
        ) : null}
        {refreshError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{refreshError}</span>
            <button
              type="button"
              onClick={() => location && loadWeather(location, { keepWeather: true })}
              className="shrink-0 self-start rounded-lg bg-accent px-3 py-1.5 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:self-auto"
            >
              Retry
            </button>
          </div>
        ) : null}
        <CurrentWeatherCard location={location} current={weather.current} temperatureUnit={temperatureUnit} />
        <WeatherCharts hours={weather.hourly} days={weather.daily} temperatureUnit={temperatureUnit} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <HourlyForecast hours={weather.hourly} temperatureUnit={temperatureUnit} />
            <SevenDayForecast days={weather.daily} temperatureUnit={temperatureUnit} />
          </div>
          <div className="space-y-6">
            <WeatherDetailsGrid details={weather.current} temperatureUnit={temperatureUnit} windUnit={windUnit} />
            <FavoritesSection
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onSelect={handleSelectFavorite}
              onAddCurrent={handleAddCurrent}
              addDisabled={
                !location ||
                location.isUserLocation ||
                favorites.some(
                  (item) =>
                  item.id === getLocationId(location)
                )
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        setTheme={setTheme}
        temperatureUnit={temperatureUnit}
        windUnit={windUnit}
        updateSettings={updateSettings}
      />

      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <SearchBar
          value={query}
          onChange={setQuery}
          onKeyDown={handleSearchKeyDown}
          onSubmit={handleSearchSubmit}
          isLoading={isSearching}
          onLocate={handleLocate}
          isLocating={isLocating}
        />

        <SearchResults
          results={results}
          isSearching={isSearching}
          hasSearched={hasSearched}
          query={query}
          error={searchError}
          onSelect={handleSelectCity}
          activeIndex={activeResult}
        />

        {renderContent()}
      </main>

      <footer className="border-t border-edge">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6 lg:px-8">
          <span>Weather Dashboard</span>
          <span>Weather data by Open-Meteo</span>
        </div>
      </footer>
    </div>
  );
}
