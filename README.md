# HiSumz AI

HiSumz AI is a TypeScript and React application that summarizes pasted text with the Hugging Face Inference API. Email/password accounts and sessions are managed with Firebase Authentication. Vite and Tailwind CSS provide the development and styling toolchain. Summarization requests pass through a Vercel Function so the Hugging Face credential is never included in browser code.

## Local setup

Requirements: a supported Node.js LTS release (`22.13+`, `24.x`, or `26+`) and npm.

1. Install the locked dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and replace every placeholder. The four `VITE_FIREBASE_*` values are public Firebase web-app configuration. `HUGGING_FACE_API_TOKEN` is a private server credential and must never have a `VITE_` prefix.

3. Start the application:

   ```bash
   npm run dev
   ```

The Vite development configuration serves `/api/summarize` through the same validated handler used by the deployed Vercel Function. The private token is loaded into the development server only and is not added to the browser environment. To test Vercel's complete local runtime instead, link the project with `npx vercel link` and run `npx vercel dev`.

## Environment and deployment

Configure these variables in Vercel Project Settings for every environment that needs the application:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `HUGGING_FACE_API_TOKEN`

The Hugging Face token needs permission to call Inference Providers. Vercel makes unprefixed variables available to `api/summarize.ts` at runtime; Vite only exposes variables prefixed with `VITE_` to the client bundle. Changes to Vercel environment variables require a new deployment.

The root `api/summarize.ts` file is deployed automatically as `POST /api/summarize`. No `vercel.json` or backend framework is required. The endpoint accepts JSON shaped as `{ "text": "..." }`, trims the text, and rejects empty, malformed, non-JSON, under-30-word, or over-12,000-character requests. The minimum prevents a summarization model from inventing filler when it receives only a title or fragment. Generation length is capped in proportion to the source, and a result that is not shorter than its source is rejected instead of being shown as a useful summary. Successful responses are `{ "ok": true, "summary": "..." }`; failures use `{ "ok": false, "error": { "code", "message", "retryable" } }`.

Firebase web configuration is public client metadata, but it should still use appropriate Firebase Authentication settings and API-key restrictions. `HUGGING_FACE_API_TOKEN` is private and must exist only in local server configuration and Vercel environment settings.

If a Hugging Face token was previously deployed as `VITE_HUGGING_FACE_API_TOKEN`, revoke it and create a replacement before deployment. Removing it from new bundles cannot invalidate copies already delivered to browsers.

## Available commands

- `npm run dev` starts Vite with a server-only local `/api/summarize` handler.
- `npx vercel dev` runs the project through Vercel's local runtime when provider-level testing is needed.
- `npm run typecheck` runs the strict TypeScript project build without emitting files.
- `npm run lint` runs type-aware ESLint checks over the TypeScript source.
- `npm run test` runs the Vitest and React Testing Library suite once.
- `npm run test:watch` runs the test suite in watch mode during development.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## Current application flow

Unauthenticated visitors can sign up or sign in with email and password. After Firebase restores or creates a session, the text summarizer becomes available. The browser posts the submitted text to `/api/summarize`; the server-side function attaches the private credential and calls the `sshleifer/distilbart-cnn-12-6` model through the current Hugging Face Inference router. The returned summary can be copied to the clipboard.
