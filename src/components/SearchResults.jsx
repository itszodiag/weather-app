import { Loader2, MapPin, SearchX } from 'lucide-react';

/**
 * Results panel below the search bar: matches (distinguished by
 * admin1/country for identically named cities), a loading row, an
 * explicit "no matches" message, or a search error.
 */
export default function SearchResults({
  results = [],
  isSearching = false,
  hasSearched = false,
  query = '',
  error = '',
  onSelect,
  activeIndex = -1,
}) {
  if (isSearching) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl border border-edge bg-card px-4 py-3 text-sm text-muted"
      >
        <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
        Searching for cities…
      </p>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400"
      >
        {error}
      </p>
    );
  }

  if (!hasSearched) return null;

  if (results.length === 0) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl border border-edge bg-card px-4 py-3 text-sm text-muted"
      >
        <SearchX className="h-4 w-4 shrink-0" aria-hidden="true" />
        No cities found for “{query.trim()}”. Try another spelling.
      </p>
    );
  }

  return (
    <ul role="listbox" aria-label="City suggestions" className="space-y-2">
      {results.map((city, index) => {
        const detail = [city.admin1, city.country]
          .filter(Boolean)
          .join(', ');
        return (
          <li key={city.id}>
            <button
              type="button"
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => onSelect(city)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                index === activeIndex
                  ? 'border-accent/50 bg-accent-soft'
                  : 'border-edge bg-card'
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {city.name}
                </span>
                {detail ? (
                  <span className="block truncate text-xs text-muted">
                    {detail}
                  </span>
                ) : null}
              </span>
              <span className="hidden shrink-0 text-xs tabular-nums text-muted sm:inline">
                {Number(city.latitude).toFixed(2)},{' '}
                {Number(city.longitude).toFixed(2)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
