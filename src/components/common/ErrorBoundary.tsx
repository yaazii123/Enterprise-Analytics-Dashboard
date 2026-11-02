import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optional compact fallback, used for per-widget boundaries. */
  compact?: boolean;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className={
          this.props.compact
            ? 'flex h-full min-h-40 flex-col items-center justify-center gap-2 p-4 text-center'
            : 'mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 p-8 text-center'
        }
      >
        <div className="rounded-full bg-negative-soft p-2.5 text-negative">
          <AlertTriangle size={20} />
        </div>
        <p className="font-medium text-fg">Something went wrong</p>
        <p className="text-sm text-fg-muted">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={this.reset}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-fg shadow-card transition-colors hover:bg-surface-2"
        >
          <RotateCcw size={14} /> Try again
        </button>
      </div>
    );
  }
}
