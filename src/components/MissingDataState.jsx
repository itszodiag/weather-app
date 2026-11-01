import { Database } from 'lucide-react';

/** State shown when the service responds without the fields needed to render weather. */
export default function MissingDataState({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-edge bg-card p-10 text-center"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Database className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">Weather data unavailable</h2>
      <p className="max-w-sm text-sm text-muted">
        The weather service did not provide enough data for this location.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
