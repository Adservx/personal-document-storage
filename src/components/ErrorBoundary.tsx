import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="retry-button"
            >
              Try again
            </button>
          </div>
          
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 20px;
            }
            
            .error-content {
              text-align: center;
              max-width: 400px;
            }
            
            .error-content h2 {
              color: #dc2626;
              margin-bottom: 16px;
            }
            
            .error-content p {
              color: #6b7280;
              margin-bottom: 24px;
            }
            
            .retry-button {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            }
            
            .retry-button:hover {
              background: #2563eb;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}