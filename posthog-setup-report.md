<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the **Wayfind** Bible verse app (React + Vite + TypeScript). A new PostHog client singleton was created at `src/lib/posthog.ts` using environment variables loaded from `.env`. Thirteen analytics events were instrumented across the full user journey in `src/App.tsx`, covering the onboarding personalization funnel, signup flow, paywall conversion, scripture search (emotion and curiosity modes), verse engagement (view, save, unsave), and settings changes. User identification (`posthog.identify()`) is called on signup to correlate anonymous session activity with the authenticated user. API keys are stored exclusively in `.env` (gitignored) and accessed via `import.meta.env` — never hardcoded.

| Event Name | Description | File |
|---|---|---|
| `onboarding started` | User taps 'Get Started' on the welcome screen | `src/App.tsx` |
| `onboarding question answered` | User selects an answer on a personalization question (purpose, connection, frequency) | `src/App.tsx` |
| `onboarding completed` | User finishes all 3 questions and taps 'Let's go' | `src/App.tsx` |
| `user signed up` | User picks a signup method (email, Google, or Apple) | `src/App.tsx` |
| `guest mode entered` | User skips signup and continues as guest | `src/App.tsx` |
| `trial started` | User taps 'Start 7-Day Free Trial' on the paywall — key conversion event | `src/App.tsx` |
| `paywall skipped` | User taps 'Skip for now' on the paywall — churn deflection indicator | `src/App.tsx` |
| `emotion search performed` | User selects an emotion to find matching scripture | `src/App.tsx` |
| `curiosity search performed` | User submits a text search query | `src/App.tsx` |
| `verse viewed` | User opens a verse detail screen | `src/App.tsx` |
| `verse saved` | User bookmarks a verse | `src/App.tsx` |
| `verse unsaved` | User removes a verse from saved collection | `src/App.tsx` |
| `translation changed` | User changes Bible translation preference in settings | `src/App.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/326915/dashboard/1317849
- **Onboarding to Trial Conversion Funnel** (funnel): https://us.posthog.com/project/326915/insights/jyDRBEls
- **Search & Engagement Trends** (trends): https://us.posthog.com/project/326915/insights/8oP7mMTo
- **Paywall Conversion vs Skip Rate** (funnel): https://us.posthog.com/project/326915/insights/1T8Oz7Lj
- **Sign Ups vs Guest Mode Daily** (trends): https://us.posthog.com/project/326915/insights/oHkd8cXx
- **Verse Collection Retention (Saved vs Removed)** (trends): https://us.posthog.com/project/326915/insights/PHR9lGi6

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
