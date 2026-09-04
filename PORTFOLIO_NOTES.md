# HiSumz Portfolio Notes

## 1. 30-second explanation

HiSumz is a focused text-summarization application. A user creates an account with Firebase, pastes an English article or passage, and receives a shorter result they can review beside the source and copy. The important engineering change is that the browser never receives the private Hugging Face token: React calls a typed internal API, and the server function validates the request before contacting the model. The project demonstrates a complete modernization from a 2024 JavaScript student prototype to a strict TypeScript application with responsive UI, dark mode, accessible forms, explicit async states, and focused automated tests.

## 2. 2-minute technical walkthrough

1. `src/main.tsx` mounts React in Strict Mode and installs two lightweight providers: `ThemeProvider` and `AuthProvider`.
2. `AuthProvider` owns the only Firebase auth subscription. It exposes the authenticated user, the initial loading state, and sign-in, sign-up, and sign-out operations through `useAuth`.
3. React Router provides `/`, `/sign-in`, and `/sign-up`. Authentication uses dedicated pages, so navigation and UI state are not mixed.
4. React Hook Form manages form interaction. Zod schemas trim and validate display name, email, password, and password confirmation. Firebase error codes are mapped to stable, user-facing messages.
5. Authenticated users see `SummarizerWorkspace`. The `useSummarizer` hook owns a small discriminated union: idle, submitting, success, validation error, or API error. It also owns cancellation and prevents duplicate requests.
6. Shared validation trims input, rejects whitespace, requires at least 30 words, and caps input at 12,000 characters. The same rules run in the browser and server function.
7. `summarizationService.ts` knows only `/api/summarize` and defensively parses unknown JSON. It has no Hugging Face credential or model URL.
8. `api/summarize.ts` reads the server-only token, calls the fixed DistilBART model with a timeout and deterministic length controls, maps provider failures, and refuses to return a result that is not shorter than its source.
9. Vitest and React Testing Library mock Firebase and network boundaries. The current suite has 22 behavior-focused tests across 8 files.
10. Vite builds the client, a small development plugin mounts the production handler locally, and `vercel.json` supplies the production SPA rewrite and function duration.

## 3. Original problems

- The Hugging Face bearer token used a `VITE_` variable and was delivered to browser code.
- React components called Hugging Face directly and assumed one unvalidated response shape.
- Firebase auth observation lived in `App`, logout only changed local state, and initial loading could show the wrong screen.
- Authentication was simultaneously modeled as routes and local modal state.
- `Hero` destructured props incorrectly and mutated a prop.
- The generic `Demo` component name did not describe its summarizer responsibility.
- Forms manually tracked values, used weak validation, exposed raw Firebase messages, and included a non-functional Remember Me control.
- Fixed `w-96`/`h-96` layouts overflowed small screens.
- Loading, failure, retry, cancellation, and clipboard failure states were missing or console-only.
- Redux, React Redux, Xenova Transformers, and other packages were installed without being used.
- The README claimed URL summarization, Redux Toolkit Query, configurable lengths, and history that were not implemented.
- There were no TypeScript checks or automated tests.

## 4. Architecture improvements

- Split the application into small `app`, `components`, `features`, `lib`, `api`, and `config` boundaries.
- Centralized Firebase initialization and authentication operations.
- Kept global state limited to auth and theme context; summarizer state remains local to a focused hook.
- Moved transport and response parsing out of presentation components.
- Shared summarization validation between client and server.
- Added a Vercel Web Handler while reusing it in Vite development through a thin adapter.
- Lazy-loaded the two authentication routes and configured SPA deep-link fallback for Vercel.

## 5. Security improvement

Originally, a private Hugging Face token was compiled into the browser bundle. UI authentication did not protect it because browser users could inspect the JavaScript or request headers.

The React client now posts only source text to `/api/summarize`. The server function reads `HUGGING_FACE_API_TOKEN`, attaches it to the upstream request, and returns a normalized success/error contract. Inputs are validated, requests time out, provider details are not forwarded, and responses are marked `no-store`.

This fixes credential delivery to the browser. It is not a complete abuse-prevention layer: the endpoint still needs Firebase ID-token verification and rate limiting before being treated as a protected production API.

## 6. UI/UX improvement

- Replaced the prototype hero and glowing controls with a restrained editorial SaaS layout.
- Added a compact header, clear signed-out landing page, and purpose-built workspace.
- Made source and summary panels stack on narrow screens and align side by side on larger screens.
- Added fluid textareas, word/character feedback, clear/start-over actions, copy feedback, and useful empty/loading/error states.
- Added a persisted light/dark theme without adding a theme package.
- Replaced browser alerts with inline alerts and toasts.
- Added semantic regions, explicit labels, visible focus treatment, status announcements, and reduced-motion behavior.

## 7. TypeScript improvement

- Migrated all executable application, API, configuration, and test source from JavaScript/JSX to TypeScript/TSX.
- Enabled strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, unused-code checks, and no-emission typechecking.
- Modeled auth users, form inputs, request/response contracts, error codes, component props, and event handlers explicitly.
- Parsed external API data from `unknown` with runtime guards rather than assertions, `any`, or suppression comments.
- Used discriminated unions for both summarization responses and UI request state.

## 8. Testing approach

The suite favors behavior and boundaries over snapshots or class-name assertions:

- Zod sign-in/sign-up validation and normalization.
- Friendly Firebase error behavior and password visibility.
- Immediate auth-provider state after successful auth operations.
- Signed-out versus authenticated home UI.
- Empty, short, oversized, loading, success, failure, retry, and copy workflow behavior.
- Typed internal API parsing and safe handling of malformed responses.
- API request validation, rate-limit mapping, provider payload shape, successful parsing, and rejection of non-shorter results.
- Theme toggling and persisted preference.

Firebase and Hugging Face are mocked at service boundaries. Unit and component tests do not make real third-party requests.

## 9. Important tradeoffs

| Decision | Reason | Cost |
| --- | --- | --- |
| Firebase Auth context instead of Redux/Zustand | The app has one small global auth concern | Context is not intended for a much larger domain state graph |
| Dedicated auth routes | Clear navigation, deep links, and simpler focus behavior | Auth is not an in-place dialog experience |
| One serverless function | Small deployment surface for one backend operation | No shared backend platform for future features |
| Fixed DistilBART model | Keeps scope honest and inference integration simple | Best suited to English/news-like prose and not guaranteed factual |
| Shared validation module | Keeps client UX and server enforcement consistent | Browser validation remains convenience, never the security boundary |
| Character/word limits | Prevents obviously unsuitable or abusive requests | Accepted long text can still exceed the model's token context |
| Custom Tailwind primitives | Removes Material Tailwind weight and gives visual control | The project owns accessibility and state styling for those primitives |
| No history or persistence | Keeps the product focused and avoids storing user text | Users cannot revisit earlier summaries |

## 10. Truthful resume bullets

- Modernized a React 18 JavaScript final-year project to React 19 and strict TypeScript, migrating 39 non-test source/configuration files without `any` or TypeScript suppression directives.
- Moved Hugging Face inference behind a typed Vercel Function so the private provider token is no longer included in browser code or requests.
- Designed a shared client/server validation and error contract covering invalid input, rate limits, model availability, provider failures, and unusable summaries.
- Refactored Firebase Authentication into a single provider/service boundary with session loading, dedicated auth routes, friendly errors, and real sign-out behavior.
- Rebuilt the summarization workflow with explicit async states, cancellation, retry, preserved input, clipboard feedback, and duplicate-request prevention.
- Replaced fixed prototype layouts and Material Tailwind with responsive custom Tailwind primitives, keyboard-visible focus states, and persisted dark mode.
- Added 22 behavior-focused Vitest and React Testing Library tests across schema, auth, API, service, theme, and user-workflow boundaries.

## 11. Likely interview questions

1. Why did you move the Hugging Face request to the server?
2. Is the summarization endpoint now secure?
3. Why use Context instead of Redux or Zustand?
4. How do client and server validation stay consistent?
5. How do you handle unknown API responses safely?
6. How does authentication avoid flashing the signed-out UI?
7. Why did you choose dedicated auth pages instead of dialogs?
8. What caused short inputs to produce repetitive summaries, and how did you address it?
9. What did you test, and what did you intentionally not test?
10. What would you build next before calling this production-ready?

## 12. Concise suggested answers

1. **Server-side inference:** A `VITE_` token is public by design. The internal endpoint keeps the token in server environment variables and gives the browser a stable application-owned contract.
2. **Security scope:** The credential exposure is fixed, input is bounded, upstream errors are normalized, and requests time out. The endpoint is still publicly callable because Firebase ID tokens and rate limits are not yet enforced server-side.
3. **State choice:** Auth and theme are the only cross-route state. Context is enough; summarizer form/request state belongs in a local hook. Redux would add ceremony without solving a real problem here.
4. **Shared validation:** `validation.ts` is imported by the hook, client service, and API handler. The server always revalidates because browser checks can be bypassed.
5. **Defensive parsing:** Fetch results begin as `unknown`. Type guards verify the discriminant, summary, error code, message, and retryable flag before the UI receives them.
6. **Auth loading:** `AuthProvider` starts with `loading: true` and clears it only when Firebase produces a user, null, or an observer error. Successful operations also update provider state immediately.
7. **Auth navigation:** Dedicated routes are simpler to understand, support browser history and deep links, and avoid the original modal state being unmounted by navigation.
8. **Short-summary bug:** The model's default minimum output length could expand short input. The server now sets deterministic proportional token limits and rejects output that is not shorter than the source.
9. **Testing scope:** Tests cover validation, state transitions, error mapping, API contracts, auth gating, password/theme behavior, and copy success with mocked boundaries. Real provider calls, deployed E2E behavior, and visual regression are intentionally outside the unit suite.
10. **Next production work:** Verify Firebase tokens in the function, rate-limit callers, handle long documents through tested chunking, evaluate model factuality, and add deployed Playwright/axe checks.

## 13. 3–5 minute project demo sequence

**0:00–0:30 — Product framing**

- Open the signed-out landing page.
- Explain that HiSumz accepts pasted text only and deliberately avoids fake history, chat, and model controls.
- Toggle dark mode once to show the persisted visual system.

**0:30–1:15 — Authentication**

- Open Create account or Sign in.
- Submit an invalid email/password combination to show field-level validation.
- Show the password visibility control, then sign in with a prepared demo account.

**1:15–2:30 — Core workflow**

- Paste a non-sensitive English passage between roughly 150 and 400 words.
- Point out word/character feedback and the keyboard shortcut.
- Generate a summary and explain the submitting state, cancellation option, two-panel review, and truthful word count.
- Copy the result and show the non-blocking confirmation.

**2:30–3:20 — Failure and recovery**

- Clear the workspace and submit whitespace or a short title to show local validation without an API call.
- Explain that retry appears only for errors marked retryable and that source text remains intact after failure.

**3:20–4:20 — Architecture and security**

- Show `summarizationService.ts` calling `/api/summarize`.
- Show `api/summarize.ts` reading the unprefixed server token and mapping upstream responses.
- State the limitation clearly: the token is hidden, but endpoint auth verification and rate limiting are future work.

**4:20–5:00 — Quality evidence**

- Show the colocated tests and `npm run check` script.
- Mention the verified 22 tests, strict typecheck, zero-warning lint, and production build.
- End with the before/after bundle measurements from `FINAL_MODERNIZATION_REPORT.md`.
