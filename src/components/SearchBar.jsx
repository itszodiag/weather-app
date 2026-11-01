import { LocateFixed, Loader2, Search, X } from 'lucide-react';

/** City search form. Search execution is deferred to the API integration phase. */
export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  isLoading = false,
  onLocate,
  isLocating = false,
}) {
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex w-full items-center gap-2"
    >
      <label htmlFor="city-search" className="sr-only">
        Search for a city
      </label>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id="city-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search city or place…"
          autoComplete="off"
          aria-autocomplete="list"
          className="h-11 w-full rounded-xl border border-edge bg-card pl-10 pr-10 text-sm text-ink placeholder:text-muted transition-colors focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {onLocate ? (
        <button
          type="button"
          onClick={onLocate}
          disabled={isLocating || isLoading}
          aria-label="Use my current location"
          title="Use my current location (HTTPS or localhost required)"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-edge bg-card text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
      <button
        type="submit"
        disabled={isLocating}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
