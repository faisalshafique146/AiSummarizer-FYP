# HiSumz AI

HiSumz AI is a TypeScript and React application that summarizes pasted text with the Hugging Face Inference API. Email/password accounts and sessions are managed with Firebase Authentication. Vite and Tailwind CSS provide the development and styling toolchain.

## Local setup

Requirements: Node.js and npm.

1. Install the locked dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and replace every placeholder with the Firebase web-app configuration and a Hugging Face development token.

3. Start the development server:

   ```bash
   npm run dev
   ```

Vite exposes every `VITE_*` variable to browser code. Firebase web configuration is public client metadata and must be protected with appropriate Firebase Authentication settings and API-key restrictions. A Hugging Face access token is different: it should be moved behind a server-side endpoint before production deployment.

## Available commands

- `npm run dev` starts Vite in development mode.
- `npm run typecheck` runs the strict TypeScript project build without emitting files.
- `npm run lint` runs type-aware ESLint checks over the TypeScript source.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.

## Current application flow

Unauthenticated visitors can sign up or sign in with email and password. After Firebase restores or creates a session, the text summarizer becomes available. The submitted text is sent to the `sshleifer/distilbart-cnn-12-6` model through Hugging Face, and the returned summary can be copied to the clipboard.
