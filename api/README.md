# API layer

All network calls to the backend live under `api/`, organized one folder per domain/resource. `services/` (sibling folder) is reserved for non-network device/media code (audio playback, websocket streaming, mic recording) — nothing in `services/` talks to the backend.

## Backend shape

There is exactly **one** real HTTP endpoint: an AWS Lambda Function URL (`LAMBDA_SERVICE_URL` in `constant.js`). Every "endpoint" is the same POST request, differentiated by a `route` field in the JSON body. The wire contract for this lives in `api/types.ts` (`LambdaRequest`, the `route` union; `LambdaResult<T, R>`, the response envelope).

## Folder-per-domain convention

Each domain folder (`api/user/`, `api/awarenessLogs/`, `api/meditation/`, etc.) contains up to three files:

- **`requests.ts`** — raw network calls. A `useXxx()` hook (or plain async function, for non-lambda calls like `speechToText`) that wraps `useFetch` and returns the bare `commonFetch` promise. This is the only layer that touches `LAMBDA_SERVICE_URL` / builds a `LambdaRequest`.
- **`types.ts`** — every input type and result type for that domain, in one file. Don't split input types into `requests.ts` and result types into a shared file — if it's part of this domain's request/response shape, it lives in this domain's `types.ts`.
- **`useXxx.ts`** (only where a feature needs it) — the stateful hook a screen actually calls: wraps the raw request(s), owns `isLoading`/`error` state, and surfaces failures via `useToast`. Domains with no meaningful client-side state (`user`, `registrationQuestion`) skip this file — screens call the `api/api.ts` facade directly instead.

Optionally a domain may have a private helper (e.g. `api/meditation/meditationService.ts`, `api/speechToText/speechToTextService.ts`) implementing shared status-machine logic. Only that domain's own `useXxx.ts` imports it — never import a domain's internal helper from outside the folder.

This keeps every domain exactly **two layers deep** as seen by a consumer: `requests.ts` (raw) → `useXxx.ts` (stateful). No domain should grow a longer chain than that — if you're tempted to add a pass-through wrapper "for later," don't; add the real logic directly to the one hook that needs it.

## Shared files (api/ root)

- **`useFetch.tsx`** — the one HTTP client hook every domain's `requests.ts` calls. Builds the request payload (auth token, device metadata via `utils/requestContext.ts`), does the fetch, and redirects to `/welcome` on a 401.
- **`types.ts`** — only truly cross-domain types: `LambdaRequest`, `LambdaResult`, plus the couple of types genuinely shared by more than one domain (`RecentlyAccessedSession`, `MeditationCourseSummary`). If a type is only used by one domain, it belongs in that domain's `types.ts`, not here.
- **`api.ts`** — a facade that composes several domains' raw request hooks into one `useXxxApi()` object per domain (e.g. `useUserApi()`, `useAwarenessLogsApi()`). Screens that don't need a stateful `useXxx.ts` hook (login, registration, profile) call this directly.

## Naming

- Domain folder name = the resource/noun (`awarenessLogs`, `meditation`, `chatMessages`) — no `use` prefix, no `Api` suffix on the folder itself.
- Hooks and functions inside the folder use the `useXxx`/`getXxx` naming that describes what they do, as usual.

## Adding a new endpoint

1. Pick (or create) the domain folder it belongs to.
2. Add the request function to that domain's `requests.ts`, and its input/result types to that domain's `types.ts`.
3. If the screen needs loading/error state or a toast on failure, add it to that domain's `useXxx.ts` (or create one).
4. Wire it into `api/api.ts` only if the screen is going to call the facade directly instead of a `useXxx.ts` hook.

## Known follow-ups (not fixed by this reorg, flagged for later)

- `constant.js` hardcodes a developer's local IP as `LAMBDA_SERVICE_URL` and a plaintext `SECRET_TOKEN` — these should move to environment-based config (e.g. `app.config` + `expo-constants`) rather than being committed to source.
- Three raw `fetch()` calls in `utils/helper.tsx` (`addRecentlyAccessedSession`, `updateSessionProgress`, `updateFavourite`) bypass `useFetch` entirely and don't get its 401-handling. They were left as-is during this reorg since moving them is a behavior change, not a pure structural move — worth migrating into `api/user/` (or a new small domain) in a later pass.
