// PostHog is initialized in main.tsx before React renders.
// This file simply re-exports the singleton for use across components.
import posthog from 'posthog-js';
export { posthog };
