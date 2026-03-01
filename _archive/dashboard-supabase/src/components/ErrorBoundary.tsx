import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 space-y-4">
            <h1 className="text-2xl font-bold text-red-400">⚠️ Application Error</h1>
            <p className="text-slate-300">The app encountered an error:</p>
            <pre className="bg-slate-900/50 p-4 rounded-lg overflow-auto text-xs text-red-300">
              {this.state.error?.message}
            </pre>
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-slate-300">Stack trace</summary>
              <pre className="mt-2 bg-slate-900/50 p-4 rounded-lg overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
