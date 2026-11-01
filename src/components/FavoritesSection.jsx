import { Plus, Star, X } from 'lucide-react';
import Card, { CardTitle } from './ui/Card.jsx';

/**
 * Saved location metadata list. Weather is fetched when a favorite is selected.
 */
export default function FavoritesSection({
  favorites = [],
  onRemove,
  onSelect,
  onAddCurrent,
  addDisabled = false,
}) {
  return (
    <Card>
      <CardTitle hint={`${favorites.length} saved`}>Favorites</CardTitle>

      {favorites.length === 0 ? (
        <p className="py-3 text-sm text-muted">
          No favorites yet. Add a city to see it here.
        </p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((favorite) => (
            <li
              key={favorite.id}
              className="group flex items-center gap-3 rounded-xl border border-edge bg-surface/60 px-3 py-2.5 transition-colors hover:border-accent/40"
            >
              <button
                type="button"
                onClick={() => onSelect(favorite)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label={`Load weather for ${favorite.name}${favorite.country ? `, ${favorite.country}` : ''}`}
              >
                <Star
                  className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{favorite.name}</span>
                  <span className="block truncate text-xs text-muted">{favorite.country}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(favorite.id)}
                aria-label={`Remove ${favorite.name} from favorites`}
                className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onAddCurrent}
        disabled={addDisabled}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-edge px-3 py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add current city
      </button>
    </Card>
  );
}
