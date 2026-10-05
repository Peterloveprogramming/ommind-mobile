# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (code) — awaiting manual smoke test on device.

## Current Goal

- 01-hook-up-dream-to-backend: `Analyze Dream` on the dream write/edit
  screen opens a new chat and sends the dream to the backend `chat` route
  with `category: "dream"`.

## Completed

- `constant.js`: added `DREAM = "dream"`.
- `api/chatAi/types.ts`: `category` widened to `"guided_meditation" | "dream"`.
- `api/chatAi/useFetchAiMessage.ts`: added `getRequestedMode` /
  `getWorkflowExecutedForMode` helpers; dream mode is preserved and passed
  through as `workflow_executed: "dream"` on the AI message (live and test
  paths). No playback / recently-accessed behaviour for dream.
- `app/chat/new_index.tsx`:
  - `DREAM_ANALYSIS_PREFIX`, idempotent `buildDreamAnalysisDisplayMessage`,
    `parseDreamAnalysisPayloadParam`.
  - New route param `dream_analysis_payload` (JSON
    `{ dreamLogId, dreamJournal }`).
  - One-shot auto-send guarded by `hasTriggeredInitialDreamAnalysisRef`:
    optimistic human bubble (formatted wrapper, `workflow_executed: DREAM`,
    matching `requestId`) + `fetchMessage({ category: DREAM, user_message:
    trimmed raw dream }, requestId)`.
  - History loader formats human messages with `workflow_executed === DREAM`
    using the same helper.
- `app/journal/write.tsx`: dream-only `Analyze Dream` button below the
  optional details panel (brand-yellow CTA matching the journal tab's
  `Start Writing` button). Saves/updates the dream first, then pushes
  `/chat/new_index` with a fresh `session_id` (no `existing_chat`).
  Disabled when text is empty, while saving, or while analyzing.
- `npm run lint`: 0 errors, no new warnings (42 pre-existing, none in
  touched files). `tsc --noEmit` clean for touched files.

## In Progress

- None.

## Next Up

- Manual smoke test (spec "Verification" section): create/open dream →
  Analyze Dream → confirm new chat, exact wrapper as first message, AI
  response second → reopen from chat history, wrapper still shown.

## Open Questions

- `04-add-dream-workflow.md` was never found in the backend repo; contract
  is based on the backend diff in `/Users/zimingyan/PycharmProjects/lhamo`.
  Confirm backend is deployed before smoke testing.
- The "Write a dream before analyzing." toast is effectively defensive only,
  since the button is disabled when the text is empty.

## Architecture Decisions

- Payload vs display split: backend receives the trimmed raw dream as
  `user_message` (dream workflow treats the user's words as primary
  evidence); the UI shows the `Analyze the dream journal below` wrapper.
  History re-applies the wrapper because the backend persists the raw text.
  The helper is idempotent in case the backend later stores the wrapper.
- The dream auto-send effect in `new_index.tsx` is declared *after* the
  session-switch effect on purpose: effects run in declaration order, and
  the session-switch effect clears `messages` and calls
  `resetAiMessageState()` (which aborts in-flight requests). Declaring the
  auto-send first would wipe the optimistic bubble and abort the request.
- Entry point is only the single-dream write/edit screen; the commented
  multi-select analyze flow in `app/(tabs)/journal.tsx` and the old
  `analyze_dream` endpoint were intentionally left untouched.

## Session Notes

- Changes are uncommitted on `main`.
- Possible pre-existing issue (not changed): the guided-meditation auto-send
  effect in `new_index.tsx` is declared *before* the session-switch effect,
  so on first mount its request may be aborted by `resetAiMessageState()`.
  Worth verifying separately.
