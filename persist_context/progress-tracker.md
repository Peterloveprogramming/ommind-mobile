# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Complete (code) — awaiting manual test matrix on simulators/devices and a
  pixel overlay against Figma `2958:10054` on a 393 pt iPhone.

## Current Goal

- 06-fix-home-page: restyle the Home tab's Lhamo hero card, mood check-in
  and Today's Intention (`app/(tabs)/index.tsx`) to Figma `2958:10054`
  (Pro copy `37GSSpgSU44KPNvLuVKAOw`). Fixed Figma pt values, fluid only for
  the hero artwork and intention card, one width breakpoint (< 390).
  Style/layout only plus the confirmed Today's Intention copy changes.

## Completed

- Baseline: `npx tsc --noEmit` 32 errors; `npx expo lint` 0 errors /
  41 warnings.
- `theme.js` (additive): `FONTS.figtreeMedium500 = "Figtree_500Medium"`,
  `FONTS.figtreeSemiBoldItalic = "Figtree_600SemiBold_Italic"`.
  `FONTS.figtreeMedium` unchanged (still Regular 400).
- `app/_layout.tsx` (additive): `Figtree_500Medium` and
  `Figtree_600SemiBold_Italic` added to `useFigtree`.
- New `comp/home/SpeechBubble.tsx`: measures itself with `onLayout`
  (rounded, only updates on change) and draws the spec path (tail 6,
  radius 12, half-stroke 0.5) in an absolute-fill `Svg`, `#FAF9F2` fill at
  38% + 1 pt stroke. Root `minHeight` 61, centered, padding L 13 (tail + 7)
  / R 6 / V 5. Exports `TAIL_WIDTH`, `RADIUS`. SVG `accessible={false}`.
- New `comp/home/GradientDivider.tsx`: 1 pt `View` (`alignSelf: stretch`)
  with an SVG `#D9D9D9` 20% → 100% (0.51) → 20% gradient. Gradient id from
  `useId()` with non-alphanumerics stripped. Hidden from accessibility.
- `app/(tabs)/index.tsx`:
  - `HOME_UI` token object (`hero`, `heroCompact`, `mood`, `intention`
    groups + `screenGutter` 12, `maxCardWidth` 480, breakpoint 390,
    `maxFontSizeMultiplier` 1.2, text colour `#4D4949`).
    `contentContainer.paddingHorizontal` now references
    `HOME_UI.screenGutter`.
  - `useWindowDimensions()` drives `isCompactWidth` (< 390),
    `heroWidth = min(w − 24, 480)`, `heroMinHeight = heroWidth / (1473 /
    856)` and `intentionCardWidth = min(w − 46, 480)`.
  - Hero: `ImageBackground` `resizeMode="stretch"`, no radius / clipping,
    content in normal flow (padding top 24 / 18 compact, left 13, bottom
    12). Column `58%` / max 195. Guiding row right-aligned, moon 22, gap 4,
    Figtree 500 14/20 ls −0.8 `#F8C63E` with nested Bold "Lhamo".
    `SpeechBubble` with Figtree 500 13/17 `#4D4949`, 3 lines max. Buttons in
    169-max slots, height 36 / 32 compact, radius h/2, padding 10, icons 22,
    13 pt text with lh 20 / ls −0.24 via `textStyle`, 78% backgrounds.
    Create Meditation no longer gets `isLoading` (spinner only on Chat).
  - Mood: divider between hero and mood removed; section `marginTop` 16.
    Title Figtree Bold 14/20, subtitle Figtree 500 13/20 `#8E8E93`
    (3 gap, padding H 24), copy unchanged. `MOOD_OPTIONS` typed with
    optional `iconSize` (Focused 37); `MOOD_ROWS` chunks into 3s. Rows
    centered, gap 11 / row gap 6; pills `flex: 1`, max 100, min height 40,
    transparent, 1 pt `#ECE0D7` border → `COLORS.brandYellow` when
    selected/pending (no fill, same label colour). Icon `marginLeft` 3,
    label one line with `adjustsFontSizeToFit` (min 0.85), `paddingRight`
    11. `accessibilityRole="button"`, label, `hitSlop` top/bottom 3. Muted
    0.55 kept. Status message moved below the grid (`marginTop` 10).
  - Today's Intention: `GradientDivider` (marginTop 15, inset 11 + 12 = 23)
    replaces the solid divider; section `paddingTop` 15. Title
    "💫 Today’s Intention" Bold 14/20. Card width from the 23 gutter,
    `minHeight` 232, radius 12 with `overflow: hidden` on the container,
    `cover`, padding 11/12, gap 15, top-aligned. Two 270-max text blocks
    (gap 4): leads Figtree SemiBold Italic 13/20 `#8E8E8E` (no
    `fontStyle`), values SemiBold 16/20 `#000000`, intention 2 lines /
    affirmation 4 lines. Spinner placeholders 20 / 40 tall. Inner
    `GradientDivider` at full content width. Refresh Guidance: min height
    36, radius 18, padding 10, `rgba(140,140,138,0.64)`, lotus 22, gap 4,
    13/20 white, `accessibilityRole="button"`, `busy` state, `hitSlop` 4.
    Copy uses real `…` and curly apostrophes (no `&apos;`).
  - All texts in the three sections: explicit `lineHeight`,
    `includeFontPadding: false` (new styles), `maxFontSizeMultiplier` 1.2.
  - Removed: `HOME_BACKGROUND_ASPECT_RATIO`, `heroCardImage`,
    `heroContentColumn`, `heroTextGroup`, `messageBubble`, `primaryButton`,
    `secondaryButton`, `feelingLabelSelected`, `intentionCardImage`,
    `intentionDivider`, `intentionLoadingWrap`, `affirmationLoadingWrap`,
    `intentionWord`, `affirmationLead`, `affirmationText` (the two value
    texts share `intentionValue`).
  - Untouched: state, effects, API / cache logic, mood confirm flow,
    refresh handler, navigation, header, Log out pill, Your Practice Today
    (incl. its top border), the final `bottomDivider`, modals,
    `BaseButton`, assets.
- `npx tsc --noEmit`: 32 errors, identical set to baseline. `npx expo
  lint`: 0 errors / 41 warnings (unchanged). No `console.log` added.

## In Progress

- None.

## Next Up

- Run the spec 06 "Test Matrix" (iPhone SE / 13 mini / 16 / 16 Pro Max,
  360 × 640 Android, Galaxy 384 dp, Pixel 8) against the Acceptance
  Criteria, including largest standard font size, short and very long
  `home_page_text`, mood check-in (cancel + confirm), Refresh Guidance with
  a 4+ line affirmation.
- Pixel overlay of the three sections against Figma `2958:10054` on a
  393 pt iPhone.

## Open Questions

- None.

## Session Notes

- Changes are uncommitted on `main`.

---

# Previous Goal: 05-fix-starter-question-ui

### Phase

- Complete (code) — awaiting Figma measurement and manual test matrix on
  simulators/devices.

### Current Goal

- 05-fix-starter-question-ui: restyle `app/authentication/registration_questions.tsx`
  (fixed 24 gutter, fluid cards, pinned footer, disabled grey Continue until
  an option is picked, one compact height breakpoint at 740). Style/layout
  only.

### Completed

- Baseline: `npx tsc --noEmit` 44 errors; `npx expo lint` 0 errors /
  42 warnings.
- `comp/base/BaseButton.tsx`: optional `disabled` (default `false`) and
  `disabledBackgroundColor` (default `#D9D9D9`). `isInactive = disabled ||
  isLoading` drives `TouchableOpacity` `disabled` / `activeOpacity`.
  `accessibilityRole="button"`, `accessibilityState={{ disabled, busy }}`.
  Grey only when `disabled && !isLoading` (spinner stays on yellow).
  `height`, `useIcon`, `isLoading` now optional. No other visual change, and
  no other call site passes `disabled`.
- `comp/base/BaseRadioButton.tsx`: `RADIO_CARD` constants object; card is
  `width: "100%"`, `minHeight: 58`, padding 20/12, radius 10, border 1.5
  `#CFCFCF` → `COLORS.brandYellow` when selected. Row gap 10 (no
  `marginLeft`); label `flex: 1`, Figtree Regular 16 / 22, `#1E1E1E`,
  `maxFontSizeMultiplier` 1.3. Radios `flexShrink: 0`. Kept
  `TouchableOpacity`, added `accessibilityRole="radio"`, `checked` state and
  label. Prop types `string` / `boolean`. Removed `debug = true` and the
  unused `Checkbox` / `Dispatch` imports.
- `comp/base/BaseRadioButtonGroup.tsx`: `gap?: number` (default 12),
  `alignItems: "stretch"`, `key={String(option.value)}`, value passed as
  `String(option.value)` (all values are already strings),
  `accessibilityRole="radiogroup"`.
- `comp/base/BaseProgressBar.tsx`: `key={index}`, `active={index + 1 <=
  currentBar}`, removed `counter`.
- `app/authentication/registration_questions.tsx`:
  - `QUESTIONS_UI` token object at the top (gutter 24, max width 480,
    breakpoint 740, regular/compact token sets per the spec table).
  - Layout: root `View` (white) → content column (`flex: 1`, gutter, max
    480, centered) with progress bar, title, description, and options in a
    `flex: 1` `ScrollView` → pinned footer (gutter, `paddingTop` 12,
    `paddingBottom: max(insets.bottom, 16)`, gap 10, max 480).
  - `isCompact` from `useWindowDimensions().height < 740`. It drives the
    option gap (12/8), title size (32/28), progress→title (20/12) and
    description→options (24/16).
  - Title / description `maxFontSizeMultiplier` 1.3. Description is now
    explicitly Figtree Regular 18, opacity 0.7, left-aligned.
  - Options `ScrollView` scrolls to top (not animated) whenever `currentBar`
    changes.
  - Continue: `disabled={!currentAnswer}`, where `currentAnswer` is a typed
    lookup of `answers[currentBar]` (same value, no new TS7053). The
    toast guard in `onPress` is kept.
  - Removed `SafeAreaProvider` / `SafeAreaView`, the `onScroll`
    `console.log`, the two `console.log`s in the save handler, `debug`, the
    unused `TouchableOpacity` import, and the old `container` /
    `scrollContent` / `buttonContainer` styles.
  - Untouched: `ALL_QUESTIONS`, `answers` shape, `handleAnswerChange`,
    save/API/toast/navigation logic, Go Back behaviour and style,
    `app/_layout.tsx`.
- `npx expo lint`: 0 errors, 41 warnings (baseline 42, one unused import
  fixed, none new). `npx tsc --noEmit`: 32 errors (baseline 44, none new).
  The remaining ones in touched files are pre-existing (toast context
  typing, `BaseProgressBarProps` declared twice, `answers[currentBar]`
  indexing). No `console.log` calls in changed files (only old commented-out
  ones).

- Follow-up (user request): added `QUESTIONS_UI.contentPaddingTop` (16,
  same in both modes, close to the old `padding: 15`) on the content column
  so the progress bar isn't flush under the native header. Check the value
  against Figma.
- Follow-up (user request): post-questions welcome screen (Figma
  `2279:11254`, built from a user-supplied screenshot because the Figma
  MCP is rate-limited).
  - Image saved as `assets/images/welcome_image.png` and registered as
    `images.welcome_image` in `constants/images.ts`.
  - New `app/authentication/welcome_journey.tsx`: cream `#FFFCF3`
    background, `WELCOME_JOURNEY_UI` tokens. Image is fluid with a 315 max
    and 1:1 aspect ratio. "Welcome to OmMind!" is Figtree Bold 30
    `#333230`, tucked −16 into the image's transparent bottom padding. The
    subtitle is Figtree Regular 16 `#4D4C49`. Pinned footer with
    "Begin Your Journey" (`BaseButton` default `brandYellow`) and an 11 pt
    terms line ("Terms of Use and Privacy Policy" in bold, not tappable;
    no URLs exist in the app). 24 gutter; top spacing 30 regular / 12
    compact (< 740 tall).
  - `registration_questions.tsx`: after a successful save,
    `router.replace("/authentication/welcome_journey")` instead of
    `/(tabs)`. The toast is unchanged.
  - "Begin Your Journey" → `router.replace("/(tabs)")`.
  - `app/_layout.tsx`: registered `authentication/welcome_journey` with
    `headerShown: false`, `gestureEnabled: false`.
  - tsc 32 / lint 0 errors, 41 warnings (unchanged).
  - Fix (Android device test): the image rendered ~1023 dp tall, which
    pushed the title/subtitle behind the footer. A `require()`d `Image`
    gets the file's pixel size as its default style, which overrides
    `aspectRatio`. The image now sits in a `View` box (width 100%, max 315,
    `aspectRatio: 1`) and fills it at 100% × 100%. The button label is set
    to 15 (`buttonFontSize`) to match Figma (`BaseButton` defaults to 17).
  - Figma review (MCP now works via the Pro-team copy
    `37GSSpgSU44KPNvLuVKAOw`, node `2279:11254`, 393 × 852 frame).
    Rebuilt to the exact values:
    - `welcome_image.png` replaced with the Figma asset (1024 × 1024, same
      art; the user-supplied file was 1023 × 1023).
    - Background `#FFFCF2`. Image is 341 square (26 gutter),
      `insets.top + 10`, `resizeMode="cover"`. No compact breakpoint any
      more; it fits on the SE / 360 × 640.
    - Text block: 23 gutter, starts −23 into the image box, gap 11. Title
      Figtree Bold 32, ls 0.36, `rgba(0,0,0,0.8)`. Subtitle Inter Regular
      16 / 21, ls −0.32, `rgba(0,0,0,0.7)`.
    - Footer: 23 gutter, gap 20, `paddingBottom: max(inset, 16) + 64`
      (terms end 98 from the bottom on the 852 frame). Button is
      `brandYellow` (Figma uses `#F8C63E` exactly; the earlier
      `#F0C859` reading was screenshot sampling error), label Inter
      SemiBold 15 / 20, ls −0.5. Terms Inter Regular 11 / 13, ls 0.066,
      plus Inter SemiBold for "Terms of Use and Privacy Policy".
    - `BaseButton`: new optional `textStyle?: TextStyle`, merged last
      (no other call site passes it). `theme.js` `FONTS.interRegular =
      "Inter_400Regular"` (already loaded in `_layout`).
    - tsc 32 / lint 0 errors, 41 warnings (unchanged).

### In Progress

- None.

### Next Up

- Measure Figma frames `2277:10741` / `2113:9725` once the MCP limit
  resets, update the spec's values table, and adjust every **(confirm)**
  value where Figma differs (gutter, selected border, disabled grey, gaps,
  description alignment).
- Run the spec "Test Matrix" (iPhone SE / 16 / 16 Pro Max, 360 × 640
  Android, Pixel 8 gesture + 3-button) against the Acceptance Criteria,
  including largest standard font size and the full save flow.

### Open Questions

- Android hardware back on the welcome screen still pops to whatever is
  below it in the stack (same as before, when the questions screen
  replaced itself with tabs).
- Figma: the original file `TspC5Aw91TShdpYFeKcLIY` belongs to a Starter
  team and stays rate-limited. Use the Pro-team copy
  `37GSSpgSU44KPNvLuVKAOw` (same node IDs). Spec 05's questions frames
  `2277:10741` / `2113:9725` still haven't been measured, so all
  **(confirm)** values use the spec defaults.

### Session Notes

- Committed in `8ee2a70`.

---

# Previous Goal: 03-fix-input-box

### Phase

- Complete (code) — awaiting manual test matrix on simulators/devices.

### Current Goal

- 03-fix-input-box: rebuild the chat composer in `app/chat/new_index.tsx`
  as `comp/chat/ChatComposer.tsx` (grey gradient panel + white pill + 54 pt
  yellow mic/send button) that matches Figma and sits directly on the
  keyboard with a 24 pt gap on iOS and Android.

### Completed

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

### In Progress

- Re-test the gradient fix on Android (keyboard closed and open).

### Next Up

- Run the spec "Test Matrix" (iPhone SE / 16 / 16 Pro Max, Pixel 8
  gesture + 3-button, API ≤ 34 emulator) against the Acceptance Criteria,
  incl. iOS interactive drag-to-dismiss and keyboard height changes
  (emoji / predictive bar). Screenshot-compare against Figma `2100:5006`.

### Open Questions

- None.

### Architecture Decisions

- See `03-fix-input-box.md` "Decisions". Notably: mic doubles as send,
  stacked panel with no blur, `KeyboardAvoidingView` `padding` kept (not
  `KeyboardStickyView` / `KeyboardChatScrollView`), safe area wins over
  Figma only while the keyboard is closed.

### Session Notes

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
