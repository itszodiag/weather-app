import { Component } from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';

export default class RuntimeErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-4 text-ink">
        <section
          role="alert"
          className="w-full max-w-md rounded-2xl border border-red-500/30 bg-card p-8 text-center shadow-sm"
        >
          <TriangleAlert className="mx-auto h-10 w-10 text-red-400" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">The dashboard needs to reload</h1>
          <p className="mt-2 text-sm text-muted">
            Something unexpected happened while rendering the weather dashboard.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reload dashboard
          </button>
        </section>
      </main>
    );
  }
}
