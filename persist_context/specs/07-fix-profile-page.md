# Fix The Profile Page To Match Figma

## Goal

Restyle the Profile tab (`app/(tabs)/profile.tsx`) so that it matches the Figma "Profile" frame from top to bottom:

1. **Header:** avatar, name and the edit pencil.
2. **Stats:** the three stat cards (average time, total time, completed sessions).
3. **Current focus:** icon, title, focus list and the Change focus button.
4. **Recently Played:** header row and the horizontal session cards.
5. **Menu:** Saved, Manage subscriptions, Report a bug, Suggest an improvement, Contact us.
6. **Follow OmMind:** title and the three social icons.
7. **Page:** background, gutters, dividers and vertical rhythm.

The page must look the same on iOS and Android and on every common phone width (360–440 pt/dp). It uses one set of tokens, one width breakpoint and no per-platform values.

Scope is **style and layout**, plus these confirmed changes:

- Load the **Afacad** font for the stat cards (new dependency, confirmed).
- Show the **Test Buttons** pill only in dev builds (`__DEV__`, confirmed).
- **Remove the email line** under the name (confirmed). The email stays visible and editable in the profile details modal.
- Give `MeditationSessionCard` a **profile variant** so only Profile changes and Home's "Your practice today" cards stay exactly as they are (confirmed).
- Two small copy changes taken from Figma: the first stat title and the focus separator (see Decisions).

These stay as they are:

- Data loading (`getAccountDetails` on focus), all modals (photo upload, profile details, focus selection) and their logic.
- The feedback and contact forms (`ProfileFeedbackForm`, `ProfileContactForm`) that replace the page.
- Navigation: Saved, Recently Played (`/recently-played`), session player.
- Menu and social actions. Manage subscriptions and the social icons stay no-ops ("wired up later").
- The bottom tab bar (spec 02).

## Figma Source

File `37GSSpgSU44KPNvLuVKAOw` (OmMind Copy), frame "Profile":

- https://www.figma.com/design/37GSSpgSU44KPNvLuVKAOw/OmMind--Copy-?node-id=2875-9496 (node `2875:9496`, 394 pt wide, background `#FAFAFA`)
- Content column: node `2875:9525`. It starts 100 below the frame top, which is 41 below the 59 pt status bar. It is a vertical stack with a **15 gap** between its children.
- Header: avatar `2875:9527`, name row `2882:9523` (name `2875:9528`, pencil `2882:9522`)
- Stats row: `2875:9529` (cards `2875:9530`, `2875:9539`, `2875:9548`)
- Focus block: `2875:9557` (dividers `2875:9558` / `2875:9570`, icon `2875:9561`, title `2875:9567`, value `2902:9562`, button `2875:9568`)
- Recently Played: `2917:10878` (header `2884:9541`, card row `2931:10903`, first card `2931:10904`)
- Menu: `2918:11293` (rows `2918:11337`, `3048:9792`, `2918:11431`, `2918:11446`, `2918:11309`). Dividers around it: `2886:9581`, `2918:11347`.
- Follow OmMind: `2918:11351` (title `2899:9560`, icons `2887:9620`, `2887:9621`, `2887:9623`)

All values below were measured from these nodes.

### Page and rhythm

| Element | Figma value |
| --- | --- |
| Background | `#FAFAFA` |
| Horizontal gutter | **23** for every section (menu rows, stats row, Recently Played header and list start, dividers) |
| Top | avatar top = status bar + 41 |
| Avatar → name text top | 23 (stack gap 5 + 18 inside the 59 tall name row) |
| Name text bottom → stat cards | 28 (13 inside the name row + stack gap 15) |
| Stat cards → divider | 15 |
| Divider → focus icon | 20 |
| Change focus button → divider | 20 |
| Divider → "Recently Played" header | 15 |
| Session cards → divider | 15 |
| Divider → menu | 15 |
| Menu → divider | 15 |
| Divider → "Follow OmMind" | 15 |
| Dividers | 1 pt, `#D9D9D9` at 20% → 100% (51%) → 20%. This is exactly the existing `comp/home/GradientDivider`. Inset 23 from each edge. The two focus dividers are 345 wide in Figma (24.5 inset); use 23 like the others (1.5 pt difference). |

### Header values

| Element | Figma value |
| --- | --- |
| Avatar | 120 × 120 circle. 1 pt `#F8C63E` ring. Inner fill `#FBFAF6` behind the image. |
| Name | Figtree **Medium (500)** 24 / line height 28, `#000000`, centered on the screen |
| Pencil | 22 × 23, `#8E8E93` outline (`assets/images/profile/pencil.png` is the same artwork at @3x), 5 right of the name, vertically centered on it. The pencil hangs to the right; the **name** is what's centered. |
| Email | not shown |

### Stat card values

| Element | Figma value |
| --- | --- |
| Row | 23 gutter, 3 cards, `space-between` (9 between cards at 394) |
| Card | 110 × 130, radius 20, bg `rgba(37, 37, 37, 0.4)` (+ a 40.8 backdrop blur, see Decisions), padding H 12 / V 15, `justifyContent: "space-between"` |
| Title | **Afacad Regular** 14 / 14, white, left-aligned, top of the card. It wraps to 3 lines ("Average / Meditation / Time", "Total / Meditation / Time"). "Completed" sits on the **second** line (Figma uses an empty first line). |
| Bottom row | `space-between`, `alignItems: "center"`: badge left, number right |
| Badge | 40 × 40 circle with a 20 white icon: red `#AC2B3A` hourglass, yellow `#F8C63E` alarm clock, blue `#6A93CB` play. `red.png`, `yellow.png` and `blue.png` are these exact badges at @3x (120 px). |
| Number | **Afacad Bold** 36, white, right-aligned |
| Unit | **Afacad Bold** 12, white, right-aligned, directly under the number ("Minutes" / "Hours" / "Sessions") |
| Titles | "Average Meditation Time", "Total Meditation Time", "Completed" |

### Current focus values

| Element | Figma value |
| --- | --- |
| Icon | 44 × 44. The light grey circle (`rgba(217,217,217,0.3)`) and the planet are **both baked into** `change_focus_icon.png` (132 px = 44 @3x). |
| Icon → title | 9 |
| Title | "Your current focus", Figtree SemiBold 20 / 20, `#000000`, centered |
| Title → value | 9 |
| Value | e.g. "Healing · Compassion", Figtree **SemiBold Italic** 16 / 20, `#8F8F8F`, centered, max width 265. The separator is a middle dot `·`. |
| Value → button | 15 |
| Change focus button | 145 × 36, pill radius, bg `#595959`, padding H 14. Text Inter SemiBold 13 / 22, letter spacing −0.408, white. |

### Recently Played values

| Element | Figma value |
| --- | --- |
| Header row | padding H 23, `space-between`, `alignItems: "center"` |
| Header title | "Recently Played", Figtree SemiBold 16 / 28, letter spacing 0.35, `#000000` |
| Arrow | 24 × 24 right arrow, 2 pt stroke, `#595959`, round caps (the same path as Feather `arrow-right`) |
| Header → cards | 4 |
| Card row | starts 23 from the left edge and scrolls **to the screen edge** (the next card peeks in on the right). Gap 20 between cards. |
| Card | 300 × 120, radius 12, 1 pt border `#E8E8E8`, bg `#FFFFFF` |
| Card image | 120 × 120, left side, left corners 12 (right corners square) |
| Text panel | 180 wide, padding H 10, vertically centered, gap 7 between the 3 texts |
| Length / meta | "38 min", Figtree Regular 12 / 13, letter spacing 0.6, `#8B8B8B` |
| Title | Figtree SemiBold 16 / 17, letter spacing 0.32, `rgba(15, 9, 9, 0.74)`, **capitalized** ("Session 1: Grounding The Body And Posture"), max 3 lines (51 tall) |
| Type | "Guided Meditation", Figtree Regular 12 / 13, letter spacing 0.6, `#8B8B8B` |
| Progress | 1 pt `#F8C63E` line along the bottom edge of the text panel (starts at x 120), width = progress. **No visible track.** |

### Menu values

| Element | Figma value |
| --- | --- |
| List | padding H 23, gap **8** between rows |
| Row | full content width (348 at 394), height 44, radius 5, bg `#E5E5EA`, padding H 10, `flexDirection: "row"`, `alignItems: "center"`, gap 8 |
| Icon | 25 × 25 (the existing `saved`, `manage_subscriptions`, `report_a_bug`, `suggest_an_improvement` and `contact_us` PNGs are these icons at @3x) |
| Label | Figtree SemiBold 16 / 20, `#636366` |

### Follow OmMind values

| Element | Figma value |
| --- | --- |
| Block | centered column, gap 12 |
| Title | "Follow OmMind", Figtree SemiBold 16 / 28, letter spacing 0.35, `#636366`, centered |
| Icons | YouTube 42 × 42, TikTok 42 × 42, Instagram **40** × 42, radius 12, gap **19**. The PNGs (126 × 126, 126 × 126, 120 × 126) are these exact icons at @3x, already cropped to the edge with rounded transparent corners. |

**No asset changes.** Every icon already exists at @3x for its Figma size. Don't download anything from Figma.

## What Is Wrong Today

File: `app/(tabs)/profile.tsx` (styles from line 952), plus `comp/meditation_session/MeditationSessionCard.tsx`.

### Page

1. **Content starts under the status bar.**
   - `contentContainer.paddingTop: 48` is fixed, and nothing reads the safe area.
   - On iPhones with a Dynamic Island (top inset 59) the top ~11 pt of the avatar ring sits under the status bar.
   - Android on SDK 54 draws edge to edge, so it has the same problem with a different, device-dependent amount.
   - Figma: avatar top = status bar + 41.
2. **Wrong gutter, and the session list doesn't bleed.**
   - Everything is inside `paddingHorizontal: 16`. Figma: 23.
   - Because the padding is on the scroll content, the Recently Played list is clipped 16 from the right edge instead of scrolling to the screen edge.
3. **Background is beige** `#F7F2EA`. Figma: `#FAFAFA`.
4. **Dividers are solid** `borderTopColor: "#E7E0D7"` lines with ad-hoc spacing:
   - `marginTop` 18 / 28 / 36 and `paddingTop` 24 / 28.
   - Figma: gradient lines with an even 15 (20 around the focus block).

### Header

5. **Avatar is too big and the ring is wrong.**
   - The current avatar is a 148 circle with a 1.5 `#E1AE2D` border and `#FBF8F2` fill, around a 122 image.
   - Figma: a 120 image with a 1 pt `#F8C63E` ring.
6. **The "Test Buttons" dev pill** sits between the avatar and the name in every build, release included.
7. **Name styling and centring.**
   - The name is Figtree SemiBold 22 / 28 `#111111`. Figma: Medium (500) 24 / 28 `#000000`.
   - The name and pencil are centred **together**, so the name sits about 13 pt left of the screen centre. The pencil gap is 8 (Figma: 5).
   - Long names aren't truncated and push the pencil off-screen.
8. **Email line** is shown under the name. It isn't in Figma.

### Stats

9. **The cards don't match Figma.**
   - Background: opaque `#B6B6B8`. Figma: `rgba(37,37,37,0.4)`.
   - Radius 24 (Figma: 20) and `minHeight: 156` (Figma: 130).
   - Cards are 6 apart (`marginHorizontal: 3`). Figma: 9 apart.
10. **The card text is wrong.**
    - Title: Inter Medium 13 / 17. Figma: Afacad Regular 14 / 14.
    - Value: Figtree SemiBold 18. Figma: Afacad Bold 36.
    - Unit: 10. Figma: 12.
    - Badge: 34. Figma: 40.
    - The bottom row uses `space-evenly` with `alignItems: "flex-end"`. Figma: `space-between`, centered.
11. **Title copy.**
    - "Average Daily Meditation Time" wraps to 4 lines at Figma's size.
    - Figma: "Average Meditation Time".
12. **No overflow protection.**
    - A value like "12.5" (hours) or "100" (sessions) at Figma's 36 pt next to a 40 badge doesn't fit a 110 card.
    - On 360–384 wide phones the cards are narrower still.

### Current focus

13. **Double circle behind the icon.**
    - The icon is 34 inside a 58 `#F1ECE4` circle, but the asset already contains its own grey circle.
    - Figma: the 44 asset on its own.
14. **Text:**
    - Title: 18 / 24. Figma: 20 / 20.
    - Value: Inter 15 `#999999` with `fontStyle: "italic"`. On Android that gives a synthetic slant, or the wrong face. Figma: true Figtree SemiBold Italic 16 / 20 `#8F8F8F`.
    - The separator is `•`. Figma: `·`.
15. **Button is too big.**
    - It is `minWidth: 186`, `minHeight: 44`, with Figtree SemiBold 16.
    - Figma: 145 × 36, Inter SemiBold 13 / 22.

### Recently Played

16. **Header.**
    - Title: 18 / 24. Figma: 16 / 28, letter spacing 0.35.
    - The arrow is a `→` text glyph in Inter 28 `#6D6965`. It renders differently per platform font and sits on the text baseline. Figma: a 24 pt stroke icon in `#595959`.
    - Header → cards is 16. Figma: 4.
17. **Session card.**
    - Width: 310. Figma: 300.
    - Gap between cards: 12. Figma: 20.
    - Border: `#E4E1DD`. Figma: `#E8E8E8`.
    - Title: 17 / 21 `#4D4A4A`, not capitalized. Figma: 16 / 17, letter spacing 0.32, `rgba(15,9,9,0.74)`, capitalized.
    - Meta and type: 14 / 18. Figma: 12 / 13, letter spacing 0.6.
    - Progress: 2 pt with an `#EEE9E1` track and `#E6AA18` fill. Figma: 1 pt `#F8C63E`, no track.
    - The card is shared with Home, so it can't simply be restyled.

### Menu and Follow

18. **Menu rows are too big.**
    - The rows are `minHeight: 56`, radius 10, bg `#E4E4E8`, padding 20 / 12. Figma: 44, radius 5, bg `#E5E5EA`, padding 10.
    - Icon 30 + 16 gap. Figma: 25 + 8 gap.
    - Text 18 / 28 `#686B72`. Figma: 16 / 20 `#636366`.
    - Gap between rows: 12. Figma: 8.
    - The rows have no `accessibilityRole`.
19. **Follow block.**
    - Title: 22 / 28 `#686B72`. Figma: 16 / 28, letter spacing 0.35, `#636366`.
    - Icons: drawn at **64** inside **50** buttons, so the visual overflows the tap area, 30 apart. Figma: 42 / 42 / 40 × 42, 19 apart.
    - Title → icons: 24. Figma: 12.

### Housekeeping found while reviewing the code

20. These issues aren't visual, but they're in the file being touched:
    - `console.log("getAccountDetails result", result)` and the recently-played log (lines 189–190) print the user's name and email on every focus.
    - The avatar and name row have no accessibility role or label.
    - `fontStyle: "italic"` is set on a custom font family (see 14).

## Decisions

- **Fixed Figma sizes, fluid only where needed.** All of these are the Figma pt values on every device:
  - text sizes
  - card, row, button and icon sizes
  - gaps

  Only these stretch with screen width:
  - the menu rows and dividers (full content width)
  - the stats row spacing

  No proportional scaling library (same reasoning as specs 05 and 06).
- **One 23 pt gutter, applied per section.**
  - Remove `paddingHorizontal` from the ScrollView content.
  - Each section applies `PROFILE_UI.gutter` (23) itself. The Recently Played list puts it in its `contentContainerStyle` instead (`paddingHorizontal: 23`), so the cards start at 23 but scroll to the screen edge, as in Figma.
  - Add `maxWidth: 480` + `alignSelf: "center"` on the non-list sections, so they don't stretch on foldables.
- **Top spacing from the safe area.**
  - `paddingTop: insets.top + 41` on the scroll content, with `insets` from `useSafeAreaInsets()`. Don't use `SafeAreaView` from `react-native`: it is iOS-only and deprecated.
  - That gives exactly Figma's 100 on an iPhone 16 (inset 59) and the same 41 below the status bar on every Android phone.
- **One width breakpoint, stat cards only:** `const isCompactWidth = windowWidth < 390`, using `useWindowDimensions()`. This is the same threshold as spec 06's `HOME_UI.compactWidthBreakpoint`.

  | Token | Regular (Figma) | Compact (< 390) |
  | --- | --- | --- |
  | Stat card padding H | 12 | 10 |
  | Stat badge size | 40 | 34 |

  Why: at 394 a card's inner width is 86, and the badge (40) + number column (~40, "Minutes") = 80 fits. At 375 the cards are 104 wide and the inner width is 80. At 360 the cards are 99 wide and the inner width is 75. The compact tokens give an inner width of 79 at 360, with 34 + 40 fitting. Nothing else changes between modes.
- **Stats row layout.** The row is `flexDirection: "row"`, `justifyContent: "space-between"`, `gap: 9` (the minimum gap). Each card is `flex: 1`, `maxWidth: 110`, `minHeight: 130`.
  - From 394 up, cards are exactly 110 and the extra space goes between them, as in Figma's `space-between`.
  - Below 394 they shrink evenly with 9 pt gaps and never overflow.
- **No backdrop blur.**
  - Use `backgroundColor: "rgba(37, 37, 37, 0.4)"` directly.
  - The cards sit on a flat `#FAFAFA`, so Figma's backdrop blur has nothing to blur and is invisible.
  - Rejected: `expo-blur`'s `BlurView`. It would cost GPU on every scroll frame, Android's blur looks different from iOS's, and it would change nothing visible.
- **Afacad (confirmed).**
  - Install with `npx expo install @expo-google-fonts/afacad`. The latest is `0.4.1`, the same version line as the installed Figtree and Inter packages. `expo install` picks the version that is compatible with SDK 54.
  - Load **only** `Afacad_400Regular` and `Afacad_700Bold` in the existing `useFigtree({ … })` map in `app/_layout.tsx`. The splash screen already waits for that hook.
  - Add the `FONTS.afacadRegular` and `FONTS.afacadBold` keys.
  - No native rebuild is needed: fonts load at runtime through `expo-font`, exactly like Figtree today.
- **Stat card overflow protection.**
  - The number gets `numberOfLines={1}`, `adjustsFontSizeToFit` and `minimumFontScale={0.6}`, and its column gets `flexShrink: 1`. A long value ("12.5", "100") then shrinks to fit instead of clipping or pushing the badge out.
  - The badge gets `flexShrink: 0`.
- **Stat titles use a fixed 3-line title box.**
  - The title `Text` sits in a `View` with `minHeight: 45` (3 × 15) and `justifyContent: "center"`, with `numberOfLines={3}`.
  - The two long titles fill all 3 lines, and "Completed" sits on the middle line, which reproduces Figma without its empty-first-line hack.
  - Line height is **15**, not Figma's 14. Afacad's descenders ("g" in "Average") clip on Android when the line height equals the font size, and 1 pt per line isn't visible.
  - The card still fits in 130: 15 + 45 + 50 + 15 = 125.
- **Copy changes from Figma:**
  - The first stat title becomes "Average Meditation Time" (the value is unchanged: daily average in minutes). "Average Daily Meditation Time" doesn't fit the card at Figma's size.
  - The focus separator becomes `" · "` (middle dot). Also add `·` to the split regex in `normalizeCurrentFocus` (`/[•·,]/`), so a stored "A · B" string still parses.
- **Avatar ring is drawn in code, not baked into the image.**
  - The ring is a `View` 120 × 120, `borderRadius: 60`, `borderWidth: 1`, `borderColor: COLORS.brandYellow`, `backgroundColor: "#FBFAF6"`, `overflow: "hidden"`. The `Image` fills it (`width/height: "100%"`, `resizeMode: "cover"`).
  - Uploaded photos then get the same ring as the default image.
  - The default image stays `assets/images/home/meditation_icon.png`.
- **Name is centred, the pencil hangs right.**
  - Row: `flexDirection: "row"`, `alignItems: "center"`, `alignSelf: "center"`, `maxWidth: windowWidth − 2 × 23`.
  - Children:
    1. A leading spacer `View` 27 wide (22 pencil + 5 gap).
    2. The name (`flexShrink: 1`, `numberOfLines={1}`, `ellipsizeMode="tail"`).
    3. The pencil, with `marginLeft: 5`.
  - The spacer balances the pencil, so the name's centre is the screen's centre. Long names truncate with "…" and keep the pencil visible.
- **Test Buttons in dev only (confirmed):** `{__DEV__ ? <TestButtons /> : null}`, moved to the **end** of the scroll content, below Follow OmMind.
  - Dev builds then show the same Figma layout above the fold as release builds, which matters for the overlay checks below.
  - Don't change the component.
- **Email removed (confirmed).** Delete the `emailText` line and style. `accountDetails.email` is still used to prefill the profile details modal.
- **Session card profile variant (confirmed).**
  - Add `variant?: "default" | "profile"` (default `"default"`) to `MeditationSessionCard`.
  - `"default"` keeps today's styles **exactly** (Home unchanged).
  - `"profile"` applies the Recently Played table values.
  - Implement it as a second `StyleSheet` merged over the base one (`[styles.x, isProfile && profileStyles.x]`), not a forked component. Props, data and behaviour are shared.
  - Title capitalization uses `textTransform: "capitalize"`, which RN supports on both platforms. The API title isn't changed.
- **Arrow icon from `@expo/vector-icons`.**
  - Use `<Feather name="arrow-right" size={24} color="#595959" />`. It is already installed, and Feather's arrow-right is the same path as Figma's (24 box, 2 stroke, round caps).
  - Rejected: a new SVG component or PNG. They would be an extra asset for an icon the library already ships.
  - Keep the existing `TouchableOpacity` wrapper, `hitSlop` and accessibility label.
- **Dividers reuse `GradientDivider`** from `comp/home/GradientDivider.tsx` (spec 06). It is the same gradient as Figma's lines here. Import it from its current path; moving it to a shared folder isn't needed for this spec.
- **Font scaling and Android metrics** (same rules as spec 06):
  - `maxFontSizeMultiplier={1.2}` on every text on the page. The stat cards and menu rows are fixed-size layouts, and 1.2 keeps them intact while still honouring larger text.
  - Every text style gets an explicit `lineHeight` and `includeFontPadding: false`.
  - **Never** use `fontWeight` or `fontStyle` with a custom `fontFamily`. The weight and italic come from the family name (`FONTS.figtreeSemiBoldItalic`, `FONTS.afacadBold`, …).
- **Touch targets.** Figma's controls are smaller than the 44 pt / 48 dp guideline, so the visuals stay Figma-sized and the tap areas grow with `hitSlop`:

  | Control | `hitSlop` |
  | --- | --- |
  | Change focus | `{ top: 4, bottom: 4 }` |
  | Menu rows | `{ top: 2, bottom: 2 }` (the 8 gap prevents overlap) |
  | Social icons | `4` all round |
  | Pencil row | `8` |
- **Accessibility:**
  - Avatar: `accessibilityRole="button"`, label "Change profile photo".
  - Name row: `accessibilityRole="button"`, label "Edit profile details".
  - Each stat card: `accessible` with the label `` `${title}, ${value} ${unit}` ``.
  - Menu rows: `accessibilityRole="button"` with the label text.
  - Badges, focus icon and dividers are decorative (`accessible={false}`).
- **Tokens.** Put every value from the Figma tables in one `PROFILE_UI` constants object at the top of `profile.tsx`, with `page`, `header`, `stats`, `statsCompact`, `focus`, `recent`, `menu` and `follow` groups. This is the same approach as `HOME_UI` / `QUESTIONS_UI`.
  - Don't edit `constants/colors.ts`.
  - Only touch `theme.js` for the additive Afacad keys.
- **Background `#FAFAFA`** on the ScrollView (`PROFILE_UI.page.background`).

## Implementation

Record the lint and type baseline first: `npx expo lint` and `npx tsc --noEmit`.

### 1. Dependency

- `npx expo install @expo-google-fonts/afacad`. This is the only `package.json` / lockfile change.

### 2. `theme.js` (additive)

- Add `afacadRegular: "Afacad_400Regular"` and `afacadBold: "Afacad_700Bold"` to `FONTS`. Don't change any existing key.

### 3. `app/_layout.tsx` (additive)

- `import { Afacad_400Regular, Afacad_700Bold } from "@expo-google-fonts/afacad";`
- Add both to the `useFigtree({ … })` map. Nothing else changes.

### 4. `comp/meditation_session/MeditationSessionCard.tsx`

- Add the prop `variant?: "default" | "profile"` (default `"default"`) and `const isProfile = variant === "profile"`.
- Add a `profileStyles` sheet with these overrides, applied only when `isProfile`:

  | Style | Profile override |
  | --- | --- |
  | `card` | `width: 300`, `borderColor: "#E8E8E8"` (height 120, radius 12, border 1 and white bg are already the same) |
  | `rightPanel` | `paddingHorizontal: 10`, `paddingTop: 0`, `paddingBottom: 0`, `justifyContent: "center"`, `gap: 7` |
  | `lengthText` / `typeText` | `fontFamily: FONTS.figtreeMedium` (Regular 400), `fontSize: 12`, `lineHeight: 13`, `letterSpacing: 0.6`, `color: "#8B8B8B"`, `marginTop: 0` |
  | `titleText` | `fontFamily: FONTS.figtreeSemiBold`, `fontSize: 16`, `lineHeight: 17`, `letterSpacing: 0.32`, `color: "rgba(15, 9, 9, 0.74)"`, `textTransform: "capitalize"`, `marginTop: 0` (keep `numberOfLines={3}`) |
  | `progressTrack` | `height: 1`, `backgroundColor: "transparent"` |
  | `progressFill` | `backgroundColor: COLORS.brandYellow` |

- All three texts get `includeFontPadding: false` and `maxFontSizeMultiplier={1.2}` **in the profile variant only**. The default variant stays byte-for-byte visually identical.
- Don't change the props contract, `progressWidth` logic, `generated_meditation` handling or `onPress`.

### 5. `app/(tabs)/profile.tsx`

Add:

- `useWindowDimensions` from `react-native`
- `useSafeAreaInsets` from `react-native-safe-area-context`
- `Feather` from `@expo/vector-icons`
- `GradientDivider` from `@/comp/home/GradientDivider`
- `COLORS` from `@/theme`

Then derive:

- `const isCompactWidth = windowWidth < PROFILE_UI.page.compactWidthBreakpoint`
- `const stats = isCompactWidth ? { ...PROFILE_UI.stats, ...PROFILE_UI.statsCompact } : PROFILE_UI.stats`

Structure (`G` = gutter 23):

```
ScrollView style={{ flex: 1, backgroundColor: "#FAFAFA" }}
  contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 41, paddingBottom: tabBarHeight + 24 }}
  showsVerticalScrollIndicator={false}
├─ isLoading → ActivityIndicator (absolute, top insets.top + 8, right G; unchanged otherwise)
├─ View header (alignItems center, paddingHorizontal G)
│   ├─ TouchableOpacity avatar (onPress handleProfilePress, a11y button "Change profile photo")
│   │   └─ View ring 120, radius 60, border 1 #F8C63E, bg #FBFAF6, overflow hidden
│   │       └─ Image profileImageSource (100% × 100%, cover)
│   ├─ TouchableOpacity nameRow (marginTop 23, hitSlop 8, a11y button "Edit profile details")
│   │   ├─ View spacer width 27
│   │   ├─ Text name           (Figtree 500, 24/28, #000, numberOfLines 1)
│   │   └─ Image PENCIL_ICON   (22 × 23, marginLeft 5)
│   └─ errorMessage → Text     (marginTop 6, unchanged style + includeFontPadding false)
├─ View statsRow (marginTop 28, paddingHorizontal G, row, space-between, gap 9)
│   └─ ×3 View statCard (flex 1, maxWidth 110, minHeight 130, radius 20,
│        bg rgba(37,37,37,0.4), paddingHorizontal stats.cardPaddingH, paddingVertical 15,
│        justifyContent space-between, accessible, accessibilityLabel)
│       ├─ View titleBox (minHeight 45, justifyContent center)
│       │   └─ Text title      (Afacad Regular 14/15, white, numberOfLines 3)
│       └─ View statFooter (row, space-between, alignItems center)
│           ├─ Image badge     (stats.badgeSize square, flexShrink 0)
│           └─ View valueCol (alignItems flex-end, flexShrink 1, marginLeft 4)
│               ├─ Text value  (Afacad Bold 36/36, white, right, numberOfLines 1,
│               │               adjustsFontSizeToFit, minimumFontScale 0.6)
│               └─ Text unit   (Afacad Bold 12/14, white, right)
├─ GradientDivider (marginTop 15, marginHorizontal G)
├─ View focusBlock (marginTop 20, alignItems center, paddingHorizontal G)
│   ├─ Image CHANGE_FOCUS_ICON (44 × 44; no wrapper circle)
│   ├─ Text "Your current focus"   (marginTop 9, Figtree SemiBold 20/20, #000, center)
│   ├─ Text currentFocusText       (marginTop 9, Figtree SemiBold Italic 16/20, #8F8F8F,
│   │                               center, maxWidth 265)
│   └─ TouchableOpacity changeFocus (marginTop 15, minWidth 145, minHeight 36, radius 18,
│        paddingHorizontal 14, bg #595959, center, hitSlop {top 4, bottom 4}, a11y button)
│       └─ Text "Change focus"     (Inter SemiBold 13/22, ls -0.408, white)
├─ GradientDivider (marginTop 20, marginHorizontal G)
├─ View recentSection (marginTop 15)
│   ├─ View header (paddingHorizontal G, row, space-between, alignItems center)
│   │   ├─ Text "Recently Played"  (Figtree SemiBold 16/28, ls 0.35, #000)
│   │   └─ TouchableOpacity (existing a11y + hitSlop 10) → Feather arrow-right 24 #595959
│   └─ FlatList horizontal (marginTop 4)
│        contentContainerStyle={{ paddingHorizontal: G, gap: 20 }}
│        renderItem → <MeditationSessionCard variant="profile" … />   (other props unchanged)
│        ListEmptyComponent → Text (Figtree Regular 14/20, #8B8B8B)
├─ GradientDivider (marginTop 15, marginHorizontal G)
├─ View menu (marginTop 15, paddingHorizontal G, gap 8)
│   └─ ×5 TouchableOpacity row (minHeight 44, radius 5, bg #E5E5EA, paddingHorizontal 10,
│        row, alignItems center, gap 8, hitSlop {top 2, bottom 2}, a11y button)
│       ├─ Image icon (25 × 25, contain)
│       └─ Text label (Figtree SemiBold 16/20, #636366, flex 1, numberOfLines 1)
├─ GradientDivider (marginTop 15, marginHorizontal G)
├─ View follow (marginTop 15, alignItems center)
│   ├─ Text "Follow OmMind"   (Figtree SemiBold 16/28, ls 0.35, #636366, center)
│   └─ View icons (marginTop 12, row, gap 19)
│       └─ ×3 TouchableOpacity (hitSlop 4, existing a11y) → Image (42×42 / 42×42 / 40×42, radius 12)
└─ __DEV__ → View (marginTop 24, alignItems center) → <TestButtons />
```

- Add `width` / `height` to each `socialItems` entry (Instagram 40 × 42) instead of one shared style.
- Change `statCards[0].title` to "Average Meditation Time".
- In `formatCurrentFocus`, change the join from `" • "` to `" · "`. In `normalizeCurrentFocus`, change the split regex to `/[•·,]/`.
- Delete the two `console.log` calls in `loadAccountDetails` (keep `console.error`).
- Delete styles that are no longer used:
  - `avatarBorder`, `emailText`, `focusIconWrap`, `recentlyPlayedArrow`, `profileMenuItemTextOnly`
  - every `borderTopWidth` / `borderTopColor` divider style
  - the old margin/padding values these sections replace
  - Keep the `!item.icon` fallback rendering, but drop its separate padding style. All 5 rows have icons.

### 6. Don't change

- Any handler or state in `profile.tsx`: photo picking/upload/confirm, profile details fetch/update, focus update, feedback/contact submit, `handleSessionPress`, `handleRecentlyPlayedPress`, `handleProfileMenuItemPress`, `handleSocialButtonPress`.
- `formatStatValue`, `formatHoursFromMinutes`, `getAverageDailyMeditationMinutes`.
- `ProfilePhotoUploadModal`, `FocusSelectionModal`, `ProfileDetailsModal`, `ProfileFeedbackForm`, `ProfileContactForm`, `TestButtons`.
- `app/(tabs)/_layout.tsx`, `AppTabBar`, `GradientDivider`, assets, `constants/colors.ts`, `api/**`.

## Out Of Scope

- The bottom tab bar and the Lhamo orb (spec 02).
- The feedback / contact form screens and all modals.
- Wiring Manage subscriptions and the social links.
- A sharper default avatar. `meditation_icon.png` is 183 px, which is about @1.5x for 120 pt. Exporting a 360 px version is a separate asset task.
- Moving `GradientDivider` out of `comp/home/` into a shared folder.
- Home's "Your practice today" cards (they keep the default card variant).
- Dark mode (`app.json` is `automatic`, but the page hardcodes light colours), tablets, landscape.
- Animations.

## Acceptance Criteria

1. **Top spacing:**
   - On the iPhone 16 the avatar's top is 100 pt from the screen top (41 below the status bar).
   - On every device in the matrix nothing is under the status bar, and the avatar is 41 below it.
2. **Overlay (iPhone 16 vs Figma at 394 pt):** avatar, name, stat cards, focus block, Recently Played header, menu rows, dividers and Follow block sit within ±2 pt of Figma, with the 15 / 20 rhythm in the Page table.
3. **Gutter:**
   - On every device in the matrix, the stat cards, menu rows, dividers, Recently Played title and the first session card start exactly 23 from the left edge.
   - Everything except the session list ends 23 from the right edge.
   - The session list scrolls to the screen edge.
4. **Header:**
   - 120 avatar with a 1 pt yellow ring, for both the default image and an uploaded photo.
   - The name is Figtree Medium 24, and its centre is the screen centre (±1 pt).
   - The pencil is 5 to its right.
   - A 40-character name truncates with "…" and the pencil stays visible.
   - No email line.
5. **Stat cards:**
   - Afacad renders (narrow letterforms, not Figtree or the system font) on both platforms.
   - Cards are 110 × 130 at 394+ wide, with radius 20 and the translucent dark fill.
   - The titles wrap as "Average / Meditation / Time" and "Total / Meditation / Time", and "Completed" is on the middle line.
   - The numbers are 36 pt.
6. **Stat overflow:**
   - With the values "12.5" hours and "100" sessions, on the 360 dp Android and the iPhone SE, the number shrinks to fit.
   - Nothing clips and the badge stays fully visible.
   - The compact tokens (padding 10, badge 34) apply below 390.
7. **Focus:**
   - One circle behind the planet (no double circle).
   - The value is true italic Figtree SemiBold on Android (not slanted Regular), e.g. "Healing · Compassion".
   - The button is 145 × 36 with Inter SemiBold 13.
8. **Recently Played:**
   - Profile cards are 300 × 120, with 20 gaps, capitalized 16 pt titles, 12 pt meta, and a 1 pt yellow progress line with no track.
   - The arrow is a 24 pt stroke icon and still opens `/recently-played`.
   - The empty state text still shows when there are no sessions.
9. **Home unchanged:** Home's "Your practice today" cards look exactly as before (310 wide, 17 pt title, 2 pt progress with track).
10. **Menu:**
    - Five rows of 44 tall, radius 5, `#E5E5EA`, 8 apart, 25 pt icons, 16 pt `#636366` labels.
    - Each row still opens its target (Saved, feedback forms, contact form).
11. **Follow:**
    - Icons are 42 / 42 / 40 × 42, 19 apart, 12 under the title, not clipped or overflowing.
    - Taps are still no-ops.
12. **Dev pill:**
    - In a release build (or `npx expo start --no-dev`) there is no Test Buttons pill.
    - In dev it appears below Follow OmMind and still opens its popup.
13. **Cross-platform consistency:** at default font settings, screenshots on the iPhone 16 and the Pixel 8 differ only in fluid widths (menu rows, dividers, stats spacing). Font faces, sizes, card sizes, gaps and icon sizes are identical, and text sits at the same vertical position inside rows and buttons.
14. **Font scaling:** at the largest standard (non-accessibility) system font size, no text is clipped and the stat cards and menu rows keep their layout.
15. **Behaviour unchanged:** photo upload, profile details edit, focus change, report bug, suggest improvement, contact us, Saved, the Recently Played arrow and session cards all work as before.
16. **Accessibility:**
    - VoiceOver / TalkBack read the avatar ("Change profile photo, button") and the name row ("Edit profile details, button").
    - Each stat card is read as one element ("Total Meditation Time, 10 Hours").
    - Menu rows are read as buttons.
    - Dividers and badges aren't focusable.
17. **Lint and types:**
    - `npx expo lint` and `npx tsc --noEmit` report no new errors compared with the baseline.
    - There is no `console.log` in `profile.tsx`.

## Test Matrix

| Platform | Device | Width | Mode | Check |
| --- | --- | --- | --- | --- |
| iOS | iPhone SE (3rd gen) | 375 | compact | top inset (20), stat overflow values, no clipping |
| iOS | iPhone 13 mini | 375 | compact | notch inset, same as SE |
| iOS | iPhone 16 | 393 | regular | **pixel overlay vs Figma frame** |
| iOS | iPhone 16 Pro Max | 440 | regular | cards stay 110 with wider gaps, rows fill to 23 gutter |
| Android | small 360 × 640 dp emulator | 360 | compact | no horizontal overflow, Afacad loads, stat numbers fit |
| Android | Galaxy S2x (384 dp) | 384 | compact | punch-hole status bar inset |
| Android | Pixel 8, gesture nav | 412 | regular | same look as iPhone 16, true italic focus text |
| Android | Pixel 8, 3-button nav | 412 | regular | Follow icons fully above the tab bar when scrolled to the end |

On each device:

- Open Profile cold, with the splash screen holding until the fonts load. Then pull to the top and scroll to the bottom.
- Check the stats with real values, then temporarily with "12.5" hours and "100" sessions.
- Check a user with no focus ("No focus selected"), one focus, and three focuses.
- Check Recently Played with 0, 1 and 5+ sessions, and tap a card and the arrow.
- Upload a profile photo and check the ring.
- Edit the name to a 40-character name.
- Open each menu row and come back.
- Repeat with the system font size at its largest standard setting.
- Compare Home's "Your practice today" cards before and after (they must not change).

## Files Summary

- **Edit:**
  - `app/(tabs)/profile.tsx`: all JSX and styles listed above, `PROFILE_UI` tokens, safe-area / window hooks, copy tweaks, log removal.
  - `comp/meditation_session/MeditationSessionCard.tsx`: additive `variant` prop + `profileStyles` (default unchanged).
  - `app/_layout.tsx`: load `Afacad_400Regular` and `Afacad_700Bold` (additive).
  - `theme.js`: `FONTS.afacadRegular` and `FONTS.afacadBold` (additive).
  - `package.json` / lockfile: `@expo-google-fonts/afacad` via `npx expo install`.
- **No change:** `comp/home/GradientDivider.tsx`, `development_testing/comp/TestButtons.tsx`, all modals and profile forms, `app/(tabs)/_layout.tsx`, `comp/navigation/**`, `assets/**`, `constants/colors.ts`, `api/**`
