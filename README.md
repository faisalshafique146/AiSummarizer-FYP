# HiSumz AI

HiSumz AI is a TypeScript and React application that summarizes pasted text with the Hugging Face Inference API. Email/password accounts and sessions are managed with Firebase Authentication. Vite and Tailwind CSS provide the development and styling toolchain. Summarization requests pass through a Vercel Function so the Hugging Face credential is never included in browser code.

## Local setup

Requirements: Node.js 20.19 or newer and npm. The Vercel CLI is also required to run the complete application locally because Vite alone does not execute files in `api/`.

1. Install the locked dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and replace every placeholder. The four `VITE_FIREBASE_*` values are public Firebase web-app configuration. `HUGGING_FACE_API_TOKEN` is a private server credential and must never have a `VITE_` prefix.

3. Link the directory to its Vercel project when needed, then start the full local application:

   ```bash
   npx vercel link
   npx vercel dev
   ```

`npm run dev` remains useful for frontend-only work, but summarization calls will not work because the Vite server does not run the Vercel Function.

## Environment and deployment

Configure these variables in Vercel Project Settings for every environment that needs the application:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `HUGGING_FACE_API_TOKEN`

The Hugging Face token needs permission to call Inference Providers. Vercel makes unprefixed variables available to `api/summarize.ts` at runtime; Vite only exposes variables prefixed with `VITE_` to the client bundle. Changes to Vercel environment variables require a new deployment.

The root `api/summarize.ts` file is deployed automatically as `POST /api/summarize`. No `vercel.json` or backend framework is required. The endpoint accepts JSON shaped as `{ "text": "..." }`, trims the text, and rejects empty, malformed, non-JSON, or over-12,000-character requests. Successful responses are `{ "ok": true, "summary": "..." }`; failures use `{ "ok": false, "error": { "code", "message", "retryable" } }`.

Firebase web configuration is public client metadata, but it should still use appropriate Firebase Authentication settings and API-key restrictions. `HUGGING_FACE_API_TOKEN` is private and must exist only in local server configuration and Vercel environment settings.

If a Hugging Face token was previously deployed as `VITE_HUGGING_FACE_API_TOKEN`, revoke it and create a replacement before deployment. Removing it from new bundles cannot invalidate copies already delivered to browsers.

## Available commands

- `npm run dev` starts the frontend-only Vite development server.
- `npx vercel dev` starts Vite and the `/api/summarize` Vercel Function together.
- `npm run typecheck` runs the strict TypeScript project build without emitting files.
- `npm run lint` runs type-aware ESLint checks over the TypeScript source.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## Current application flow

Unauthenticated visitors can sign up or sign in with email and password. After Firebase restores or creates a session, the text summarizer becomes available. The browser posts the submitted text to `/api/summarize`; the server-side function attaches the private credential and calls the `sshleifer/distilbart-cnn-12-6` model through the current Hugging Face Inference router. The returned summary can be copied to the clipboard.
