import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';

import { App } from './app/App';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { AppProviders } from './app/AppProviders';
import './styles.css';

const rootElement = document.getElementById('root');
const analyticsDisabledHosts = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
]);

if (!rootElement) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
        {!analyticsDisabledHosts.has(window.location.hostname) && <Analytics />}
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>,
);
