# Fix The Starter Questions Screen Layout And Styling

## Goal

Restyle the onboarding "starter questions" screen (`app/authentication/registration_questions.tsx`) so that:

1. **Continue is greyed out and can't be pressed until an option is selected.** It turns yellow as soon as one is picked.
2. **The option list never touches the screen edges.** There is a fixed horizontal gutter on every phone width (360–440 pt/dp), on iOS and Android.
3. **The vertical rhythm fits small screens.** Gaps between options shrink on short screens instead of pushing the buttons off-screen, and long labels wrap instead of overflowing.
4. **It looks the same on every device and on both platforms.** The same tokens apply everywhere, with one height breakpoint and no per-platform values.

Scope is **style and layout only**. Question text, options, answer values, the save API call, navigation and the 5-question flow stay as they are.

## Figma Source

File `TspC5Aw91TShdpYFeKcLIY` (OmMind):

- https://www.figma.com/design/TspC5Aw91TShdpYFeKcLIY/OmMind?node-id=2277-10741 (node `2277:10741`)
- https://www.figma.com/design/TspC5Aw91TShdpYFeKcLIY/OmMind?node-id=2113-9725 (node `2113:9725`)

> **Values not yet measured.** The Figma MCP hit its Starter-plan rate limit while this spec was being written, so the frames couldn't be inspected. Every visual value marked **(confirm)** below was kept from the current code or picked as a sensible default.
>
> **First implementation step:** open both frames, measure the values in the table, and update this table. Where Figma differs on a **(confirm)** value, Figma wins. The **layout rules** in "Decisions" (fluid width, fixed gutter, pinned footer, disabled Continue, compact breakpoint) stay as written whatever the Figma pixel values are, because they are what make the screen consistent across devices.

| Element | Value used in this spec | Source |
| --- | --- | --- |
| Screen horizontal gutter | 24 | **(confirm)** with Figma frame x of the option cards |
| Option card | full content width, `minHeight` 58, radius 10, border 1.5 `#CFCFCF`, padding H 20 / V 12 | current code, **(confirm)** |
| Option card, selected | border `COLORS.brandYellow` `#F8C63E` (today only the radio dot changes) | **(confirm)**: use Figma's selected state if it shows one |
| Radio | 16 circle, 1 pt `#757575`. Selected: `#E6E6E6` fill, yellow 1 pt border, 10 yellow dot | current code |
| Radio → label gap | 10 | **(confirm)** |
| Option label | Figtree Regular (`FONTS.figtreeMedium`) 16, line height 22, colour `#1E1E1E` | **(confirm)** |
| Gap between options | 12 regular / 8 compact | **(confirm)** regular value against Figma |
| Title | Figtree SemiBold 32 (regular) / 28 (compact), centered | current code, **(confirm)** |
| Description | Figtree Regular 18, opacity 0.7 | current code, **(confirm)** |
| Continue, enabled | `BaseButton` default: bg `#F8C63E`, white text, height 48, radius 25 | current code |
| Continue, disabled | bg `#D9D9D9`, text `#FFFFFF` | **(confirm)** grey against Figma |
| Go Back | transparent, black text, 1 pt `#757575` border | current code |

## What Is Wrong Today

Files: `app/authentication/registration_questions.tsx`, `comp/base/BaseRadioButtonGroup.tsx`, `comp/base/BaseRadioButton.tsx`, `comp/base/BaseButton.tsx`.

1. **Options are a fixed 360 wide (the visible bug).** `BaseRadioButton` has `width: 360`. The screen gives it `393 − 2 × 15 = 363`, so on a 393 pt iPhone there is about **1.5 pt** each side, and the cards look glued to the edges.
   - On a 360 dp Android phone the card is wider than the 330 available and **overflows** the screen.
   - On a 430 pt Pro Max there are about 20 pt each side.
   - So the spacing is different on every device.
2. **Continue looks active with nothing selected.** It is always yellow. Pressing it without a selection shows a "Please select an option" toast instead of being visibly disabled. `BaseButton` has no `disabled` prop.
3. **Fixed card height.** `height: 58` with long labels (e.g. "To connect with wisdom traditions and timeless practices") makes the text wrap onto two lines inside a 58 box. On narrow screens or with larger system font sizes, it clips or overflows.
4. **Whole screen is vertically centered inside a ScrollView.** `flexGrow: 1` + `justifyContent: "center"` causes two problems:
   - The block jumps up and down between questions with different option counts.
   - On short screens (iPhone SE 667 pt, small Androids) Continue / Go Back are pushed below the fold, and the user has to scroll to find them.
5. **Padding is on the wrong layer.** `padding: 15` is on the ScrollView's `style`, not on `contentContainerStyle`, so the inset is applied to the viewport, not the content. Scroll indicators and overscroll then render inside the padding.
6. **One fixed spacing for all heights.** The option `gap: 15`, title 32 and margins don't adapt, so small screens look cramped and tall screens look sparse in a different way.
7. **Housekeeping found while reviewing the code:**
   - Missing `key` on mapped `BaseRadioButton`s and progress `Bar`s (React warnings).
   - `onScroll={() => console.log("scroll")}` fires on every scroll frame.
   - `debug = true` left in `BaseRadioButton.tsx`.
   - A nested `SafeAreaProvider` inside the screen. expo-router already provides one at the root, and a nested provider resets the measured insets.
   - No radio accessibility roles or state.

## Decisions

- **Fixed gutter, fluid cards.** Every horizontal measurement comes from one gutter constant (`24`, **(confirm)**). Option cards, title, description and buttons are all `width: "100%"` of the padded content area, so the card width is `screenWidth − 48`:
  - 312 on a 360 dp Android
  - 345 on a 393 pt iPhone
  - 382 on a 430 pt Pro Max

  The gap to the edge is identical everywhere. No percentage widths, no fixed widths. Add `maxWidth: 480` with `alignSelf: "center"` on the content column so the screen doesn't stretch absurdly on big phones and foldables (tablets are otherwise out of scope).
- **One height breakpoint, no scaling library.** `const isCompact = windowHeight < 740` (from `useWindowDimensions`, not `Dimensions.get`, so it updates when the window size changes).
  - That puts the iPhone SE (667) and short Android phones in compact mode.
  - It puts every iPhone 12+ (844+) and most modern Androids in regular mode.

  Compact changes only:

  | Token | Regular | Compact |
  | --- | --- | --- |
  | Option gap | 12 | 8 |
  | Title font size | 32 | 28 |
  | Progress bar → title | 20 | 12 |
  | Description → options | 24 | 16 |

  Everything else (card padding, font size of labels, button height, gutter) is the same in both modes. That keeps the design recognisably identical across devices.
  - Rejected: proportional scaling (`react-native-size-matters`-style `scale()`). It makes every device slightly different, which is the opposite of the consistency asked for, and it would be a new dependency.
- **Cards grow with their content.** Use `minHeight: 58` instead of `height`. The label is `flex: 1` so it wraps inside the card, and the radio stays vertically centered.
- **Pinned footer, scrolling options.** Layout becomes header → scrollable options → pinned footer:
  - The progress bar, title and description sit at the top.
  - The options sit in a `ScrollView` that takes the remaining space (`flex: 1`).
  - Continue and Go Back sit in a footer **outside** the ScrollView, pinned to the bottom with `paddingBottom: max(insets.bottom, 16)`.

  As a result:
  - The buttons are always visible and in the same place on every question and every device.
  - The block never jumps between questions.
  - On a small screen only the options list scrolls, and only if it really doesn't fit.

  If Figma clearly shows the buttons directly under the options instead of pinned, keep the pinned footer anyway on compact screens and raise it in review.
- **Disabled Continue.** Add an optional `disabled?: boolean` prop to `BaseButton` (default `false`, so the other ~12 call sites are unchanged). When `disabled`:
  - Use the disabled background (`#D9D9D9`, **(confirm)**), with white text.
  - Make the button not pressable and set `activeOpacity` 1.
  - Set `accessibilityState={{ disabled: true }}`.

  Continue on this screen gets `disabled={!answers[currentBar]}`. The loading state still wins visually: while saving, it shows the spinner on yellow.
- **Selected card border.** Highlight the whole selected card (yellow border), not only the radio dot, unless Figma shows otherwise **(confirm)**. That makes the selected state obvious, which matters now that Continue's state depends on it.
- **Colours.** Same approach as spec 03: put the new values in one `QUESTIONS_UI` constants object at the top of the screen file (or in `BaseRadioButton` for card values), so a later colour-token spec can move them in one go. Don't edit `constants/colors.ts` or `theme.js` for this.
- **Font scaling.** Keep system font scaling on (accessibility), but set `maxFontSizeMultiplier={1.3}` on the title, description and option labels. With very large accessibility sizes the layout then still holds, because cards grow and the list scrolls. iOS and Android also end up rendering the same at default settings.

## Implementation

### 1. `comp/base/BaseButton.tsx`

- Add `disabled?: boolean` (default `false`) and a `disabledBackgroundColor?: string` (default `"#D9D9D9"`).
- Compute `const isInactive = disabled || isLoading`.
- Pass `disabled={isInactive}` to `TouchableOpacity`, plus `activeOpacity={isInactive ? 1 : 0.7}`, `accessibilityRole="button"` and `accessibilityState={{ disabled, busy: isLoading }}`.
- Background: `disabled && !isLoading ? disabledBackgroundColor : backgroundColor`.
- No other visual change. Also make `height`, `useIcon` and `isLoading` optional in the props interface: they already have defaults, and today TypeScript forces callers to pass them.

### 2. `comp/base/BaseRadioButton.tsx`

- Card: remove `width: 360` and `height: 58`. Use `width: "100%"`, `minHeight: 58`, `paddingHorizontal: 20`, `paddingVertical: 12`, `borderRadius: 10`, `borderWidth: 1.5`, `borderColor: selected ? COLORS.brandYellow : "#CFCFCF"`, `justifyContent: "center"`.
- Inner row: `flexDirection: "row"`, `alignItems: "center"`, `gap: 10`. Remove `marginLeft: 10`.
- Label: `flex: 1`, `fontFamily: FONTS.figtreeMedium`, `fontSize: 16`, `lineHeight: 22`, `color: "#1E1E1E"`, `maxFontSizeMultiplier={1.3}`.
- Radio circles: unchanged (16 / 10). Add `flexShrink: 0` so a long label can't squash them.
- Use `Pressable` (or keep `TouchableOpacity`) with `accessibilityRole="radio"`, `accessibilityState={{ checked: selected }}` and `accessibilityLabel={label}`.
- Fix the prop types: `String` / `Boolean` → `string` / `boolean`, and `value: string`.
- Set `debug = false` (or remove it).

### 3. `comp/base/BaseRadioButtonGroup.tsx`

- Container: `width: "100%"`, `alignItems: "stretch"`, and `gap` taken from a new optional `gap?: number` prop (default 12).
- Add `key={String(option.value)}` to each mapped item.
- Add `accessibilityRole="radiogroup"` on the container.

### 4. `comp/base/BaseProgressBar.tsx`

- Add `key={index}` to each `Bar`, and replace the `counter` variable with `index + 1 <= currentBar`. No visual change.

### 5. `app/authentication/registration_questions.tsx`

Structure:

```
View (root, flex 1, bg white)
├─ View (content column: flex 1, paddingHorizontal GUTTER, width 100%, maxWidth 480, alignSelf center)
│   ├─ BaseProgressBar               (alignSelf center)
│   ├─ Text title                    (marginTop: progress→title token)
│   ├─ Text description              (marginTop 8, marginBottom: description→options token)
│   └─ ScrollView (flex 1)
│        contentContainerStyle={{ paddingBottom: 16 }}
│        showsVerticalScrollIndicator={false}
│        └─ BaseRadioButtonGroup gap={optionGap}
└─ View (footer: paddingHorizontal GUTTER, paddingTop 12, paddingBottom max(insets.bottom, 16), gap 10, maxWidth 480, alignSelf center, width 100%)
    ├─ BaseButton "Continue" disabled={!answers[currentBar]} isLoading={saveAnswersLoading}
    └─ BaseButton "Go Back" (styles unchanged)
```

- Get `insets` from `useSafeAreaInsets()`. Remove the screen's `SafeAreaProvider` and `SafeAreaView`.
  - The native stack header (`headerShown: true` in `app/_layout.tsx`) already handles the top inset.
  - Left/right insets only matter in landscape, which is out of scope.
  - The footer handles the bottom inset.
- `const { height } = useWindowDimensions(); const isCompact = height < 740;`. Derive `optionGap`, `titleSize`, `progressToTitle` and `descriptionToOptions` from it, per the table in Decisions.
- Text styles:
  - Title: `fontFamily: FONTS.figtreeSemiBold`, `fontSize: titleSize`, `textAlign: "center"`, `maxFontSizeMultiplier={1.3}`.
  - Description: Figtree Regular 18, `opacity: 0.7`, `maxFontSizeMultiplier={1.3}`. Keep its current left alignment unless Figma centers it **(confirm)**.
- Scroll the options list back to the top when `currentBar` changes (keep a `ref`, call `scrollTo({ y: 0, animated: false })`). That way each question starts at its first option on small screens.
- Keep the `!answers[currentBar]` guard inside Continue's `onPress` as a safety net. The toast will no longer be reachable in practice, which is fine.
- Remove `onScroll={() => console.log("scroll")}` and the old `container` / `scrollContent` / `buttonContainer` styles that are no longer used.
- **Don't change:** `ALL_QUESTIONS`, the `answers` state shape, the `handleAnswerChange` logic, the save/API/toast/navigation logic inside Continue (other than the guard described above), Go Back behaviour, or the header in `app/_layout.tsx`.
  - The existing `console.log` / `console.error` lines inside the save handler aren't style, but since this file is being touched, remove the two `console.log` calls (keep `console.error`).

## Out Of Scope

- Question wording, option labels and values, and the number of questions.
- The native header / back button and the duplicated "Go Back" button (both stay).
- Moving colours into a design-token file.
- Dark mode, tablets, landscape.
- Animations (card press, selection or question transitions).

## Acceptance Criteria

1. **Continue state:**
   - On every question, before an option is selected, Continue is grey (`#D9D9D9` **(confirm)**), shows no press feedback, and does nothing.
   - Selecting an option immediately turns it yellow.
   - Going back to an answered question shows Continue enabled.
   - VoiceOver / TalkBack announce it as "Continue, button, dimmed / disabled" while disabled.
2. **Horizontal spacing:**
   - On every device in the matrix, the left edge of the option cards, title area and buttons sits exactly **24 pt/dp (confirm)** from the screen's left edge, and the right edge is the same distance from the right.
   - Nothing overflows horizontally on a 360 dp-wide Android.
3. **Long labels** wrap inside the card. The card grows taller, the radio stays vertically centered, and no text is clipped, including with the system font size set to the largest non-accessibility size.
4. **Footer position:** Continue and Go Back are visible without scrolling on every device in the matrix, in the same position for all 5 questions. On devices with a home indicator / gesture bar, Go Back sits above the inset.
5. **Small screens:** on the iPhone SE the compact tokens apply (8 gap, 28 title). If the options don't fit, only the option list scrolls, and it starts at the top for each new question.
6. **Consistency:** at default font settings, a screenshot of question 1 on the iPhone 16 and on the Pixel 8 differ only in card width (fluid). Gutter, gaps, font sizes, card height and button sizes are identical.
7. **Selected state:** the selected card shows the yellow border plus the filled radio, and screen readers announce it as a selected radio.
8. **Accessibility labels:** each option is announced as a radio with its label, and the list as a radio group.
9. **Lint and types:**
   - There are no React key warnings for this screen in the Metro log.
   - There is no `console.log` in the changed files.
   - `npx expo lint` and `npx tsc --noEmit` report no new errors compared with the baseline.
10. **Other `BaseButton` screens** (welcome, login, registration, home, chat history, free consultation, meditation session) look and behave exactly as before.

## Test Matrix

| Platform | Device | Window height | Mode | Check |
| --- | --- | --- | --- | --- |
| iOS | iPhone SE (3rd gen) | 667 | compact | footer visible, list scrolls if needed, 24 gutter |
| iOS | iPhone 16 | 852 | regular | baseline vs Figma frames |
| iOS | iPhone 16 Pro Max | 932 | regular | gutter still 24, cards just wider |
| Android | small 360 × 640 dp emulator | ~640 | compact | **no horizontal overflow**, footer visible |
| Android | Pixel 8, gesture nav | ~915 | regular | same look as iPhone 16 |
| Android | Pixel 8, 3-button nav | ~870 | regular | Go Back sits above the nav bar |

On each device:

- Step through all 5 questions with and without a selection.
- Go back and forward.
- Finish the flow (the save still works and routes to tabs).
- Repeat question 1 with the system font size at its largest standard setting.

## Files Summary

- **Edit:** `app/authentication/registration_questions.tsx`, `comp/base/BaseRadioButton.tsx`, `comp/base/BaseRadioButtonGroup.tsx`, `comp/base/BaseButton.tsx` (additive `disabled` prop only), `comp/base/BaseProgressBar.tsx` (keys only)
- **No change:** `constants/registration_questions/registrationQuestions.tsx`, `app/_layout.tsx`, `theme.js`, `constants/colors.ts`, `package.json` (no new dependencies)
