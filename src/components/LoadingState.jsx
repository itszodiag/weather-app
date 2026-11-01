import { Loader2 } from 'lucide-react';

/** Accessible loading indicator with skeleton placeholders. */
export default function LoadingState({ message = 'Loading weather data…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-edge bg-card p-10 text-center"
    >
      <Loader2
        className="h-8 w-8 animate-spin text-accent"
        aria-hidden="true"
      />
      <div>
        <p className="font-medium">{message}</p>
        <p className="mt-1 text-sm text-muted">Fetching the latest conditions.</p>
      </div>
      <div className="mt-2 w-full max-w-md space-y-2" aria-hidden="true">
        <div className="h-3 w-full animate-pulse rounded bg-edge" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-edge" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-edge" />
      </div>
    </div>
  );
}
