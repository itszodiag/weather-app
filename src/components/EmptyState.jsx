import { MapPin, Search } from 'lucide-react';

/** Empty state shown when no location is selected. */
export default function EmptyState({
  title = 'No location selected',
  description = 'Search for a city above to see its current weather and forecast.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-edge bg-card p-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <MapPin className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
