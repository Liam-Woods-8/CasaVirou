import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-4">
        <p className="display text-3xl">Something went wrong.</p>
        <p className="text-sm text-muted">
          Try reloading. If it keeps happening, your saved data may be damaged. Resetting restores the demo content and
          signs you out.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => location.reload()}
            className="eyebrow h-11 border border-ink bg-ink px-5 text-paper transition-all hover:bg-paper hover:text-ink"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('stitch-v1');
              location.assign('/');
            }}
            className="eyebrow h-11 border border-ink px-5 transition-all hover:bg-ink hover:text-paper"
          >
            Reset local data
          </button>
        </div>
      </div>
    );
  }
}
