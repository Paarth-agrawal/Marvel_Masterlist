import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="alert alert-error" style={{ margin: '2rem 0', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <AlertTriangle size={18} />
            Could not load Marvel catalog. Please refresh.
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {this.state.error?.message}
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            <RefreshCw size={14} /> Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
