import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Analytics are optional: only load PostHog if a key is configured.
// Lazy + after render so it never blocks first paint or breaks offline use.
const key = import.meta.env.VITE_POSTHOG_API_KEY;
if (key) {
  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, { api_host: 'https://us.i.posthog.com', capture_pageview: true });
    })
    .catch(() => {
      /* analytics are non-essential */
    });
}
