# Changelog

## 2026-08-11 — Fix chat message race conditions/mixups, add Sentry observability

**The bug:** in the chat screen, AI responses sometimes never appeared, and after sending a
follow-up message, AI/human bubbles sometimes rendered mixed up. It was intermittent and there
was no production logging (only `console.log`) to prove what was actually happening. See the
paired backend changelog (`lhamo/CHANGELOG.md`) — both sides are tied together by a single
client-generated `request_id` per chat turn, so one conversation turn can be traced across both
services in Sentry.

If you're new to this codebase, read the **Concepts** section first — it explains the underlying
problems in plain terms before the changelog gets into specific files/functions.

---

### Concepts (for anyone new to this kind of bug)

**Race condition.** A bug that only happens when two things run out of expected order — usually
invisible in normal testing because timing "just works" most of the time, and only breaks under
real-world network latency or a fast double-tap. This whole changelog is about one root cause:
the code assumed requests would always *resolve* in the order they were *sent*, and never checked.

**Stale closure.** In React, a function created during a render "closes over" (captures) the state
values from *that* render. `const handleSend = () => { if (isAiLoading) return; ... }` reads
whatever `isAiLoading` was when this particular `handleSend` was created — not necessarily what
it is *right now*. If the user taps twice fast enough, both taps can read `isAiLoading === false`
because neither tap has waited for a re-render yet. `useRef` doesn't have this problem: `ref.current`
is a plain mutable value shared across every render, read synchronously, no re-render needed.

**AbortController.** The standard browser/RN API for cancelling an in-flight `fetch`. You create
one, pass its `.signal` into `fetch(url, { signal })`, and calling `controller.abort()` makes that
`fetch` reject with an error named `"AbortError"`. It's how we actually cancel a superseded network
request instead of just ignoring its result when it eventually arrives.

**"Generation" / request-id counter.** A cheap way to make async work self-cancelling. Bump a
counter (or ref) every time you start new async work, and capture that value in a local variable.
When the async work finishes, compare the captured value to the *current* counter — if they don't
match, something newer has started since, so silently drop this result instead of applying it.

**Reconciliation.** In this codebase, "reconciliation" means: when the AI's response comes back,
find the right placeholder bubble in the `messages` array and swap it for the real content. The
bug was that this used to just grab `messages[messages.length - 1]` (the last item) and hope it
was the right one — which is safe only if requests always resolve in send order. They don't.

---

### Fixed

- **FlatList key collisions could render the wrong bubble as the wrong role.**
  `generateRandomNumber()` (`utils/helper.tsx`) returned a plain random int from `1–10000`, used
  as the `id` for *both* the optimistic human bubble and the AI "loading" placeholder.
  `FlatList`'s `keyExtractor` used that id directly as the React reconciliation key. Two messages
  landing on the same random number in one session meant React could reuse/misrender the wrong
  bubble under that key — a very plausible direct cause of "AI message became a human message."
  **Fix:** `generateClientMessageId()` — a counter combined with `Date.now()`, always returned as
  a *negative* number. Real DB message ids are always positive, so a client-side id can never
  collide with a persisted one, and the counter means it can't collide with itself either.

- **Stale AI responses could silently overwrite newer ones ("last to resolve wins").**
  `useFetchAiMessage.ts` had no concept of "this response belongs to an older request." If two
  `fetchMessage()` calls were ever in flight — possible via a fast double-tap, since the
  `isAiLoading` guard in `handleSend` is a stale closure (see Concepts above) — whichever network
  response came back *last* got applied to `aiMessage`, even if it was actually the *older* of the
  two requests. **Fix:** a generation-counter ref (see Concepts) that makes a superseded call's
  eventual resolution a silent no-op, plus a real `AbortController` that cancels the superseded
  network request outright instead of letting it finish pointlessly in the background.

- **Reconciliation assumed the loading bubble was always the last item in the array.**
  The effect that swaps the "loading" placeholder for the real AI response did
  `prevMessages[prevMessages.length - 1]` — correct only if messages are strictly append-only in
  request order, which stops being true the moment two requests overlap. **Fix:** every human
  message, its loading placeholder, and the outgoing request now carry the same `request_id`
  (`api/chatAi/types.ts`). When a response arrives, reconciliation does
  `prevMessages.findIndex(m => m.status === "loading" && m.requestId === aiRequestId)` and updates
  *that* slot, wherever it actually sits in the array — see the reply to your Q3 in chat for a
  worked example of why this keeps the array in the right order even if responses arrive
  out of order.

- **A slow response from a previous chat session could bleed into a newly opened one.**
  Switching chats cleared the local `messages` array but never touched
  `useFetchAiMessage`'s *internal* state — so a request started in session A could still resolve
  and render itself after the user had already navigated to session B. **Fix:** the hook now
  exposes `reset()` (clears state, bumps the generation counter, aborts any in-flight request),
  called from the session-switch effect.

- **Pressing back mid-request left a request running with nothing watching it.**
  The fix above only covered *switching* sessions while the screen stays mounted — it didn't cover
  leaving the screen entirely (header back button). React discards a component's `useState` values
  automatically on unmount, but it does **not** cancel promises/timers you started — an in-flight
  `fetch` just keeps running in the background. **Fix:** added an unmount cleanup effect (mirrors
  the existing audio `dispose()` cleanup already in the file) that calls `reset()` when the chat
  screen itself unmounts.

- **No timeout/cancellation on the shared fetch wrapper widened the race window on slow networks,
  and errors were silently swallowed.** `api/useFetch.tsx`'s `commonFetch` had no timeout, and its
  catch block did `throw new Error("Error occurred while handling response")` — discarding
  whatever the *real* underlying error was. **Fix:** a default 45s timeout (`DEFAULT_TIMEOUT_MS`,
  composed with any caller-supplied `AbortSignal` so either can cancel the request), and errors now
  preserve the original cause via `new Error(msg, { cause: e })` so Sentry captures are actually
  useful instead of a generic message.

- **Double-tap send could slip past the `isAiLoading` guard.** Same stale-closure problem as
  above. **Fix:** a synchronous `isSendingRef` (a `useRef`, not `useState`) checked/set immediately
  in `handleSend` and `handleGuidedMeditationBegin`, alongside the existing `isAiLoading` check.

- Added a `409` ("A response is already being generated for this chat") toast path for the new
  backend session-lock rejection — see the backend changelog for what triggers it.

### Added — Observability

- Installed `@sentry/react-native` and initialized it in `app/_layout.tsx`
  (`Sentry.init(...)` + `Sentry.wrap(RootLayout)`) — this app had **zero** crash/error reporting
  before this. DSN is read from `constant.js`'s `SENTRY_DSN` (currently an empty string, which
  makes Sentry a safe no-op — put the real project DSN there before relying on this in a build).
- New `utils/chatTelemetry.ts` (`addChatBreadcrumb`, `setChatSessionContext`,
  `captureChatException`), wired into the chat flow at every point where something previously
  invisible could go wrong:
  - `session_opened` — tags the current `session_id` so every subsequent event in Sentry is
    grouped by conversation.
  - `message_sent` — logged when a human message is sent, tagged with its `request_id`.
  - `ai_response_received` — the happy path.
  - `ai_response_discarded_stale` — **the single most important breadcrumb added.** This fires
    exactly when the generation-counter check catches a stale response and throws it away. Before
    this change, that moment was completely invisible — it's the direct fingerprint of the race
    condition this changelog fixes. If this ever shows up in production after this fix, it
    confirms the race is still happening (rather than being prevented) and is the first thing to
    check.
  - `ai_request_superseded` — a request was cancelled via `AbortController` because a newer one
    started.
  - `loading_placeholder_replaced` / `loading_placeholder_dropped_error` — records exactly which
    placeholder got resolved or dropped, and for which `request_id`.
  - All of the above carry `request_id`/`session_id` tags, so a single chat turn can be found in
    Sentry and cross-referenced with the matching backend log/event by the same `request_id`.
- `api/useFetch.tsx` now reports non-superseded fetch failures to Sentry with `url`/`method`/`route`
  tags (superseded/aborted requests are intentionally *not* reported — they're expected, not bugs).

### Files changed

`utils/helper.tsx`, `app/chat/new_index.tsx`, `api/chatAi/useFetchAiMessage.ts`,
`api/chatAi/types.ts`, `api/chatAi/requests.ts`, `api/useFetch.tsx`, `app/_layout.tsx`,
`app.json` (added `@sentry/react-native` Expo config plugin), `package.json`, `constant.js`
(added `SENTRY_DSN`), new `utils/chatTelemetry.ts`.

### If you're debugging a "messages mixed up" report after this change

1. Search Sentry (mobile project) for the user's `session_id` around the reported time.
2. Look for an `ai_response_discarded_stale` breadcrumb — if present, two requests raced and the
   fix correctly discarded the stale one (working as intended; if bubbles were *still* wrong, the
   bug is elsewhere).
3. Grab the `request_id` from around that time and search the **backend** Sentry project for the
   same tag — you'll see the matching server-side log/event for that exact turn, letting you see
   both sides of the same request without guessing at timestamps.
