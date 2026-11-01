import { RotateCcw, TriangleAlert } from 'lucide-react';

/** Error state with retry action. */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the weather data. Check your connection and try again.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <TriangleAlert className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
