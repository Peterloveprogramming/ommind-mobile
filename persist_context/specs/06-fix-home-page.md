# Fix The Home Page Lhamo Card, Mood Check-In And Today's Intention

## Goal

Restyle three sections of the Home tab (`app/(tabs)/index.tsx`) so that they match Figma:

1. **The "Lhamo is guiding you today" card** (hero card): the artwork, text, speech bubble and the two buttons.
2. **The "How are you feeling today?" mood check-in**: the title, subtitle and the 3 × 3 grid of mood pills.
3. **Today's Intention**: the divider above it, the title, and the intention / affirmation card with its Refresh Guidance button.

All three sections must look the same on iOS and Android and on every common phone width (360–440 pt/dp). They use one set of tokens, one width breakpoint and no per-platform values.

Scope is **style and layout only** for these three sections, plus two small copy changes in Today's Intention (the title emoji and the "…" character, confirmed).

These stay as they are:

- Mood check-in logic (confirm alert, one check-in per day, API call, caching).
- Intention / affirmation loading and refresh logic.
- The homepage API and navigation.
- The copy of the mood title and subtitle.
- **Section order.** Today's Intention stays directly under the mood check-in (confirmed). Figma places it after "Your practice today".

Everything else on Home (header, temporary Log out pill, Your Practice Today, bottom tab bar) is out of scope.

## Figma Source

File `37GSSpgSU44KPNvLuVKAOw` (OmMind Copy), frame "Home Day 7 / 14":

- https://www.figma.com/design/37GSSpgSU44KPNvLuVKAOw/OmMind--Copy-?node-id=2958-10054 (node `2958:10054`, 393 pt wide)
- Hero card: node `2958:10090` (guiding row `2958:10098`, bubble `2958:10104`, buttons `2958:10108` / `2958:10120`)
- Mood section: node `2958:10128` (title `2958:10131`, subtitle `2958:10132`, pills `2958:10135` to `2958:10161`, selected example "Neutral" `2958:10145`)
- Today's Intention: divider `2958:10325`, title `2958:10327`, card `2958:10329` / `2958:10330` (text blocks `2958:10332` and `2958:10336`, inner divider `2958:10335`, Refresh Guidance `2958:10339`)

All values below were measured from these nodes. Figma is designed at 393 pt.

### Hero card values

| Element | Figma value |
| --- | --- |
| Card artwork | `assets/images/home/background_img.png` (1473 × 856 px, aspect **1.7208**). Figma's mask is 368 × 213.9 = 1.7204, so the asset already is the masked artwork (arch, rounded corners and border drawn in). |
| Card position | 13 from each screen edge (current code: 12, within 1 pt, keep 12) |
| Content inset | top 24, left 13 (from the artwork's top-left), about 12–14 free at the bottom |
| Content column | 195 wide. The bubble fills it; the guiding row is right-aligned in it; the buttons are left-aligned. |
| Guiding row | moon icon 22 × 22 (`assets/images/home/moon.png`), gap 4, text 14 / line height 20, letter spacing −0.8, colour `#F8C63E`. "Lhamo" is Figtree **Bold**, " is guiding you today" is Figtree **Medium (500)**. |
| Row → bubble | 8 |
| Speech bubble | 195 wide, min height 61, corner radius 12, a 6 wide tail on the left pointing left (tip about 19 above the bottom), fill `#FAF9F2` at 38% opacity, 1 pt stroke `#FAF9F2` |
| Bubble text | Figtree Medium (500) 13 / line height 17, `#4D4949`, vertically centered, about 13 left (6 tail + 7) and 6 right padding |
| Bubble → buttons | 8 |
| Buttons | 169 × 36, pill radius, padding H 10, icon 22, icon → text gap 8, gap between buttons 4. Text Figtree SemiBold 13 / 20, letter spacing −0.24. |
| Create Meditation | bg `rgba(248, 198, 62, 0.78)`, white text, white icon (`create_meditation.png`) |
| Chat with Lhamo | bg `rgba(255, 255, 255, 0.78)`, text `#4D4949`, dark icon (`chat.png`) |

### Mood section values

| Element | Figma value |
| --- | --- |
| Hero card → section | 15 (16 from the artwork's bottom edge). **No divider** between the hero card and this section. |
| Title | Figtree **Bold** 14 / 20, letter spacing −0.24, `#4D4949`, centered |
| Title → subtitle | 3 |
| Subtitle | Figtree Medium (500) 13 / 20, letter spacing −0.24, `#8E8E93`, centered |
| Subtitle → grid | 15 |
| Grid | 3 rows of 3, centered. Column gap 11, row gap 6. Total 322 wide. |
| Pill | 100 × 40, pill radius, 1 pt border `#ECE0D7`, **no fill** (transparent) |
| Pill icon | 35 × 35 (Focused: 37 × 37), 4 from the left edge, vertically centered |
| Pill label | Figtree Medium (500) 13 / 20, letter spacing −0.24, `#4D4949`, centered in the space right of the icon (about 12 right padding) |
| Selected pill | **border only** turns `#F8C63E`. Fill and label colour don't change. |
| Mood grid → next divider | 15 |

### Today's Intention values

| Element | Figma value |
| --- | --- |
| Divider above the section | 1 pt line, 23 in from each screen edge, horizontal gradient `#D9D9D9` at 20% → 100% (middle) → 20%. 15 below the content above it. |
| Divider → title | 15 |
| Title | "💫 Today’s Intention", Figtree **Bold** 14 / 20, letter spacing −0.24, `#4D4949`, centered |
| Title → card | 15 |
| Card | 23 from each screen edge (347 wide at 393), height 232, corner radius 12, clipped. Background: the sky / mountains image at 30% opacity, `cover`. No fill colour (page background shows through). |
| Card padding | top 11, bottom 11, horizontal 12. The content is a centered column with a 15 gap between its 4 items. |
| Item 1: intention block | 270 wide, gap 4. Lead "Lhamo senses how you’re feeling…" / "and gently suggests:" in Figtree **SemiBold Italic** 13 / 20, `#8E8E8E`, centered (2 lines). Intention word in Figtree SemiBold 16 / 20, `#000000`, centered. |
| Item 2: inner divider | full content width, 1 pt, same `#D9D9D9` 20% → 100% → 20% gradient |
| Item 3: affirmation block | 270 wide, gap 4. Lead "Lhamo’s Affirmation for you" in Figtree SemiBold Italic 13 / 20, `#8E8E8E`. Affirmation in Figtree SemiBold 16 / 20, `#000000`, centered (2 lines in Figma). |
| Item 4: Refresh Guidance | 158 × 36, pill radius, padding H 10, bg `rgba(140, 140, 138, 0.64)`, lotus icon 22 (white), icon → text gap 4, text Figtree SemiBold 13 / 20, letter spacing −0.24, white |

Check of the totals: 11 + 40 + 4 + 20 + 15 + 1 + 15 + 20 + 4 + 40 + 15 + 36 + 11 = **232**, the Figma card height.

The Figma frame's content column is 401 wide (wider than the 393 screen), so the card looks off-center in Figma (23 left, about 15 right). The intent is clearly a 23 pt gutter on both sides, so use that.

Assets:

- The 9 mood icons in `assets/images/home/feelings/`, `moon.png`, `create_meditation.png`, `chat.png` and `lotus.png` are the same artwork as Figma at @3x for their display size.
- `assets/images/home/sky.png` (1472 × 920) is the same sky / mountains photo as Figma's card background, with the 30% fade and rounded corners **already baked in**. Render it at full opacity; don't apply `opacity: 0.3` on top.

**No asset changes.**

## What Is Wrong Today

File: `app/(tabs)/index.tsx`.

### Hero card

1. **The artwork is distorted on every device.**
   - `HOME_BACKGROUND_ASPECT_RATIO = 1473 / 900`, but the image is 1473 × **856**.
   - `minHeight: 238` and `resizeMode: "stretch"` stretch it further. On a 393 pt iPhone the card is about 225 tall instead of 214, so Lhamo and the arch are squashed vertically, and more so on narrower phones.
2. **The artwork's own corners are cut off.** `borderRadius: 28` + `overflow: "hidden"` clips the image. The asset already has 12 pt rounded corners and a decorative border drawn in, so the extra 28 radius cuts into that border.
3. **Content position is percentage-based** (`left: "5%"`, `top: "8%"`, `width: "44%"`, `bottom: "8%"`, `justifyContent: "space-between"`).
   - The column is 44% instead of 195 / 368 = 53%, so the bubble and buttons are too narrow.
   - Space-between pushes the buttons to the bottom instead of 8 under the bubble.
   - The vertical gaps change with the card height.
4. **Guiding row text is wrong:** Inter Medium 12, `#4B4748` (Lhamo `#333132`). Figma: Figtree 14, brand yellow `#F8C63E`, Bold "Lhamo" + Medium rest.
5. **The bubble is a plain rounded box:** radius 17, 1.5 white border at 92%, white fill at 12%, no tail. The text is Inter 12 with **line height 13** (cramped) and up to 6 lines. Figma: radius 12, tail on the left, `#FAF9F2` 1 pt stroke and 38% fill, Figtree Medium 13 / 17.
6. **Buttons are too small:** height 28, font 12, icon 14, full column width, opaque backgrounds. Figma: 169 × 36, font 13, icon 22, 78% opacity backgrounds.
7. **Both buttons show a spinner when only Chat is navigating.** Both have `isLoading={isNavigating}`, so tapping "Chat with Lhamo" turns "Create Meditation" into a spinner too. Create Meditation only opens a modal and is already guarded by `isNavigating` in its handler.

### Mood section

8. **Extra divider.** A `bottomDivider` sits between the hero card and the mood section (26 + 38 = 64 pt of space). Figma has no divider there and only 15 pt.
9. **Text styles:**
   - Title: Figtree SemiBold 18 / 24 instead of Bold 14 / 20.
   - Subtitle: Inter 13 / 18 `#9A9593` with a 12 gap instead of Figtree Medium 13 / 20 `#8E8E93` with a 3 gap.
10. **Pills are too big and filled:**
    - `minHeight: 54` (Figma 40), icon 28 (Figma 35 / 37), label Figtree SemiBold 14 (Figma Medium 13).
    - Fill `#FFFEFC` (Figma none), border `#E9D9C9` (Figma `#ECE0D7`).
11. **Selected state doesn't match:** the whole pill fills yellow `#F7C648`. Figma keeps the pill unfilled with a `#F8C63E` border.
12. **The grid is width-percentage based** (`width: "31%"`, `space-between`, row gap 16). Pill widths and gaps change with screen width instead of using Figma's 100 wide pills, 11 gap and 6 row gap.
13. **The grid jumps.** The check-in status message ("Saving your … check-in", "Your mood check-in is set for today…") is rendered **above** the grid. When it appears, the whole grid moves down under the user's finger.
14. **Font weight not available.** Figma uses Figtree Medium (500), but the app only loads Figtree 400 / 600 / 700, and `FONTS.figtreeMedium` actually maps to `Figtree_400Regular`.
15. **Android text metrics.** No `includeFontPadding: false`, so on Android the labels sit 1–2 dp lower inside the pills than on iOS.

### Today's Intention

16. **Divider and spacing above the section:**
    - The divider is a solid `#E5E1DC` line inset 18 from the screen edges, 26 below the mood grid. Figma: a fading `#D9D9D9` gradient line inset 23, 15 below.
    - The section then adds `paddingTop: 28`. Figma: 15.
17. **Title:** "✨ Today's Intention" in Figtree SemiBold 17 / 22, 22 above the card. Figma: "💫 Today’s Intention", Bold 14 / 20, 15 above the card.
18. **Card size and shape:**
    - It is as wide as the scroll content (12 from the screen edges). Figma: 23.
    - It has a fixed `height: 250`. Figma: 232.
    - `borderRadius: 28` is only on `imageStyle`, so the card itself isn't clipped and the radius doesn't match Figma's 12. It also fights the 12 pt corners baked into `sky.png`.
19. **Content floats in the middle.**
    - The card uses `justifyContent: "center"` with padding 18 / 14 and ad-hoc margins (6, 14, 12, 10, 16). Figma: top-aligned, 11 / 12 padding and an even 15 gap between the 4 items.
    - Because the height is fixed, a long affirmation spills out of the background image instead of growing the card.
20. **Text styles:**
    - The two lead lines are upright `FONTS.figtreeMedium` (really Regular 400), 13 / 18 and 12 / 16, `#98938F`. Figma: Figtree SemiBold **Italic** 13 / 20, `#8E8E8E`.
    - The intention word is 22 / 28 `#111111` and the affirmation 18 / 24. Figma: both SemiBold 16 / 20, `#000000`.
    - Neither text block has a width limit. Figma: 270, so the affirmation wraps the same way on every phone.
21. **Inner divider:** `width: "115%"` (wider than its parent, it relies on overflow) in a solid colour. Figma: the full content width, in the same fading gradient as the section divider.
22. **Refresh Guidance button is too big and the wrong colour:**
    - `minHeight: 42`, padding 22, icon 20, icon gap 8, text 12 / 16, bg `rgba(175, 171, 169, 0.95)`.
    - Figma: 158 × 36, padding 10, icon 22, gap 4, text 13 / 20, bg `rgba(140, 140, 138, 0.64)`.
    - It has no `accessibilityRole`.
23. **The card jumps while loading.** The spinners sit in wrappers 28 and 24 tall, but the texts they replace are 28 tall and 2 × 24 = 48 tall. The content then shifts every time guidance loads or refreshes.

## Decisions

- **Fixed Figma sizes, fluid only where needed.** Text sizes, pill size, button size, bubble size and gaps are the Figma pt values on every device. Only the hero artwork scales with screen width (it must, to keep its aspect ratio).
  - No proportional scaling library. It makes every device slightly different, which is the opposite of the consistency asked for, and it would be a new dependency (same reasoning as spec 05).
- **Hero artwork keeps its true aspect ratio.**
  - `HERO_ASPECT_RATIO = 1473 / 856`.
  - Card width: `Math.min(windowWidth − 2 × 12, 480)`, with `alignSelf: "center"`.
  - Card `minHeight = cardWidth / HERO_ASPECT_RATIO`, computed from `useWindowDimensions()` (not `Dimensions.get`, not `onLayout`, so there is no first-frame jump).
  - The content sits **in normal flow** inside the card (padding, not absolute positioning). At default font size it is shorter than `minHeight` on every supported width, so the artwork shows at its exact ratio.
  - If the content is ever taller (largest accessibility font sizes), the card grows and `resizeMode: "stretch"` stretches the artwork slightly. Graceful degradation is better than clipped buttons.
  - Remove `borderRadius` / `overflow: "hidden"` from the card and the image. The asset has its own rounded corners and transparency.
- **One width breakpoint for the hero card:** `const isCompactWidth = windowWidth < 390`.
  - It puts 360 / 375 / 384 wide phones (small Androids, Galaxy S series at 360 / 384 dp, iPhone SE, iPhone 13 mini) in compact mode.
  - It puts iPhone 12+ (390+), Pixel (412) and Pro Max / Plus phones in regular mode.

  Compact changes only:

  | Token | Regular (Figma) | Compact |
  | --- | --- | --- |
  | Hero content padding top | 24 | 18 |
  | Guiding row → bubble | 8 | 6 |
  | Bubble → buttons | 8 | 6 |
  | Button height | 36 | 32 |

  Why: regular content is about 200 pt tall + 12 bottom = 212. The artwork is 214 tall at 393 but only 195 tall at 360. The compact tokens bring the content to about 182 + 10, so the artwork isn't stretched on small phones. Everything else (font sizes, bubble, button width, gutter) is identical in both modes, so the design stays recognisably the same. The mood section needs no breakpoint.
- **Hero content column.** `width: "58%"`, `maxWidth: 195`.
  - 195 is the Figma column on every phone 340+ wide.
  - 58% keeps the bubble left of Lhamo's arch, which starts at 63.6% of the artwork, on narrow screens.
  - The guiding row (about 183 wide) uses `alignSelf: "flex-end"` as in Figma.
  - Each button sits in a wrapper `View` with `width: "100%"`, `maxWidth: 169`, so the tap area matches the visual button. `BaseButton`'s outer `TouchableOpacity` can't be styled.
- **Bubble text is capped at 3 lines with an ellipsis** (`numberOfLines={3}`, confirmed). This matches Figma on every phone. Very long `home_page_text` gets cut with "…".
- **Speech bubble via `react-native-svg`** (already installed, used by `TabBarBackground` and `ChatComposer`).
  - A new `SpeechBubble` component measures itself with `onLayout` and draws the outline as an SVG path built from the measured width and height.
  - A scaled fixed SVG (`preserveAspectRatio="none"`) is rejected, because it distorts the 12 pt corners when the text wraps differently.
  - A `View` + separate tail triangle is rejected, because the translucent fill makes the seam between them visible.
- **Load Figtree Medium 500 (confirmed) and Figtree SemiBold Italic, additive only.**
  - Add `Figtree_500Medium` and `Figtree_600SemiBold_Italic` to `useFigtree` in `app/_layout.tsx`. Both are in the installed `@expo-google-fonts/figtree`.
  - Add **new** keys `figtreeMedium500: "Figtree_500Medium"` and `figtreeSemiBoldItalic: "Figtree_600SemiBold_Italic"` to `FONTS` in `theme.js`.
  - Don't rename or change `FONTS.figtreeMedium` (it is used across the app as Regular). Only the sections in this spec use the new keys.
  - Never use `fontWeight` or `fontStyle: "italic"` together with a custom `fontFamily`. On Android the platform then picks the wrong face or fakes the italic. The weight and the italic come from the family name only.
  - Nested `<Text>` with a different `fontFamily` ("Lhamo" Bold inside the Medium sentence) works the same on both platforms.
- **Mood copy stays as today (confirmed):** title "🍃 How are you feeling today?", subtitle "Choose what feels closest - this will be your check-in for today". Only the styling changes. The longer subtitle wraps to 2 lines at 13 pt: give it `paddingHorizontal: 24` so it wraps evenly. The emoji renders as Apple vs Noto artwork per platform, which is expected.
- **Mood grid is 3 explicit rows**, not `flexWrap` with percentage widths.
  - Chunk `MOOD_OPTIONS` into rows of 3.
  - Each row: `flexDirection: "row"`, `justifyContent: "center"`, `gap: 11`.
  - Each pill: `flex: 1`, `maxWidth: 100`.
  - Result: exactly 100 wide pills and a 322 wide grid on every phone 344+ wide. Pills shrink evenly below that, with no overflow.
- **Pill content.**
  - Icon `marginLeft: 3` (4 from the outer edge including the 1 pt border), size from a new optional `iconSize` field on `MOOD_OPTIONS` (default 35, Focused 37).
  - Label `flex: 1`, centered, `paddingRight: 11`, `numberOfLines={1}`, `adjustsFontSizeToFit`, `minimumFontScale={0.85}`. The longest labels ("Peaceful", "Inspired") are about 50 pt in a 49–51 pt slot, so this prevents a wrap or clip on Android, whose glyph widths differ slightly.
  - Pill `minHeight: 40` (not `height`), so the pill can grow with font scaling.
  - `hitSlop={{ top: 3, bottom: 3 }}` gets closer to the 44 pt / 48 dp touch target without overlapping the neighbouring row (row gap 6).
- **Selected and pending pill:** `borderColor: COLORS.brandYellow`. The fill stays transparent and the label colour doesn't change, as in Figma's "Neutral" example. The existing "muted" state (opacity 0.55 on the other pills while saving) stays: it isn't in Figma but it is functional feedback.
- **Status message moves below the grid** (`marginTop: 10`), so the grid never moves when it appears. Text styles unchanged.
- **Intention card width matches the 23 pt gutter.**
  - `intentionCardWidth = Math.min(windowWidth − 2 × 23, 480)` with `alignSelf: "center"`, from the same `useWindowDimensions()` call as the hero.
  - Don't use `marginHorizontal` + `alignSelf: "center"`: a centered view without a width shrinks to its content.
  - 347 at 393, 314 at 360, 394 at 440. The 270 wide text blocks and the 158 button fit at every width, so no breakpoint is needed.
- **Intention card grows instead of overflowing.**
  - `minHeight: 232` (not `height`), top-aligned content with `gap: 15`.
  - The background is `resizeMode="cover"`, so a taller card just crops a little more of the sky. Unlike the hero artwork, there is no figure to distort.
  - Clip on the **container** (`borderRadius: 12`, `overflow: "hidden"` in `style`), not only `imageStyle`, so the image and children are clipped the same way on iOS and Android.
- **Intention text limits.**
  - The intention word gets `numberOfLines={2}` (it's normally one word).
  - The affirmation gets `numberOfLines={4}`, a safety cap well above Figma's 2 lines. It is the main message, so the card grows rather than cutting it at 2.
  - Both blocks are `width: "100%"`, `maxWidth: 270`, so the text wraps the same way on every phone.
- **No layout jump while guidance loads.** The spinner placeholders get the same height as the text they replace: intention `minHeight: 20` (1 line), affirmation `minHeight: 40` (2 lines, Figma). Short affirmations are 1–2 lines, so the card stays still when refreshing.
- **Refresh Guidance stays a custom `TouchableOpacity`, not `BaseButton`.**
  - `BaseButton` hard-codes an 8 pt icon gap (Figma: 4), and this grey translucent style isn't a `BaseButton` variant. Changing `BaseButton` would touch ~12 other screens.
  - The width hugs the content (icon 22 + gap 4 + text + 2 × 10 padding ≈ Figma's 158), `alignSelf: "center"`.
  - Behaviour unchanged.
- **Gradient dividers via `react-native-svg`.** A new `GradientDivider` component draws the Figma line: 1 pt, `#D9D9D9` at 20% → 100% at 51% → 20%. It is used for the divider above Today's Intention and for the inner card divider.
  - Rejected: `react-native-linear-gradient`. It is installed, but it is an extra native module for a 1 pt line, and `react-native-svg` is already used on screens that ship.
  - Rejected: `expo-linear-gradient`, because it would be a new dependency.
  - The gradient `id` must be unique per instance, because two SVGs with the same `id` can resolve to each other's gradient. Use React's `useId()` with non-alphanumerics stripped (`useId()` returns `:r0:`, and colons break `url(#…)`).
- **Today's Intention copy follows Figma (confirmed):**
  - Title "💫 Today’s Intention".
  - Lead "Lhamo senses how you’re feeling…" / "and gently suggests:" with a real ellipsis `…` and curly apostrophes.
  - "Lhamo’s Affirmation for you".
  - Write the characters directly in the JSX string, not `&apos;`.
- **Section order is unchanged (confirmed):** hero → mood → Today's Intention → Your Practice Today.
- **Font scaling.** Keep system font scaling on (accessibility), but set `maxFontSizeMultiplier={1.2}` on every text in the three sections. The hero card is a fixed-artwork layout and the pills are 40 tall, so 1.2 keeps them intact while still honouring larger text. The intention card grows as needed.
- **Android text consistency.** Every new text style in the three sections gets an explicit `lineHeight` and `includeFontPadding: false` (Android-only, ignored on iOS). Labels then sit at the same vertical position on both platforms.
- **Tokens.** Put every value from the Figma tables in one `HOME_UI` constants object at the top of `app/(tabs)/index.tsx`, with `hero`, `heroCompact`, `mood` and `intention` groups. This is the same approach as `QUESTIONS_UI` in spec 05, so a later colour-token spec can move them in one go. Don't edit `constants/colors.ts`. Only touch `theme.js` for the additive font keys.

## Implementation

### 1. `theme.js` (additive)

- Add `figtreeMedium500: "Figtree_500Medium"` and `figtreeSemiBoldItalic: "Figtree_600SemiBold_Italic"` to `FONTS`. Don't change any existing key.

### 2. `app/_layout.tsx` (additive)

- Import `Figtree_500Medium` and `Figtree_600SemiBold_Italic` from `@expo-google-fonts/figtree` (already installed, both exports exist) and add them to the `useFigtree({ … })` map. Nothing else changes.

### 3. New `comp/home/SpeechBubble.tsx`

```tsx
type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;   // width / minHeight from the caller
};
```

- Root `View`: `minHeight: 61`, `justifyContent: "center"`, `paddingLeft: 13`, `paddingRight: 6`, `paddingVertical: 5`, plus `style`.
- `onLayout`: store `{ width, height }` (rounded, only `setState` when it changed, to avoid layout loops).
- When the size is known, render `<Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">` with one `<Path>` **before** `children`:
  - `fill="#FAF9F2"`, `fillOpacity={0.38}`, `stroke="#FAF9F2"`, `strokeWidth={1}`.
  - Path with `t = 6` (tail width), `r = 12`, `s = 0.5` (half stroke, so the stroke isn't clipped):

    ```
    M t+r s
    H w-s-r   A r r 0 0 1 w-s s+r
    V h-s-r   A r r 0 0 1 w-s-r h-s
    H t+r     A r r 0 0 1 t h-s-r
    V h-13    L s+0.3 h-19.5    L t h-24.5
    V s+r     A r r 0 0 1 t+r s
    Z
    ```
- Export the constants (`TAIL_WIDTH`, `RADIUS`) so the padding stays in sync with the path.
- `accessible={false}` on the SVG. The text inside stays readable by screen readers.

### 4. New `comp/home/GradientDivider.tsx`

```tsx
type Props = { style?: StyleProp<ViewStyle> };   // margins from the caller
```

- Root `View`: `height: 1`, `alignSelf: "stretch"`, plus `style`.
- Inside it: `<Svg width="100%" height={1} pointerEvents="none">` → `<Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">` with stops:
  - `offset 0`: `#D9D9D9`, opacity 0.2
  - `offset 0.51`: `#D9D9D9`, opacity 1
  - `offset 1`: `#D9D9D9`, opacity 0.2

  Then `<Rect width="100%" height={1} fill={`url(#${gradientId})`} />`.
- `const gradientId = "divider" + useId().replace(/[^a-zA-Z0-9]/g, "")`.
- `accessible={false}` and `importantForAccessibility="no-hide-descendants"` on the root (it's decorative).

### 5. `app/(tabs)/index.tsx`: hero card

- Replace `HOME_BACKGROUND_ASPECT_RATIO = 1473 / 900` with `HERO_ASPECT_RATIO = 1473 / 856`.
- `const { width: windowWidth } = useWindowDimensions();` Then:
  - `isCompactWidth = windowWidth < 390`
  - `heroWidth = Math.min(windowWidth − 24, 480)`
  - `heroMinHeight = heroWidth / HERO_ASPECT_RATIO`
  - `24` = 2 × the existing `contentContainer.paddingHorizontal` (12): reference one constant, not a literal.

Structure:

```
ImageBackground source={HOME_BACKGROUND} resizeMode="stretch"
  style={[styles.heroCard, { width: heroWidth, minHeight: heroMinHeight,
          paddingTop: hero.paddingTop }]}            // alignSelf center, paddingLeft 13, paddingBottom 12
└─ View heroColumn                                   // width "58%", maxWidth 195
    ├─ View guidingRow                               // row, alignItems center, gap 4, alignSelf flex-end
    │   ├─ Image MOON_ICON 22×22
    │   └─ Text (Figtree 500, 14/20, ls -0.8, #F8C63E, maxFontSizeMultiplier 1.2)
    │        ├─ Text "Lhamo" (Figtree Bold)
    │        └─ " is guiding you today"
    ├─ SpeechBubble style={{ width: "100%", marginTop: rowToBubble }}
    │   └─ Text homePageText (Figtree 500, 13/17, #4D4949, numberOfLines 3, maxFontSizeMultiplier 1.2)
    └─ View buttonStack                              // marginTop bubbleToButtons, gap 4
        ├─ View buttonSlot (width "100%", maxWidth 169)
        │   └─ BaseButton "Create Meditation"  height={buttonHeight} fontSize={13}
        │        backgroundColor="rgba(248, 198, 62, 0.78)"
        │        icon 22×22 CREATE_MEDITATION_ICON   (no isLoading)
        └─ View buttonSlot
            └─ BaseButton "Chat with Lhamo"    height={buttonHeight} fontSize={13}
                 backgroundColor="rgba(255, 255, 255, 0.78)" fontColor="#4D4949"
                 icon 22×22 CHAT_ICON         isLoading={isNavigating}
```

- `BaseButton`:
  - `style`: `{ borderRadius: buttonHeight / 2, paddingHorizontal: 10, marginVertical: 0 }`.
  - `textStyle`: `{ lineHeight: 20, letterSpacing: -0.24, includeFontPadding: false }`.
  - Its built-in `marginRight: 8` on the icon already equals Figma's gap. **No `BaseButton` changes.**
- Remove the `"Create Meditation"` button's `isLoading` prop (fix for issue 7). `handleCreateMeditationPress` already returns early while `isNavigating`.
- Delete styles that are no longer used: `heroCardImage`, `heroContentColumn`, `heroTextGroup`, `messageBubble`, `primaryButton`, `secondaryButton`, and the old `guidingText` / `guidingName` / `messageText` / `buttonIcon` values (replace them with the new values).
- Keep `marginTop: 28` above the card (it is the spacing below the out-of-scope Log out pill).

### 6. `app/(tabs)/index.tsx`: mood section

- Remove the `<View style={styles.bottomDivider} />` **between** the hero card and the mood section.
- `feelingsSection`: `marginTop: 16`, no `paddingTop` / `paddingHorizontal`, `alignItems: "center"`, `width: "100%"`.
- Title / subtitle text styles: per the mood table. The subtitle gets `paddingHorizontal: 24` and `marginTop: 3`. Copy unchanged. Both get `maxFontSizeMultiplier={1.2}`.
- `MOOD_OPTIONS`: add `iconSize?: number` (`Focused: 37`). Build `MOOD_ROWS` once at module level by chunking into 3s.
- Grid: `View` with `marginTop: 15`, `width: "100%"`, `gap: 6`. One row `View` per `MOOD_ROWS` entry (`flexDirection: "row"`, `justifyContent: "center"`, `gap: 11`).
- Pill (`TouchableOpacity`, keep `activeOpacity 0.85`, `onPress`, `accessibilityState` logic):
  - Style: `flex: 1`, `maxWidth: 100`, `minHeight: 40`, `borderRadius: 20`, `borderWidth: 1`, `borderColor: "#ECE0D7"`, `backgroundColor: "transparent"`, `flexDirection: "row"`, `alignItems: "center"`.
  - Selected or pending: `borderColor: COLORS.brandYellow`.
  - Muted: `opacity: 0.55` (unchanged).
  - Add `accessibilityRole="button"`, `accessibilityLabel={feeling.label}`, `hitSlop={{ top: 3, bottom: 3 }}`.
- Icon: `width` / `height` = `feeling.iconSize ?? 35`, `marginLeft: 3`, `resizeMode: "contain"`.
- Label: `flex: 1`, `textAlign: "center"`, `paddingRight: 11`, Figtree 500 13 / 20, `letterSpacing: -0.24`, `color: "#4D4949"`, `includeFontPadding: false`, `numberOfLines={1}`, `adjustsFontSizeToFit`, `minimumFontScale={0.85}`, `maxFontSizeMultiplier={1.2}`.
- Move the `moodCheckInStatusText` block from above the grid to directly **below** it (`marginTop: 10`).
- Replace the `<View style={styles.bottomDivider} />` **after** the mood section with `<GradientDivider style={{ marginTop: 15, marginHorizontal: 11 }} />` (11 + the 12 scroll padding = 23 from the screen edge, as in Figma). The other `bottomDivider` usages on the page don't change.
- Delete `feelingPillSelected.backgroundColor`, `feelingLabelSelected` (no longer different) and the `feelingsGrid` `space-between` / `rowGap` / `flexWrap` values.

### 7. `app/(tabs)/index.tsx`: Today's Intention

- `intentionCardWidth = Math.min(windowWidth − 46, 480)`. Derive the `46` from the 23 gutter constant in `HOME_UI.intention`.

Structure:

```
View intentionSection                                // paddingTop 15, alignItems center
├─ Text "💫 Today’s Intention"                       // Figtree Bold 14/20, ls -0.24, #4D4949
└─ ImageBackground source={SKY_BACKGROUND} resizeMode="cover"
     style={[styles.intentionCard, { width: intentionCardWidth }]}
                                                      // marginTop 15, minHeight 232, borderRadius 12,
                                                      // overflow hidden, paddingTop 11, paddingBottom 11,
                                                      // paddingHorizontal 12, alignItems center, gap 15
   ├─ View textBlock (width "100%", maxWidth 270, gap 4)
   │   ├─ Text "Lhamo senses how you’re feeling…\nand gently suggests:"   // SemiBold Italic 13/20 #8E8E8E
   │   └─ isGuidanceLoading
   │        ? View (minHeight 20, center) → ActivityIndicator small #4D4949
   │        : Text {intention}  numberOfLines 2       // SemiBold 16/20 #000000
   ├─ GradientDivider                                 // stretches to the content width
   ├─ View textBlock (width "100%", maxWidth 270, gap 4)
   │   ├─ Text "Lhamo’s Affirmation for you"          // SemiBold Italic 13/20 #8E8E8E
   │   └─ isGuidanceLoading
   │        ? View (minHeight 40, center) → ActivityIndicator small #4D4949
   │        : Text {affirmation}  numberOfLines 4     // SemiBold 16/20 #000000
   └─ TouchableOpacity refreshButton                  // minHeight 36, borderRadius 18, paddingHorizontal 10,
        activeOpacity 0.85                           // bg rgba(140,140,138,0.64), row, center, gap 4
        accessibilityRole="button"
        accessibilityState={{ busy: isGuidanceLoading }}
        hitSlop={{ top: 4, bottom: 4 }}
        onPress={handleRefreshGuidancePress}           // unchanged
      ├─ Image LOTUS_ICON 22×22
      └─ Text "Refresh Guidance"                      // SemiBold 13/20, ls -0.24, white
```

- All texts: `textAlign: "center"`, explicit `lineHeight`, `includeFontPadding: false`, `maxFontSizeMultiplier={1.2}`. Italic texts use `FONTS.figtreeSemiBoldItalic` with **no** `fontStyle`.
- Remove the `imageStyle` radius (the container clips now). Render `sky.png` at full opacity: the 30% fade is already baked into the asset.
- Delete styles that are no longer used: `intentionCardImage`, `intentionDivider`, `intentionLoadingWrap` / `affirmationLoadingWrap` (replace them with the new placeholder heights), and the old margins on `intentionWord`, `affirmationLead`, `affirmationText` and `refreshButton`.
- Don't change: `handleRefreshGuidancePress`, `intention` / `affirmation` / `isGuidanceLoading` state, and the Your Practice Today section below (its `marginTop: 18` and top border stay).

### 8. Don't change

- State, effects, `loadHomepageInfo`, `loadIntentionAndAffirmation`, `submitMoodCheckIn`, `handleMoodPress` (Alert confirmation, one-per-day rule), `handleRefreshGuidancePress`, caching / Redux, API calls, navigation handlers (except removing `isLoading` from Create Meditation as above).
- Section order (hero → mood → Today's Intention → Your Practice Today).
- Header, avatar, notification bell, Log out pill, Your Practice Today, the bottom tab bar, `PersonalisedMeditationModal`, `ProfilePhotoUploadModal`.
- `comp/base/BaseButton.tsx`, assets, `constant.js`, `constants/colors.ts`, `package.json` (no new dependencies).

## Out Of Scope

- Header ("Welcome! / My Friend", avatar, bell), the temporary Log out pill, and the spacing above the hero card.
- Your Practice Today (including Figma's day tracker and session list) and the bottom tab bar.
- Moving Today's Intention below Your Practice Today to match Figma's order (kept by decision).
- Other dividers on Home: the `bottomDivider` after Your Practice Today and the recommendation section's top border keep their current style.
- Screen background colour (`#FCFCFB` in code vs `#FAFAFA` in Figma).
- Mood title / subtitle copy (kept by decision).
- Dark mode (`app.json` is `automatic`, but Home hardcodes light colours), tablets, landscape.
- Animations (pill press, selection, card entrance).

## Acceptance Criteria

1. **Hero artwork:**
   - At default font size on every device in the matrix, the card's height ÷ width equals 856 ÷ 1473 (±1 pt), with no visible stretch.
   - The artwork's own rounded corners and border are fully visible (not clipped).
2. **Hero content (iPhone 16 overlay vs Figma at 393 pt):**
   - Guiding row, bubble and buttons sit within ±2 pt of Figma's positions.
   - The guiding text is yellow `#F8C63E` with a bold "Lhamo".
   - The bubble has the left tail, a 12 radius, the light stroke and a translucent fill.
   - Buttons are 169 × 36 with 22 pt icons and 13 pt text.
3. **Small phones:**
   - On 360 / 375 / 384 wide devices the compact tokens apply (button height 32).
   - All content fits inside the artwork without stretching.
   - The bubble stays left of Lhamo's arch.
4. **Bubble text:**
   - A long `home_page_text` shows at most 3 lines ending in "…".
   - A one-line text gives a 61 tall bubble with the text vertically centered.
5. **Buttons:**
   - Tapping "Chat with Lhamo" shows a spinner only in that button.
   - "Create Meditation" opens the personalised meditation modal as before.
   - The tap area of each button equals its visual 169 pt width.
6. **Mood layout:**
   - There is no divider between the hero card and the mood title.
   - The title is 14 Bold, the subtitle 13 Medium `#8E8E93`, 3 apart.
   - Pills are 100 × 40 (on screens 344+ wide), in rows centered with 11 / 6 gaps.
   - Pills are transparent with a `#ECE0D7` border and a 35 (Focused 37) icon.
7. **Mood selection:**
   - After a check-in, the chosen pill has a yellow `#F8C63E` border only: no yellow fill, same label colour.
   - While saving, the other pills are muted and the grid does **not** move when the status message appears (it shows below the grid).
8. **Labels:** every mood label is on one line, unclipped, on both platforms at default font size and at the largest standard (non-accessibility) system size.
9. **Font:**
   - "is guiding you today", the bubble text, the mood subtitle and the mood labels render in Figtree Medium (500).
   - The two intention lead lines render in true Figtree SemiBold Italic on both platforms (not a slanted upright face).
   - Text on other screens using `FONTS.figtreeMedium` is unchanged (still Regular 400).
10. **Today's Intention layout (iPhone 16 overlay vs Figma at 393 pt):**
    - A gradient divider (fading at both ends) sits 15 below the mood grid, inset 23 from each edge.
    - The title "💫 Today’s Intention" (14 Bold) is 15 below the divider, and the card 15 below the title.
    - The card is 347 × 232 with 12 pt rounded corners, 23 from each screen edge, on the faded sky background.
    - Inside the card: italic grey leads 13 / 20, intention and affirmation 16 / 20 black, a gradient inner divider, and a 158 × 36 grey translucent Refresh Guidance button. Everything sits within ±2 pt of Figma, with even 15 gaps.
11. **Today's Intention resilience:**
    - Pressing Refresh Guidance shows spinners in place of the intention and a 2-line affirmation **without** the card or the button moving.
    - A 3–4 line affirmation makes the card taller, with the background still covering it and the corners still rounded on both platforms. A longer one ends in "…" after 4 lines.
    - On a 360 wide Android the card is 314 wide and nothing is clipped.
12. **Cross-platform consistency:** at default font settings, screenshots of the three sections on the iPhone 16 and the Pixel 8 differ only in hero and intention card widths (fluid). Fonts, pill sizes, gaps, bubble and button sizes are identical, and the labels sit at the same vertical position in the pills.
13. **Behaviour unchanged:**
    - The mood confirm alert still appears.
    - Only one check-in per day.
    - "Already checked in" messaging still works.
    - Refresh Guidance still refetches the intention and affirmation.
    - Recommendations still update after a check-in.
    - The section order is the same as before.
14. **Lint and types:** `npx expo lint` and `npx tsc --noEmit` report no new errors compared with the baseline (record the baseline before starting). There is no `console.log` added.

## Test Matrix

| Platform | Device | Width | Mode | Check |
| --- | --- | --- | --- | --- |
| iOS | iPhone SE (3rd gen) | 375 | compact | no stretch, buttons 32, bubble clear of arch |
| iOS | iPhone 13 mini | 375 | compact | same as SE |
| iOS | iPhone 16 | 393 | regular | **pixel overlay vs Figma frame** |
| iOS | iPhone 16 Pro Max | 440 | regular | card scales, column stays 195, pills stay 100 |
| Android | small 360 × 640 dp emulator | 360 | compact | no overflow, labels on one line |
| Android | Galaxy S2x (384 dp) | 384 | compact | no stretch |
| Android | Pixel 8, gesture nav | 412 | regular | same look as iPhone 16 |

On each device:

- Load Home with a short and a very long `home_page_text`.
- Check in a mood: cancel once, then confirm. Watch the muted state and the status message, and check that the grid doesn't move.
- Re-open Home and confirm that the selected border persists.
- Tap Chat with Lhamo (spinner only on that button) and Create Meditation (modal opens).
- Tap Refresh Guidance and watch for any movement in the intention card while it loads.
- Check the intention card with the default affirmation and with a long (4+ line) affirmation.
- Repeat with the system font size at its largest standard setting.

## Files Summary

- **New:** `comp/home/SpeechBubble.tsx`, `comp/home/GradientDivider.tsx`
- **Edit:**
  - `app/(tabs)/index.tsx`: hero card, mood section and Today's Intention JSX and styles, `HOME_UI` tokens, `MOOD_OPTIONS.iconSize`, `useWindowDimensions`.
  - `app/_layout.tsx`: load `Figtree_500Medium` and `Figtree_600SemiBold_Italic` (additive).
  - `theme.js`: `FONTS.figtreeMedium500` and `FONTS.figtreeSemiBoldItalic` (additive).
- **No change:** `comp/base/BaseButton.tsx`, `assets/images/home/**`, `constant.js`, `constants/colors.ts`, `api/**`, `store/**`, `package.json` (no new dependencies)
