import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** When this changes, a previous page error is cleared so navigation can continue. */
  resetKey?: string;
}

interface State {
  error: Error | null;
  errorKey?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  /** Pages already remounted once after a failure. */
  private retried = new Set<string>();

  static getDerivedStateFromError(error: Error): Pick<State, 'error'> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (state.error && state.errorKey && props.resetKey && props.resetKey !== state.errorKey) {
      return { error: null, errorKey: undefined };
    }
    return null;
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey && prev.resetKey !== this.props.resetKey) this.retried.delete(prev.resetKey);
  }

  componentDidCatch(error: Error) {
    console.error(error);
    const key = this.props.resetKey ?? '';
    // A client-side page change can fail once and succeed on a clean mount.
    if (!this.retried.has(key)) {
      this.retried.add(key);
      this.setState({ error: null, errorKey: this.props.resetKey });
      return;
    }
    if (this.state.errorKey !== this.props.resetKey) this.setState({ errorKey: this.props.resetKey });
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
              location.assign(import.meta.env.BASE_URL || '/');
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
