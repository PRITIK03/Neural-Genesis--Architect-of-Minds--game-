import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // You could also report to an error tracking service here
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#060814] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md space-y-6 rounded-2xl border border-neural-red/30 bg-neural-red/5 p-8 text-center shadow-2xl"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-neural-red/20 p-4">
                <svg className="h-10 w-10 text-neural-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-neural-red">Something went wrong</h1>
              <p className="mt-2 text-sm text-text-secondary">
                An unexpected error occurred. Don't worry, your progress is likely saved.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3 text-left">
                <p className="text-xs font-semibold text-text-dim">Error details</p>
                <p className="mt-1 text-xs font-mono text-neural-red break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-neural-blue/40"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 rounded-xl bg-neural-blue px-4 py-2.5 text-sm font-semibold text-bg-app"
              >
                Reload App
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to catch errors
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    console.error('Caught error:', error);
    setError(error);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};
