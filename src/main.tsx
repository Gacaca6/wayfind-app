import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'

// Initialize PostHog before React renders
posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
  api_host: 'https://us.i.posthog.com',
  capture_pageview: false,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
