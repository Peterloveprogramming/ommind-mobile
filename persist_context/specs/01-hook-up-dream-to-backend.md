# Hook Up Dream Journal Analysis To Backend Dream Workflow

## Goal

Add frontend support for the new backend dream workflow from the dream journal edit/write screen.

When a user is writing or editing a single dream journal, they should see an `Analyze Dream` action. Tapping it should create a brand-new chat, send that one dream journal to the normal backend `chat` route with `category: "dream"`, and show the dream analysis conversation in the chat UI.

The resulting chat should show:

```text
Analyze the dream journal below

---
actual dream journal
---
```

as the first human message, followed by the backend response as the second message.

## Important Source Note

I could not find `04-add-dream-workflow.md` under `/Users/zimingyan/PycharmProjects/lhamo` or as a tracked/untracked markdown file in that backend checkout. This handoff is based on the actual uncommitted backend code diff in `/Users/zimingyan/PycharmProjects/lhamo`.

## Backend Contract Reviewed

The backend now supports `category: "dream"` through the regular `chat` route.

Relevant backend files reviewed:

- `/Users/zimingyan/PycharmProjects/lhamo/controllers/api/chat.py`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/orchestration/categories.py`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/orchestration/config.py`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/orchestration/workflow_runners.py`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/orchestration/steps.py`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/workflows/dream/*`
- `/Users/zimingyan/PycharmProjects/lhamo/llm/workflows/internal/response/*`

Key findings:

- The route is still `route: "chat"`.
- The client must explicitly send `category: "dream"`.
- The agent router is not allowed to choose dream by itself.
- Dream requests require a non-empty `user_message`.
- The dream workflow uses the user's own dream words as primary evidence.
- Dream requests should not rely on intent-enriched/re-written content.
- The backend persists the turn with `workflow_executed: "dream"`.
- The backend persists the human message content as the request `user_message`.
- The backend returns the normal chat response shape:

```ts
{
  statusCode: 200,
  response: "success",
  data: {
    id: number,
    session_id: string,
    content: string,
    role: string,
    request_id?: string
  }
}
```

Recommended request payload:

```ts
{
  route: "chat",
  session_id: newSessionId,
  request_id: requestId,
  category: "dream",
  user_message: trimmedRawDreamLog
}
```

Do not call or revive the older commented `analyze_dream` endpoint path. The new backend workflow is reached through `chat` plus `category: "dream"`.

## Product Behavior

Add the action only for dream journals, not awareness journals.

Only one dream journal should be analyzed at a time. This should come from the current dream write/edit screen state, not from multi-select on the journal list.

When `Analyze Dream` is tapped:

1. Validate that the current dream journal text is not empty after trimming.
2. Save the current dream log first.
   - If this is a new dream, create it.
   - If this is an existing dream, update it with the current text and optional dream details.
   - If save/update fails, do not navigate or send the chat request.
3. Generate a new chat `session_id`.
4. Navigate to `/chat/new_index` as a new chat, not `existing_chat`.
5. Auto-send a single dream workflow request from the chat screen.
6. Display the first human chat bubble using this exact display template:

```ts
const buildDreamAnalysisDisplayMessage = (dreamText: string) =>
  `Analyze the dream journal below\n\n---\n${dreamText.trim()}\n---`;
```

7. Display the backend response as the next AI bubble.

## Payload Vs Display

Use two different strings deliberately:

- Backend payload: send the trimmed raw dream log as `user_message`.
- Chat UI display: show the formatted `Analyze the dream journal below` wrapper.

This preserves the backend dream workflow assumption that the dream journal itself is the primary evidence, while still matching the requested chat transcript.

Because the backend persists dream turns with `workflow_executed: "dream"` on both human and AI messages, the chat history loader should also format human dream messages with the same display helper. Make the helper idempotent so it does not double-wrap content if a future backend change starts storing the formatted prompt.

Example:

```ts
const DREAM_ANALYSIS_PREFIX = "Analyze the dream journal below";

const isDreamAnalysisDisplayMessage = (content: string) =>
  content.trim().startsWith(DREAM_ANALYSIS_PREFIX);

const buildDreamAnalysisDisplayMessage = (dreamText: string) => {
  const trimmed = dreamText.trim();
  if (isDreamAnalysisDisplayMessage(trimmed)) {
    return trimmed;
  }

  return `${DREAM_ANALYSIS_PREFIX}\n\n---\n${trimmed}\n---`;
};
```

## Frontend Files To Update

Likely files:

- `constant.js`
- `api/chatAi/types.ts`
- `api/chatAi/useFetchAiMessage.ts`
- `app/journal/write.tsx`
- `app/chat/new_index.tsx`

Potentially touched only if useful:

- `api/dreamLogs/types.ts`
- `api/dreamLogs/requests.ts`
- `api/dreamLogs/useDreamLogs.ts`
- `api/api.ts`
- `app/(tabs)/journal.tsx`

Avoid reviving the old multi-log analyze flow in `app/(tabs)/journal.tsx`. The requested entry point is the dream edit/write screen.

## Suggested Implementation Plan

### 1. Add a Dream Constant

In `constant.js`, add:

```js
export const DREAM = "dream"
```

Use this constant anywhere the frontend compares workflow category or mode.

### 2. Widen Chat Category Types

In `api/chatAi/types.ts`, allow dream:

```ts
category?: "guided_meditation" | "dream";
```

Optionally introduce a shared type if that fits the local style.

### 3. Preserve Dream Mode In `useFetchAiMessage`

In `api/chatAi/useFetchAiMessage.ts`, import `DREAM` and update `requestedMode`.

Current behavior only distinguishes guided meditation from general. Dream should be preserved:

```ts
const requestedMode =
  chatAiInput.category === GUIDED_MEDITATION
    ? GUIDED_MEDITATION
    : chatAiInput.category === DREAM
      ? DREAM
      : GENERAL;
```

When building the AI message, pass `DREAM` through as `workflow_executed` the same way guided meditation is inferred locally. Do not add playback behavior for dream responses.

Suggested helper:

```ts
const getWorkflowExecutedForMode = (mode: string | null) =>
  mode === GUIDED_MEDITATION || mode === DREAM ? mode : null;
```

Then use it when calling `buildChatMessageItem`.

### 4. Add Auto-Send Support To Chat Screen

In `app/chat/new_index.tsx`, add a route param for dream auto-send. A simple option is a JSON string:

```ts
dream_analysis_payload?: string | string[];
```

Suggested payload shape:

```ts
type DreamAnalysisLaunchPayload = {
  dreamLogId?: string | number | null;
  dreamJournal: string;
};
```

Add a parser similar to `parseGuidedMeditationSelectionParam`.

Add a `hasTriggeredInitialDreamAnalysisRef` guard like the guided meditation guard so the auto-send only runs once.

When a valid payload is present and this is not an existing chat:

- Build the display message with `buildDreamAnalysisDisplayMessage(payload.dreamJournal)`.
- Add an optimistic human message to `messages` with:
  - `role: "human"`
  - `content: displayMessage`
  - `workflow_executed: DREAM`
  - matching `requestId`
- Call:

```ts
await fetchMessage(
  {
    category: DREAM,
    user_message: payload.dreamJournal.trim(),
  },
  requestId
);
```

Use the same loading placeholder/request correlation pattern as `handleSend`.

Do not set `existing_chat: "true"` for this initial navigation. This is a new chat session and the chat screen should auto-send the first request.

### 5. Format Dream Human Messages On History Load

In the existing history mapping in `app/chat/new_index.tsx`, if a loaded message is:

- `message.role === "human"`
- `message.workflow_executed === DREAM`

then display:

```ts
buildDreamAnalysisDisplayMessage(message.content)
```

instead of the raw persisted `message.content`.

This keeps reopened dream analysis chats consistent with the requested transcript while keeping the backend payload raw.

### 6. Add `Analyze Dream` To The Dream Write/Edit Screen

In `app/journal/write.tsx`, add a dream-only button.

Recommended placement:

- Inside the dream scroll content, after the text input and optional dream detail panel, or as a bottom action in the dream screen.
- Keep the existing `Save`/`Update` header action unchanged.
- Only show this button for `isDreamJournal`.

Button text:

```text
Analyze Dream
```

Disable it when:

- the trimmed entry text is empty
- a dream log save/update is in progress
- an analyze navigation/save is already in progress

Suggested handler behavior:

```ts
const handleAnalyzeDream = async () => {
  const trimmedEntryText = entryText.trim();
  if (!isDreamJournal || !trimmedEntryText || isSaving || isAnalyzingDream) {
    return;
  }

  setIsAnalyzingDream(true);
  try {
    const dreamLogContext = getDreamLogContextForSave();
    const savedDreamLog = isEditMode
      ? await updateDreamLog({
          dream_log_id: logId,
          log: trimmedEntryText,
          ...dreamLogContext,
        })
      : await createDreamLog({
          log: trimmedEntryText,
          ...dreamLogContext,
        });

    if (!savedDreamLog) {
      return;
    }

    const sessionId = generateUniqueId();
    router.push({
      pathname: "/chat/new_index",
      params: {
        session_id: sessionId,
        dream_analysis_payload: JSON.stringify({
          dreamLogId: savedDreamLog.id ?? logId ?? null,
          dreamJournal: trimmedEntryText,
        }),
      },
    });
  } finally {
    setIsAnalyzingDream(false);
  }
};
```

The exact styling can follow the journal screen's existing primary CTA style or the current save/action typography. Keep it visually clear that it is a primary dream action.

### 7. Leave The Journal List Multi-Select Alone

`app/(tabs)/journal.tsx` has commented reflection/analyze code that was designed around selected log ids and up to `MAX_SELECTED_ENTRIES`.

Do not use that path for this request. The product requirement is single dream journal analysis from the dream edit screen.

## Edge Cases

- Empty dream: do not analyze. Show a toast such as `Write a dream before analyzing.`
- Save/update failure: stay on the write screen and rely on existing dream log error handling/toasts.
- Double tap: disable the button while saving/analyzing and rely on the chat screen's request guard.
- Existing dream with unsaved edits: analyze the current edits, not stale route-param content.
- New unsaved dream: create the dream log first, then launch the chat.
- Reopening the generated chat later: history should show the formatted first human message and the persisted AI response.

## Acceptance Criteria

- A dream journal write/edit screen shows `Analyze Dream`.
- Awareness journal screens do not show `Analyze Dream`.
- Tapping `Analyze Dream` saves the current dream first.
- Tapping `Analyze Dream` opens a brand-new chat session.
- The chat screen immediately shows exactly:

```text
Analyze the dream journal below

---
<the current dream journal text>
---
```

as the first human message.

- The backend request uses the normal `chat` route with `category: "dream"`.
- The backend receives only one dream journal in the request.
- The backend response appears as the second chat message.
- Reopening that chat from history still shows the formatted dream-analysis human message.
- No `analyze_dream` route is introduced or re-enabled.
- No multi-select dream analysis is introduced from the journal list.

## Verification

Run:

```sh
npm run lint
```

Manual smoke test:

1. Open the Journal tab.
2. Create or open a Dream journal.
3. Enter dream text.
4. Tap `Analyze Dream`.
5. Confirm a new chat opens.
6. Confirm the first message uses the exact wrapper.
7. Confirm the AI response arrives.
8. Open chat history and reopen the same chat.
9. Confirm the first message still uses the exact wrapper.
