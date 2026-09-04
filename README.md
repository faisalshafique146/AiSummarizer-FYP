# HiSumz

## Overview

HiSumz is a focused web application for turning pasted English text into a shorter summary. It is designed for a simple workflow: create an account, paste an article, report, or passage, generate a summary, compare it with the source, and copy the result.

This repository is a modernization of a 2024 final-year student project. The current application does **not** summarize URLs, store summary history, offer multiple models, or use Redux.

## Features

- Email/password sign-up, sign-in, session restoration, and sign-out with Firebase Authentication.
- Typed sign-in and sign-up forms using React Hook Form and Zod.
- Accessible password visibility controls and friendly Firebase error messages.
- Authenticated summarizer workspace with responsive source and result panels.
- Shared client/server validation: whitespace trimming, a 30-word minimum, and a 12,000-character maximum.
- Clear idle, validation, loading, success, API-error, cancellation, and retry states.
- Server-controlled summary length and rejection of results that are not shorter than their source.
- Copy-to-clipboard action with non-blocking success or failure feedback.
- Light and dark themes with system-preference detection and a remembered selection.
- Keyboard-accessible controls, visible focus states, semantic markup, live feedback, and reduced-motion support.

## Architecture

```text
React frontend
    |
    | POST /api/summarize { text }
    v
Vercel Function / local Vite API middleware
    |
    | Authorization: Bearer <server-only token>
    v
Hugging Face Inference API
```

The browser calls only the internal `/api/summarize` endpoint. The endpoint validates the request, applies a timeout and deterministic generation limits, attaches the private Hugging Face credential, validates the provider response, and returns a small typed JSON contract.

Firebase Authentication is initialized once in `src/lib/firebase.ts`. `AuthProvider` owns the single auth-state subscription and exposes the current user, loading state, and auth operations through `useAuth`. Signed-out visitors see the product landing page; authenticated users see the summarizer workspace. Sign-in and sign-up are dedicated routes rather than modal/route hybrids.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19.2, React DOM 19.2, TypeScript 6 |
| Routing | React Router 7.18 |
| Authentication | Firebase 12.18 |
| Forms and validation | React Hook Form 7.87, Zod 4.5, `@hookform/resolvers` 5.9 |
| Styling | Tailwind CSS 4.3 through `@tailwindcss/vite` |
| Build tooling | Vite 8.2 |
| Server endpoint | Vercel Function using Web `Request` and `Response` APIs |
| AI provider | Hugging Face Inference API, `sshleifer/distilbart-cnn-12-6` |
| Testing | Vitest 5, React Testing Library, `user-event`, jsdom |
| Static analysis | ESLint 10 with strict type-aware TypeScript and React Hooks rules |

All installed packages and exact versions are recorded in `package.json` and `package-lock.json`.

## Project Structure

```text
api/
  summarize.ts                 Vercel summarization endpoint
config/
  summarizeDevPlugin.ts        Local Vite adapter for the same endpoint
src/
  app/                         Routing and top-level pages
  components/                  Product and shared UI components
    ui/                        Small reusable UI primitives
  features/
    auth/                      Auth context, service, forms, schemas, and tests
    summarizer/                Workflow hook, client service, validation, and tests
    theme/                     Persisted light/dark theme state and test
  lib/
    firebase.ts                Firebase initialization and environment mapping
  test/
    setup.ts                   Shared Vitest/DOM setup
tests/
  summarizeApi.test.ts        Node-side API handler tests
vercel.json                    Vite SPA rewrites and function duration
vite.config.ts                 Vite, React, Tailwind, and local API configuration
vitest.config.ts               Test environment configuration
```

Tests live beside the behavior they cover.

## Local Development

Requirements: Node.js `22.13+`, `24.x`, or `26+`, as declared in `package.json`, and npm.

1. Install the exact locked dependency tree:

   ```bash
   npm ci
   ```

2. Create local environment configuration:

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell, use `Copy-Item .env.example .env.local`.

3. Replace the placeholders in `.env.local` with your Firebase web-app configuration and Hugging Face token.

4. Start the application and local API adapter:

   ```bash
   npm run dev
   ```

Vite serves the frontend and mounts the same handler used by Vercel at `/api/summarize`. To exercise Vercel's complete local runtime instead, link the repository with `npx vercel link` and run `npx vercel dev`.

## Environment Variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Browser-safe Firebase web configuration | Identifies the Firebase web application |
| `VITE_FIREBASE_AUTH_DOMAIN` | Browser-safe Firebase web configuration | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Browser-safe Firebase web configuration | Firebase project identifier |
| `VITE_FIREBASE_APP_ID` | Browser-safe Firebase web configuration | Firebase web application identifier |
| `HUGGING_FACE_API_TOKEN` | **Server only** | Authorizes calls from the internal endpoint to Hugging Face |

Firebase web configuration identifies a client app; it is not equivalent to a private server credential. It should still be paired with appropriate Firebase authorized domains and API-key restrictions.

Never prefix the Hugging Face token with `VITE_`. Vite deliberately exposes `VITE_*` variables to browser code. Keep real values only in ignored local files and deployment environment settings; `.env.example` contains placeholders only.

For Vercel, configure all five variables in Project Settings for each required environment. Environment changes require a new deployment. The included `vercel.json` preserves React Router deep links and configures the API function's maximum duration.

## Quality Checks

Run the complete local gate:

```bash
npm run check
```

Or run each command independently:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

- `typecheck` performs a strict no-emit TypeScript project build.
- `lint` runs type-aware ESLint with zero warnings allowed.
- `test` runs the Vitest and React Testing Library suite without real Firebase or Hugging Face requests.
- `build` type-checks and creates the optimized Vite output in `dist/`.

## Security Improvement

The original application read a Hugging Face bearer token from browser environment variables and called the provider directly from a React component. Any shipped browser credential can be inspected and reused regardless of whether the UI requires sign-in.

HiSumz now sends text to an internal server-side endpoint. Only that endpoint reads `HUGGING_FACE_API_TOKEN`, and it returns normalized errors rather than raw provider responses. This removes the private token from the client bundle and browser network request. It does not by itself prevent abuse of the public endpoint; see Known Limitations.

## Modernization

The original 2024 project was a JavaScript/JSX React 18 prototype with a direct browser-to-Hugging-Face request, authentication state embedded in `App`, fixed-size textareas, Material Tailwind dialogs, misleading route/modal behavior, unused Redux and local-transformer packages, manual form validation, raw errors, and no automated tests.

The modernization:

- Migrated all application, API, test, and build source to strict TypeScript/TSX.
- Upgraded React, Vite, Firebase, Tailwind, React Router, ESLint, and related tooling.
- Removed Redux Toolkit, React Redux, Xenova Transformers, Material Tailwind, PropTypes, and obsolete PostCSS-era configuration.
- Centralized Firebase initialization, auth state, auth operations, domain types, and friendly error mapping.
- Replaced the route/modal hybrid with dedicated `/sign-in` and `/sign-up` pages.
- Moved summarization behind a validated server endpoint and a typed client service.
- Rebuilt the summarizer around explicit request states, cancellation, retry, copy feedback, and shared validation.
- Replaced the fixed prototype layout with a responsive, accessible light/dark product interface.
- Added focused tests at schema, service, provider, API, workflow, theme, and authenticated-UI boundaries.

The historical starting point and original dependency versions remain documented in `MODERNIZATION_AUDIT.md`.

## Screenshots

Final screenshots are not committed yet. Before publishing the portfolio:

1. Capture the signed-out landing page in light mode.
2. Capture the authenticated two-panel workspace with a real, non-sensitive sample passage and summary.
3. Capture one mobile view and one dark-mode view.
4. Store optimized WebP or PNG files under `docs/screenshots/` and replace this note with labeled images.

Do not include real email addresses, access tokens, or private source text in screenshots.

## Known Limitations

- The fixed DistilBART model is primarily suited to English, news-like prose. It can omit context or produce inaccurate wording; users must review every result.
- Inputs shorter than 30 words or longer than 12,000 characters are rejected. Longer accepted text may still be truncated to the model's context window, so the end of a large document may not influence the result.
- Firebase Authentication gates the workspace in the client, but `/api/summarize` does not yet verify Firebase ID tokens or apply per-user rate limiting. The provider token is hidden, but the endpoint remains publicly callable.
- Summaries are not stored. There is no history, URL/file ingestion, export, adjustable length, tone selection, or model selection.
- Availability and rate limits depend on Firebase, Vercel, and Hugging Face.
- The automated suite covers high-value unit, component, and endpoint behavior with mocks; it does not include deployed end-to-end tests or automated accessibility scans.

## Future Improvements

- Verify Firebase ID tokens in the server function and add practical per-user/IP rate limiting.
- Add chunking and synthesis for documents larger than the model context window, with tests that verify coverage of later sections.
- Evaluate a more factual summarization model against a small, versioned set of representative passages before changing providers.
- Add Playwright smoke tests for auth routing, keyboard use, theme persistence, and the deployed summarization flow; add axe-based accessibility checks.
- Publish sanitized portfolio screenshots and a live deployment after validating environment settings and deep links on Vercel.
