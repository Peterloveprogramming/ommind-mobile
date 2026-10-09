# Fix The Chat Input Box (Composer) To Match Figma And Sit On The Keyboard

## Goal

Rebuild the message composer at the bottom of `app/chat/new_index.tsx` so that:

1. It matches Figma: a translucent grey gradient panel, with a white pill inside it that holds the text field and a yellow 54 pt mic button.
2. When the keyboard opens, the grey panel sits **directly on top of the keyboard**, with the same 24 pt gap under the pill as in Figma. Today it floats too far above the keyboard.
3. It behaves the same on iOS and Android (SDK 54, edge-to-edge, new architecture). It uses the `react-native-keyboard-controller` setup the app already has, not a mix of RN core keyboard APIs.

Scope is **only the composer**: the grey panel and everything inside it. The header, message list, bubbles and the "Create My Meditation" pill stay as they are.

## Figma Source

File `TspC5Aw91TShdpYFeKcLIY` (OmMind), both frames 394 × 844:

- Keyboard closed: frame `2100:4923` (https://www.figma.com/design/TspC5Aw91TShdpYFeKcLIY/OmMind?node-id=2100-4923). Composer group `2100:5088`.
- Keyboard open: frame `2100:5006` (https://www.figma.com/design/TspC5Aw91TShdpYFeKcLIY/OmMind?node-id=2100-5006). Composer group `2100:5096`. iOS keyboard instance `2100:5104` at y 508.

Both frames use the same composer. Measured values (frame coordinates):

| Element | Value |
| --- | --- |
| Grey panel (`Rectangle 321`) | full width, 108 tall. Closed: y 739 → bottom 847 (flush with / past screen bottom). Open: y 403 → bottom 511 (3 pt under the keyboard top at 508, so it is flush with the keyboard) |
| Panel fill | vertical linear gradient `rgba(215,215,215,0.8)` at **19.474 %** → `rgba(134,132,132,0.6)` at **120.53 %** of panel height. Same colours as the tab bar (`TAB_BAR.GRADIENT_*`) |
| Panel effect | `backdrop-blur 5`. **Not implemented** (see Decisions) |
| Panel → pill | top 17 (756 − 739). Left 10.1, right 10.1 → use **10** |
| Pill (`Frame 1171274918`) | 373.8 wide (= screen − 20), **64 tall**, bg `#FAFAFA`, border 1 `#BBBBBB`, radius 50 (fully rounded), padding left 15 / right 5 / top 5 / bottom 5, row, `space-between`, centered |
| Pill → bottom | closed: pill bottom 820 → **24** to screen bottom. Open: pill bottom 484 → **24** to keyboard top |
| Placeholder | "You can type here to reply...", Figtree Regular 16, line height 22, letter spacing −0.408, colour `#868686` |
| Mic button (`Frame 6854`) | **54 × 54**, radius 27, bg `Brand/03` `#F8C63E`, Material `mic` icon 24 × 24, white, centered |
| Send button | **None in Figma** (see Decisions) |

`assets/svg/chat/MicButton.tsx` is already this exact asset (54 × 54 viewBox, `#F8C63E` circle, white Material mic glyph). Today it is rendered at 45 × 45. It must be rendered at **54 × 54**. Do not redraw it.

## What Is Wrong Today

Current code: `app/chat/new_index.tsx` lines ~974–1143 (render) and ~1246–1296 (styles).

1. **Composer floats above the keyboard (the bug you see).** `inputView` always has `paddingBottom: composerBottomPadding = max(insets.bottom, 8)`:
   - On iPhone that is 34 pt; on Android edge-to-edge it is the nav-bar height (about 24 dp with gesture nav, about 48 dp with 3-button nav).
   - The safe-area inset only matters when the composer touches the screen bottom. When the keyboard is open, the keyboard covers the home indicator / nav bar, yet the 34 / 48 pt stays. So the pill floats that far above the keyboard, plus the existing 5 pt `paddingVertical`.
2. **Different keyboard behaviour per platform.** `KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}`:
   - The `"height"` branch is advice for RN core's `KeyboardAvoidingView` (it works around Android's own `adjustResize`).
   - With `react-native-keyboard-controller` (a `KeyboardProvider` is already in `app/_layout.tsx`), the library tracks the keyboard frame by frame on both platforms. `"padding"` is the consistent choice.
   - `"height"` shrinks the whole container. Together with the leftover inset padding, that causes the extra gap on Android, and the jump differs between gesture nav and 3-button nav.
3. **Visuals don't match Figma:**
   - The pill is cream `#F7F2E9` (reads as yellow) with no border.
   - There is no grey panel.
   - The pill is 90 % wide and a black paper-plane send button sits outside it.
   - The mic is 45 pt.
   - The placeholder is `#999` in the system font.
   - The text field is 70–80 tall (Figma: 54 inside a 64 pill).
4. **Mic states break on the new yellow circle.** The "converting" spinner is `#F8C63E` (yellow), so it would be invisible on the yellow button.

## Decisions (Confirmed With Product Owner)

- **Mic becomes the send button.** When the input is empty (after trim), the 54 pt yellow circle shows the mic and does voice-to-text as today. When there is text, the same circle shows a white **send arrow** and tapping it calls `handleSend`.
  - While `isRecording || isConverting`, it always stays in **mic mode**, even if text already exists. That way the press-out still stops the recording, and the spinner shows.
  - Trade-off we accept (same as WhatsApp / iMessage): once text is typed, the user can't start a new voice note without clearing the text first.
  - The separate `SendButton` outside the pill is removed.
- **Grey panel is stacked, with no blur.** The panel is a normal layout sibling below the message list; messages never scroll behind it. Over the white screen background, the translucent gradient looks identical to Figma. `expo-blur` is not used: it is still experimental on Android, and there is nothing behind the panel to blur. This matches decision D-blur in spec 02 (tab bar).
- **"Create My Meditation" pill: unchanged.** It stays above the grey panel, outside it, and still hides while the keyboard is open.

### Made in this spec (platform best practice)

- **Bottom gap when the keyboard is closed: `max(insets.bottom, 24)`.**
  - Figma puts the pill 24 above the screen bottom, which is inside the iPhone's 34 pt home-indicator zone.
  - As in spec 02, best practice wins: nothing interactive goes into the home-indicator / nav-bar zone. So the gap is 34 on modern iPhones and 24 on SE / zero-inset devices.
  - The grey panel itself **still reaches the physical bottom edge**, because only the padding inside it grows.
- **Bottom gap when the keyboard is open: 24** (Figma). No safe-area inset at all, since the keyboard covers it.
- **The gap animates with the keyboard, on the UI thread.** The padding is interpolated from `useReanimatedKeyboardAnimation().progress` (0 closed → 1 open), so it moves in the same frames as `KeyboardAvoidingView`'s padding. Don't flip it with a JS `Keyboard.addListener` boolean:
  - On Android, `keyboardDidShow` fires *after* the animation, so the panel would visibly jump.
  - On iOS, the boolean doesn't follow interactive (drag-to-dismiss) keyboard dismissal.
- **Keep `KeyboardAvoidingView` from `react-native-keyboard-controller`, `behavior="padding"` on both platforms.** It stays as the screen root. The screen has `headerShown: false` and starts at y 0, so no `keyboardVerticalOffset` is needed.
  - Rejected: `KeyboardStickyView`. It only translates the composer, so the list doesn't shrink and the newest messages end up hidden behind the keyboard.
  - Rejected: `KeyboardChatScrollView`. It would mean refactoring the whole message list, which is out of scope. It's a good follow-up if chat scrolling is reworked.
- **Leave `android.softwareKeyboardLayoutMode: "resize"` in `app.json` as it is** (`adjustResize` is what keyboard-controller expects). No native changes.
- **Extract the composer into its own component** (`comp/chat/ChatComposer.tsx`). `new_index.tsx` is about 1300 lines. Pulling the composer out keeps this change contained and reviewable, and follows the pattern in spec 02.
- **Colours.** Spec 03 (colour tokens) has not landed yet (`constants/colors.ts` is still a single file). Put every colour in one `COMPOSER` constant object in the new component so that spec 03 can move them in one go. If spec 03 has already landed when this is implemented, use its tokens instead (`colors.brand.yellow` for `#F8C63E` and so on).

## Implementation

### 1. New file: `comp/chat/ChatComposer.tsx`

Metrics and colours, at the top of the file:

```ts
const COMPOSER = {
  PANEL_PADDING_TOP: 17,
  PANEL_PADDING_HORIZONTAL: 10,
  PANEL_PADDING_BOTTOM_OPEN: 24,      // pill → keyboard top (Figma)
  PANEL_PADDING_BOTTOM_MIN: 24,       // pill → screen bottom, before safe area
  PILL_PADDING_LEFT: 15,
  PILL_PADDING_RIGHT: 5,
  PILL_PADDING_VERTICAL: 5,
  PILL_BORDER_WIDTH: 1,
  PILL_RADIUS: 32,                    // half of the 64 pt single-line height
  BUTTON_SIZE: 54,
  INPUT_FONT_SIZE: 16,
  INPUT_LINE_HEIGHT: 22,              // used for maths only, see note below
  INPUT_LETTER_SPACING: -0.408,
  INPUT_MAX_LINES: 4,

  GRADIENT_TOP: "#D7D7D7",
  GRADIENT_TOP_OPACITY: 0.8,
  GRADIENT_BOTTOM: "#868484",
  GRADIENT_BOTTOM_OPACITY: 0.6,
  PILL_BACKGROUND: "#FAFAFA",
  PILL_BORDER: "#BBBBBB",
  PLACEHOLDER: "#868686",
  INPUT_TEXT: "#1E1E1E",              // Figma `sds text-default`
  BUTTON_BACKGROUND: "#F8C63E",       // Figma `Brand/03`
  BUTTON_ICON: "#FFFFFF",
} as const;
```

Derived values:

- Text field: `minHeight = BUTTON_SIZE` (54) and `paddingVertical = (54 − 22) / 2 = 16`. One line of text is then vertically centered and the pill is 5 + 54 + 5 = **64**, as in Figma.
- `maxHeight = 16 * 2 + 22 * INPUT_MAX_LINES` (= 120). Beyond 4 lines the field scrolls internally.

Props (everything stays owned by the screen; the component is presentational):

```ts
type ChatComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onSend: () => void;
  onMicPressIn: () => void;
  onMicPressOut: () => void;
  isMicPressed: boolean;
  isRecording: boolean;
  isConverting: boolean;
};
```

Layout tree:

```
Animated.View (panel)  ← reanimated; paddingBottom animated; position relative; overflow hidden
├─ Svg (StyleSheet.absoluteFill, width/height "100%", pointerEvents="none")
│   └─ Defs > LinearGradient id="omComposerGradient" x1=0 y1="19.474%" x2=0 y2="120.53%"
│        Stop 0 → GRADIENT_TOP @ 0.8, Stop 1 → GRADIENT_BOTTOM @ 0.6
│      Rect width="100%" height="100%" fill="url(#omComposerGradient)"
└─ View (pill)  row, alignItems "flex-end", bg/border/radius/padding per COMPOSER
    ├─ TextInput  flex 1, multiline
    └─ Pressable / TouchableOpacity (54 × 54 circle) → mic or send
```

Details:

- **Panel gradient.** Use `react-native-svg`, the same approach as `comp/navigation/TabBarBackground.tsx`. It's a plain rectangle, so `width/height="100%"` with the default `objectBoundingBox` units can't stretch anything. The stop positions outside 0–1 are exact from Figma. The gradient scales with the panel as it grows (multi-line input, safe area). Don't add `expo-linear-gradient` or `react-native-linear-gradient` for this.
- **Animated bottom padding.**
  ```ts
  const insets = useSafeAreaInsets();
  const { progress } = useReanimatedKeyboardAnimation();
  const closedPadding = Math.max(insets.bottom, COMPOSER.PANEL_PADDING_BOTTOM_MIN);
  const panelStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      progress.value,
      [0, 1],
      [closedPadding, COMPOSER.PANEL_PADDING_BOTTOM_OPEN],
      Extrapolation.CLAMP,
    ),
  }), [closedPadding]);
  ```
  `useReanimatedKeyboardAnimation` comes from `react-native-keyboard-controller`, and `interpolate`/`Extrapolation`/`useAnimatedStyle`/`Animated` come from `react-native-reanimated` (both already installed).
- **Pill alignment.** Use `alignItems: "flex-end"`, so that when the text grows to several lines the button stays pinned to the bottom-right inside the pill. With one line it looks identical to centered, because the field and the button are both 54 tall.
- **TextInput:**
  - `multiline`, `value`, `onChangeText` (not `onChange`).
  - `placeholder="You can type here to reply..."`, `placeholderTextColor={COMPOSER.PLACEHOLDER}`.
  - `fontFamily: FONTS.figtreeMedium` (that key maps to `Figtree_400Regular`, which is Figma's "Figtree Regular"; it is loaded in `app/_layout.tsx`), `fontSize 16`, `letterSpacing -0.408`, `color COMPOSER.INPUT_TEXT`.
  - `paddingTop/paddingBottom 16`, `paddingHorizontal 0` (the pill provides the 15 left padding). Add `marginRight: 8` so text never runs under the button.
  - `textAlignVertical: "top"`, `includeFontPadding: false` (Android: removes the extra font padding so the text centers like iOS).
  - `minHeight 54`, `maxHeight 120`, `scrollEnabled` (default).
  - **Don't set `lineHeight` on the `TextInput`.** On iOS, a multiline `TextInput` with `lineHeight` pushes the placeholder and caret off-center, and it differs between platforms. 22 is only used for the padding maths.
  - `accessibilityLabel="Message"`.
- **Button (single 54 × 54 circle):**
  ```ts
  const hasText = value.trim().length > 0;
  const showSend = hasText && !isRecording && !isConverting;
  ```
  - `showSend`:
    - Render a `View` circle with bg `COMPOSER.BUTTON_BACKGROUND` and `<Ionicons name="arrow-up" size={24} color={COMPOSER.BUTTON_ICON} />` (`@expo/vector-icons` is already used in this screen).
    - `onPress={onSend}`, `accessibilityRole="button"`, `accessibilityLabel="Send message"`.
  - Otherwise, the mic:
    - Render `<MicButton width={54} height={54} />`. The SVG draws the yellow circle itself.
    - `onPressIn={onMicPressIn}`, `onPressOut={onMicPressOut}`, `accessibilityLabel="Hold to record a voice message"`.
  - `isConverting`: render a yellow circle with `<ActivityIndicator size="small" color={COMPOSER.BUTTON_ICON} />` (**white**, not yellow), and ignore presses.
  - Pressed / recording feedback: keep today's look, applied to the 54 circle wrapper: `transform: [{ scale: 0.9 }]` plus the orange glow (`shadowColor #FF8A3D`, `shadowOpacity 0.35`, `shadowRadius 10`, `elevation 6`, `borderColor #FF8A3D`, `borderWidth 1`, radius 27). Drop the old `backgroundColor` overrides, which would be hidden under the SVG anyway. Put these colours in `COMPOSER` as well (`RECORDING_GLOW: "#FF8A3D"`, `CONVERTING_GLOW: "#FFB06E"`).
  - `hitSlop` isn't needed (54 pt is already above the 44 pt minimum).
- `export default React.memo(ChatComposer)`. The parent re-renders a lot while messages stream in.

### 2. Update `app/chat/new_index.tsx`

1. Root: `<KeyboardAvoidingView style={styles.Parent} behavior="padding">`. Remove the `Platform.OS` branch. The import from `react-native-keyboard-controller` stays.
2. Replace the whole `<View style={[styles.inputView, …]}> … </View>` block (TextInput, mic, send) with:
   ```tsx
   <ChatComposer
     value={inputText}
     onChangeText={setInputText}
     onFocus={() => scrollToLatestMessage()}
     onSend={handleSend}
     onMicPressIn={() => { void handleMicPressIn(); }}
     onMicPressOut={() => { void handleMicPressOut(); }}
     isMicPressed={isMicPressed}
     isRecording={isRecording}
     isConverting={isConverting}
   />
   ```
   It stays in the same position: after the "Create My Meditation" block, before `PersonalisedMeditationModal`.
3. Delete what's no longer used:
   - `COMPOSER_MIN_BOTTOM_PADDING` and `composerBottomPadding`.
   - Styles `inputView`, `inputChild`, `inputBox`, `sendButtonStyle`, `micButtonContainer`, `micButtonPressed`, `micButtonConverting`.
   - Imports `SendButton` and `MicButton` (these move into the component), plus `TextInput` if nothing else uses it.
   - Keep `insets`: the header still uses `insets.top`.
4. **Don't change:**
   - `handleSend`, `handleMicPressIn/Out`, or the `useVoiceToText` wiring.
   - The `isKeyboardVisible` listener and the "Create My Meditation" row.
   - The `FlatList` props (`keyboardShouldPersistTaps`, `keyboardDismissMode`).
   - Header and bubbles.

`assets/svg/chat/SendButton.tsx` becomes unused. Check with `grep -rn "chat/SendButton" app comp` and delete it only if nothing else imports it.

## Out Of Scope

- Backdrop blur on the panel (decided against).
- Messages scrolling behind the panel; moving the list to `KeyboardChatScrollView`.
- The "Create My Meditation" pill, header, precaution note and message bubbles.
- Replacing the `Keyboard.addListener` `isKeyboardVisible` state (only used by the meditation pill).
- Disabled / dimmed send state while the AI is replying. `handleSend` keeps guarding this as it does today.
- Dark mode, tablets, landscape.

## Acceptance Criteria

1. **Keyboard closed:**
   - The grey gradient panel reaches the physical bottom edge, and no white strip shows under it.
   - The pill bottom is `max(insets.bottom, 24)` above the screen bottom.
   - The pill top is 17 below the panel top.
2. **Keyboard open (iOS and Android, gesture and 3-button nav):**
   - The panel's bottom edge touches the keyboard top.
   - The gap between the pill bottom and the keyboard top is **24 pt ±1**. No safe-area or nav-bar gap is added on top.
3. The panel padding animates in step with the keyboard, both when opening and when closing. That includes iOS interactive drag-to-dismiss on the message list. Nothing jumps after the keyboard finishes animating.
4. Pill visuals:
   - 10 from each screen edge, 64 tall with one line.
   - `#FAFAFA` fill, 1 pt `#BBBBBB` border, fully rounded.
   - Placeholder in Figtree Regular 16, `#868686`.
5. Button:
   - Empty input: a yellow 54 pt circle with a white mic. Holding it records; releasing it transcribes and adds the text to the input.
   - With text: the same circle shows a white up-arrow, and tapping it sends.
   - During recording / converting it stays a mic / white spinner, even if text exists.
   - There is no other send button on the screen.
6. Typing more lines grows the pill upward, up to 4 lines. After that the text scrolls inside the field, and the button stays bottom-right.
7. On the 393/394-wide iPhone with the keyboard open, a screenshot of the composer matches the Figma frame `2100:5006`. The only difference allowed is that the panel's bottom is hidden by the keyboard.
8. The latest message stays visible above the panel when the keyboard opens (focus scrolls to the end, as today).
9. VoiceOver / TalkBack read the field as "Message" and the button as "Send message" or "Hold to record a voice message", depending on state.
10. `yarn lint` and `npx tsc --noEmit` report no new errors compared with the baseline. No `console.log` in new or changed code.

## Test Matrix

Run on simulators/emulators at minimum.

| Platform | Device | Bottom inset | Expected gap: pill → screen bottom (closed) | Expected gap: pill → keyboard (open) |
| --- | --- | --- | --- | --- |
| iOS | iPhone SE (3rd gen) | 0 | 24 | 24 |
| iOS | iPhone 16 / 15 | 34 | 34 | 24 |
| iOS | iPhone 16 Pro Max | 34 | 34 | 24 |
| Android | Pixel 8, gesture nav | ~24 | ~24 | 24 |
| Android | Pixel 8, 3-button nav | ~48 | ~48 | 24 |
| Android | API 34 or lower emulator (pre-Android-15 behaviour) | gesture | ~24 | 24 |

On each device check:

- Open a new chat and focus the input.
- Type 1, 3 and 6 lines.
- Send a message.
- Hold the mic, release it, and watch the white spinner.
- Dismiss the keyboard by tapping the list, by dragging (iOS), and with the back gesture (Android).
- Open an existing chat with many messages and confirm the last message isn't hidden behind the panel.
- Switch keyboards (emoji / predictive bar on and off). The panel should follow the keyboard's height change.

## Files Summary

- **Add:** `comp/chat/ChatComposer.tsx`
- **Edit:** `app/chat/new_index.tsx`
- **Delete (only if unused elsewhere):** `assets/svg/chat/SendButton.tsx`
- **No change:** `app.json`, `android/`, `ios/`, `package.json` (no new dependencies)
