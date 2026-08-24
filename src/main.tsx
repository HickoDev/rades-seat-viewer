import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { AppProviders } from './app/AppProviders';
import { enableBvhRaycasting } from './utils/setupBvh';
import './styles.css';

enableBvhRaycasting();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
