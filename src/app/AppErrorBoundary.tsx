import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { failed: boolean };

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Radès View stopped after an unexpected render error.', {
      error,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="production-error" role="alert">
        <span aria-hidden="true">RV</span>
        <h1>The stadium could not be displayed</h1>
        <p>
          Reload the experience. If the problem continues, confirm that WebGL is
          enabled and try the latest version of your browser.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload Radès View
        </button>
      </main>
    );
  }
}
