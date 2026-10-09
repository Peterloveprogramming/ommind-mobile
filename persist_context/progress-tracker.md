# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (code) — awaiting manual test matrix on simulators/devices.

## Current Goal

- 03-fix-input-box: rebuild the chat composer in `app/chat/new_index.tsx`
  as `comp/chat/ChatComposer.tsx` (grey gradient panel + white pill + 54 pt
  yellow mic/send button) that matches Figma and sits directly on the
  keyboard with a 24 pt gap on iOS and Android.

## Completed

- `comp/chat/ChatComposer.tsx` (new, `React.memo`):
  - `COMPOSER` constants object exactly as specified, plus
    `RECORDING_GLOW` / `CONVERTING_GLOW`. All colours live there for the
    colour-token spec to move later (`constants/colors.ts` unchanged).
  - Panel is a reanimated `Animated.View`; `paddingBottom` interpolated on
    the UI thread from `useReanimatedKeyboardAnimation().progress`:
    `max(insets.bottom, 24)` closed → `24` open, clamped.
  - Gradient via `react-native-svg` (`omComposerGradient`, stops at
    19.474 % / 120.53 %, absolute-fill `Rect`). No blur, no new deps.
  - Pill: `#FAFAFA`, 1 pt `#BBBBBB`, radius 32, padding 15/5/5/5,
    `alignItems: "flex-end"`.
  - TextInput: `onChangeText`, Figtree Regular (`FONTS.figtreeMedium`) 16,
    letter spacing −0.408, `#1E1E1E`, placeholder `#868686`, padding
    16/16/0, `marginRight 8`, min 54 / max 120 height, `textAlignVertical
    "top"`, `includeFontPadding false`, no `lineHeight`,
    `accessibilityLabel="Message"`.
  - One 54 pt button: send (`Ionicons arrow-up`, white, on yellow circle,
    "Send message") when trimmed text exists and not recording/converting;
    white spinner on yellow circle while converting (presses ignored);
    otherwise `MicButton` at 54 × 54 with press-in/out ("Hold to record a
    voice message"). Pressed/recording: scale 0.9 + `#FF8A3D` glow/border;
    converting: `#FFB06E` border/glow.
- `app/chat/new_index.tsx`:
  - `KeyboardAvoidingView` (keyboard-controller) now `behavior="padding"`
    on both platforms.
  - Old composer block replaced with `<ChatComposer … />` in the same spot
    (after the Create My Meditation row, before the modal).
  - Removed `COMPOSER_MIN_BOTTOM_PADDING`, `composerBottomPadding`, styles
    `inputView` / `inputChild` / `inputBox` / `sendButtonStyle` /
    `micButtonContainer` / `micButtonPressed` / `micButtonConverting`,
    imports `SendButton`, `MicButton`, `TextInput`. `insets` kept (header).
  - Untouched: `handleSend`, mic handlers, `useVoiceToText`,
    `isKeyboardVisible` listener, meditation pill, FlatList props, header,
    bubbles.
- Deleted `assets/svg/chat/SendButton.tsx` (`git rm`; no other importers).
- `npx expo lint`: 0 errors, 42 warnings (same as baseline, none new).
  `npx tsc --noEmit`: 44 errors vs 45 baseline, none in touched files.
  No `console.log` in new or changed code.

- Fix (Android device test): the grey gradient stopped short of the
  panel's right and bottom edges. The Svg with `absoluteFill` plus
  `width/height="100%"` didn't fill the panel. Now an `absoluteFill`
  `View` measures the panel (`onLayout`) and the Svg/Rect are drawn at
  the exact pixel size, with the gradient in `userSpaceOnUse`
  (y1 = 19.474 %, y2 = 120.53 % of the measured height). Same approach as
  `TabBarBackground`. tsc/lint unchanged (44 / 0 errors).

## In Progress

- Re-test the gradient fix on Android (keyboard closed and open).

## Next Up

- Run the spec "Test Matrix" (iPhone SE / 16 / 16 Pro Max, Pixel 8
  gesture + 3-button, API ≤ 34 emulator) against the Acceptance Criteria,
  incl. iOS interactive drag-to-dismiss and keyboard height changes
  (emoji / predictive bar). Screenshot-compare against Figma `2100:5006`.

## Open Questions

- None.

## Architecture Decisions

- See `03-fix-input-box.md` "Decisions". Notably: mic doubles as send,
  stacked panel with no blur, `KeyboardAvoidingView` `padding` kept (not
  `KeyboardStickyView` / `KeyboardChatScrollView`), safe area wins over
  Figma only while the keyboard is closed.

## Session Notes

- Changes are uncommitted on `main`. `SendButton.tsx` deletion is staged
  (`git rm`); everything else is unstaged.
- The callbacks passed to `ChatComposer` are inline arrows (as the spec
  shows), and `handleSend` isn't memoized, so `React.memo` doesn't skip
  re-renders yet. Wrap them in `useCallback` if streaming re-renders
  become a problem.

---

# Previous Goal: 02-fix-bottom-nav-bar

### Phase

- Complete (code) — awaiting manual test matrix on simulators/devices.

### Current Goal

- 02-fix-bottom-nav-bar: rebuild the tab bar as a custom React Navigation
  `tabBar` (`comp/navigation/AppTabBar.tsx`) whose grey background reaches
  the physical bottom edge, matches the Figma geometry, respects the
  bottom safe-area inset, and reports its real height so tab screens can
  pad with `useBottomTabBarHeight()`.

### Completed

- Step 0: `yarn add @react-navigation/bottom-tabs@^7.4.0`. `yarn why`
  shows exactly one installed copy (7.14.0, hoisted, shared with
  expo-router). Lockfile unchanged (entry already existed).
- Step 1: `comp/navigation/tabBarMetrics.ts`: `TAB_BAR` constants plus
  `getTabBarBottomPadding` / `getTabBarBackgroundHeight` /
  `getTabBarSidePadding`, exactly as specified.
- Step 2: `comp/navigation/TabBarBackground.tsx`: path built from
  measured width/height (no viewBox, so no stretching), fixed-size centered
  notch, Figma gradient in user space, path memoized on `[width, height]`.
- Step 3: `comp/navigation/LhamoTabButton.tsx`: Rinpoche logic moved over
  as-is (isNavigating guard, 1500 ms reset, reset on pathname change,
  `navigateToNewChat`, dimmed image + spinner). `Pressable` covers orb +
  label, 78 pt image, 70 pt `boxShadow` view behind it, label text fixed
  to "Lhamo", button a11y role/label/hint/state.
- Step 4: `comp/navigation/AppTabBar.tsx`: one layout tree holds the
  background, the `tablist` row (Home/Explore | 108 spacer |
  Journal/Profile) and the Lhamo button as a sibling. Reports height via
  `BottomTabBarHeightCallbackContext` (overhang included). Active state
  comes from `state.index`, and Profile stays highlighted on `saved` /
  `recently-played`. Standard `tabPress` / `tabLongPress` emit pattern.
  Hidden when `BottomNavVisibilityContext.isVisible === false` or
  `useKeyboardState(s => s.isVisible)`.
- Step 5: `app/(tabs)/_layout.tsx` reduced to `<Tabs tabBar=…
  screenOptions={{ headerShown: false }}>` with all 7 screens kept
  (`lhamo` gets `href: null` + its header options). Removed the `icon()`
  helper, overlay, styles, insets, `usePathname` and `console.log`.
  Deleted `assets/svg/BottomNavigationBar.tsx`.
- Step 6: bottom padding switched to `useBottomTabBarHeight()` in index,
  explore, journal (+16, and core `SafeAreaView` replaced with
  safe-area-context `edges={["top"]}`), profile (`followSection`
  marginBottom 0), saved, recently-played (still use `insets.top`, so
  `useSafeAreaInsets` kept), ProfileFeedbackForm, ProfileContactForm.
- `npx expo lint`: 0 errors, 42 warnings (same as baseline, none new).
  `npx tsc --noEmit`: 45 errors vs 47 baseline, none in new files.
  Remaining hits in touched files are pre-existing
  (`explore.tsx` MeditationCard props, `lhamo.tsx` context typing).
  No `console.log` in new or changed files.

### In Progress

- None.

### Next Up

- Run the spec "Test Matrix" (iPhone SE / 16 / 16 Pro Max, Pixel 8
  gesture + 3-button, 360-wide Android) against the Acceptance Criteria.
  Screenshot-compare against Figma on the 393-wide device.

### Open Questions

- None.

### Architecture Decisions

- See `02-fix-bottom-nav-bar.md` "Decisions". Notably: JS `Tabs` with a
  custom `tabBar` (not `NativeTabs`), no background blur, and the safe
  area takes priority over Figma for the bottom padding.
- The reported tab bar height includes `ORB_OVERHANG` (31), so
  `tabBarHeight + 24` padding always clears the orb.

### Session Notes

- Changes are uncommitted on `main`. `BottomNavigationBar.tsx` deletion is
  staged (`git rm`); everything else is unstaged.

---

# Previous Goal: 01-hook-up-dream-to-backend

### Phase


- Complete (code) — awaiting manual smoke test on device.

### Current Goal

- 01-hook-up-dream-to-backend: `Analyze Dream` on the dream write/edit
  screen opens a new chat and sends the dream to the backend `chat` route
  with `category: "dream"`.

### Completed

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

### In Progress

- None.

### Next Up

- Manual smoke test (spec "Verification" section): create/open dream →
  Analyze Dream → confirm new chat, exact wrapper as first message, AI
  response second → reopen from chat history, wrapper still shown.

### Open Questions

- `04-add-dream-workflow.md` was never found in the backend repo; contract
  is based on the backend diff in `/Users/zimingyan/PycharmProjects/lhamo`.
  Confirm backend is deployed before smoke testing.
- The "Write a dream before analyzing." toast is effectively defensive only,
  since the button is disabled when the text is empty.

### Architecture Decisions

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

### Session Notes

- Changes are uncommitted on `main`.
- Possible pre-existing issue (not changed): the guided-meditation auto-send
  effect in `new_index.tsx` is declared *before* the session-switch effect,
  so on first mount its request may be aborted by `resetAiMessageState()`.
  Worth verifying separately.
