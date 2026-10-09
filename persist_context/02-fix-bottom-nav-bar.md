# Fix Bottom Navigation Bar To Match Figma (And Platform Best Practice)

## Goal

Rebuild the tab bar in `app/(tabs)/_layout.tsx` so that:

1. The grey bar background reaches the very bottom edge of the screen, as in Figma. Today it floats above the home indicator / Android nav bar, and screen content shows underneath it.
2. Icons, labels and the Lhamo orb match the Figma geometry and styling.
3. It follows iOS and Android safe-area / edge-to-edge best practice. **Where Figma and best practice disagree, best practice wins.** Each such deviation is listed below.
4. It works the same on every popular phone width (360–440 pt/dp) on both platforms. Tablets are out of scope.

Do not change the bar's behaviour: same 4 tabs, same Lhamo action (opens a new chat), and Profile stays highlighted on the `saved` and `recently-played` routes.

## Figma Source

- Frame: `Explore` — https://www.figma.com/design/TspC5Aw91TShdpYFeKcLIY/OmMind?node-id=2423-9506 (394 × 844)
- Nav group: `Group 6854` (node `2423:9563`)
- Bar background shape: `Subtract` — node `2423:9565`
- Lhamo orb: node `2423:9564`

Measured geometry (frame coordinates, 394 wide, 844 tall):

| Element | Value |
| --- | --- |
| Bar background (`Subtract`) | x 0, y 756.77, 394 × 88. **Bottom = 844.77, so it is flush with the screen bottom.** |
| Bar fill | linear gradient, vertical, `#D7D7D7` @ 0.8 → `#868484` @ 0.6, userSpace y −17.14 → 106.06 |
| Bar effect | background blur 10. **Not implemented**, by product decision (see Decisions). |
| Top corners | circular, radius ≈ 40 (both sides) |
| Center notch | fixed size, centered; 131.6 wide at the top edge, 51.9 deep (exact path below) |
| Tab items | top at y 772, so **15 below bar top**. Each item 55 wide × 54 tall: icon 36 × 36, 5 gap, label 13 tall |
| Left group | Home x 23–78, Explore x 88–143 (gap 10). Explore's inner edge is **54 left of center** |
| Right group | Journal x 252–307, Profile x 317–372 (mirror of left) |
| Labels | Inter Medium (`FONTS.inter`), 12, line height 13, centered, single line |
| Label/icon color | active `#242424`, inactive `#FFFFFF` |
| Lhamo orb | 70 × 70 sphere centered horizontally; top 26.77 **above** bar top; center ≈ 8 **below** bar top |
| Lhamo label | "Lhamo", Inter Medium 12, white, centered under orb, on the same row as the other labels |
| Space below labels | 88 − 15 − 54 = **19** |

Note the Figma frame has no home indicator: its labels sit inside the iPhone home-indicator zone (bottom 34 pt). That is the main thing we deliberately do NOT copy (see Decisions).

## What Is Wrong Today (Review Of Current Implementation)

Files: `app/(tabs)/_layout.tsx`, `assets/svg/BottomNavigationBar.tsx`.

1. **Bar floats above the bottom edge (the visible bug).** The background `View` is placed at `bottom: insets.bottom` with `height: 80`, so on any device with a bottom inset there's a strip of screen content below the bar. Expo SDK 54 forces edge-to-edge on Android, so Android has the same gap above the gesture / 3-button nav area.
2. **Touch targets and visuals come from two unrelated layers.** The React Navigation default tab bar (transparent, `bottom: insets.bottom - 25`, `height: 90`, items `bottom: -10`) is stacked on top of a separately positioned SVG. The two only line up through magic numbers, so they drift apart as `insets.bottom` changes between devices.
3. **Notch distorts on different widths.** The SVG uses a fixed 394 viewBox with `preserveAspectRatio="none"` and `width="100%"`, so the notch and corners stretch horizontally on every width other than 394 (an ellipse instead of a circle cut-out).
4. **The visibility flag hides only half the bar.** `BottomNavVisibilityContext.isVisible === false` hides the SVG background, but the tab icons and labels (the React Navigation tab bar) stay visible.
5. **The Lhamo slot is a hack.** A fake `lhamo` tab with a 0 × 0 item renders the label as an "icon", with a typo ("Llhamo"). The label is not pressable, and the orb lives in a different component, inside the SVG file.
6. **Orb size and position are off.** It's an 80 × 87 box with `bottom: 30`, versus Figma's 70 sphere centered 8 below the bar top.
7. **Magic offsets.** These compensate for layout rather than come from the design: `marginLeft: 4` (journal icon), `marginLeft: 3` (home label), `left: 5` (icon wrapper), `left: 4` (Lhamo label). The SVG icons are already centered in their 37 × 36 viewBox, so none of these are needed.
8. **No accessibility.** There's no `tablist` / `tab` roles, no selected state, and no labels for the Lhamo button.
9. **No keyboard handling.** On Android (`softwareKeyboardLayoutMode: "resize"`), an absolute bar rides up on top of the keyboard on the Profile feedback/contact forms.
10. **Screens guess the bar height.** Content padding is hardcoded and inconsistent: `paddingVertical: 100` (home), `paddingBottom: 24` (explore, where the last row ends up under the bar), `118` (journal), `insets.bottom + 126` (saved, recently-played), `marginBottom: 100` (profile).
11. **`console.log` in render** (`_layout.tsx:51`) fires on every render.

## Decisions (Confirmed With Product Owner)

- **Safe area wins over Figma.** The bar **background** always extends to the physical bottom edge. Its **interactive content** (icons, labels) always sits above the system bottom inset (iOS home indicator, Android gesture / 3-button nav). Bottom padding below labels = `max(insets.bottom, 19)`:
  - No inset (e.g. iPhone SE, some Android): bar is 88 tall, identical to Figma.
  - Face ID iPhones (inset 34): bar is 103 tall, 15 taller than Figma. Expected and intended.
  - Android gesture nav (~16–24 dp): ~88–93. Android 3-button nav (~48 dp): ~117.
- **No background blur.** Use the exact Figma gradient only, with no `expo-blur` or masked-view dependency. The same look on every device matters more than matching the blur.
- **Notch is never stretched.** It's a fixed-size shape centered at `width / 2`; only the flat parts of the bar stretch.
- **JS `Tabs` with a custom `tabBar`, not `NativeTabs`.** Expo recommends `NativeTabs` (`expo-router/unstable-native-tabs`) by default. It can't render the notched shape, the gradient or the Lhamo orb, and its height can't be measured for screen padding, so it doesn't fit this design.
- **Spec lives in** `persist_context/`.

## Implementation

### 0. Dependency

`@react-navigation/bottom-tabs` (7.14.0) is currently only a transitive dependency of `expo-router`. We import from it directly, so declare it using **expo-router's own range** (`^7.4.0`), so Yarn reuses the existing lockfile entry (7.14.0):

```bash
yarn add @react-navigation/bottom-tabs@^7.4.0
yarn why @react-navigation/bottom-tabs   # must show exactly ONE installed version (7.14.0)
```

Do **not** use `npx expo install @react-navigation/bottom-tabs`. The package isn't in Expo SDK 54's `bundledNativeModules`, so that falls back to the latest release (7.20.0+) and installs a second copy next to expo-router's.

There must be a single copy. `BottomTabBarHeightCallbackContext` must be the same module instance that expo-router's `Tabs` uses, or `useBottomTabBarHeight()` will silently return the wrong value.

No other new dependencies.

### 1. New file: `comp/navigation/tabBarMetrics.ts`

All numbers in one place, taken from Figma:

```ts
export const TAB_BAR = {
  CONTENT_TOP_PADDING: 15,     // bar top -> top of icons
  ITEM_WIDTH: 55,
  ITEM_HEIGHT: 54,             // icon 36 + gap 5 + label 13
  ICON_SIZE: 36,
  ICON_LABEL_GAP: 5,
  LABEL_FONT_SIZE: 12,
  LABEL_LINE_HEIGHT: 13,
  MIN_BOTTOM_PADDING: 19,      // Figma space below labels; used when the device inset is smaller
  CORNER_RADIUS: 40,
  CENTER_SLOT_WIDTH: 108,      // 2 x 54: inner tab items never come closer than 54 to center
  SIDE_PADDING_MAX: 23,
  SIDE_PADDING_MIN: 12,
  ORB_SPHERE_SIZE: 70,         // visible sphere diameter in Figma
  ORB_IMAGE_SIZE: 78,          // rinpoche_normal.png has ~12% transparent margin: 70 / 0.88 ≈ 78
  ORB_OVERHANG: 31,            // container space above bar top so the 78 image is never clipped (orb center sits 8 below bar top)
  ACTIVE_COLOR: "#242424",
  INACTIVE_COLOR: "#FFFFFF",
  GRADIENT_TOP: "#D7D7D7",
  GRADIENT_TOP_OPACITY: 0.8,
  GRADIENT_BOTTOM: "#868484",
  GRADIENT_BOTTOM_OPACITY: 0.6,
} as const;

export const getTabBarBottomPadding = (bottomInset: number) =>
  Math.max(bottomInset, TAB_BAR.MIN_BOTTOM_PADDING);

// Height of the grey background (from its top edge to the physical screen bottom)
export const getTabBarBackgroundHeight = (bottomInset: number) =>
  TAB_BAR.CONTENT_TOP_PADDING + TAB_BAR.ITEM_HEIGHT + getTabBarBottomPadding(bottomInset);

// Left/right outer padding: Figma's 23 at >= 394 wide, shrinking (min 12) on narrow phones
export const getTabBarSidePadding = (screenWidth: number) => {
  const sideWidth = (screenWidth - TAB_BAR.CENTER_SLOT_WIDTH) / 2;
  const contentWidth = TAB_BAR.ITEM_WIDTH * 2 + 10; // two items + Figma gap
  return Math.max(TAB_BAR.SIDE_PADDING_MIN, Math.min(TAB_BAR.SIDE_PADDING_MAX, sideWidth - contentWidth));
};
```

Resulting layout per width (left group; right group mirrors it):

| Width | Side padding | Gap between the 2 items |
| --- | --- | --- |
| 360 | 12 | 4 |
| 375 | 13.5 | 10 |
| 390 / 393 | 21 / 22.5 | 10 |
| 394 (Figma) | 23 | 10 (exact match) |
| 402 / 412 | 23 | 14 / 19 |
| 430 / 440 | 23 | 28 / 33 |

### 2. New file: `comp/navigation/TabBarBackground.tsx`

This draws the bar shape with `react-native-svg`, generated from the measured width and height. Do not reuse the static `viewBox` + `preserveAspectRatio="none"` approach.

- Props: `width: number`, `height: number` (= `getTabBarBackgroundHeight(insets.bottom)`).
- Render `<Svg width={width} height={height} pointerEvents="none">` with an explicit numeric width and height and **no** `viewBox` / `preserveAspectRatio`, so 1 unit = 1 pt/dp and nothing distorts.
- Path, with `c = width / 2`, `R = TAB_BAR.CORNER_RADIUS`, `H = height`, `W = width`. These are the Figma notch coordinates, made symmetric around the bowl center:

```ts
const buildTabBarPath = (W: number, H: number) => {
  const c = W / 2;
  const R = TAB_BAR.CORNER_RADIUS;
  return [
    `M0 ${H}`,
    `L0 ${R}`,
    `A${R} ${R} 0 0 1 ${R} 0`,
    `L${c - 65.8} 0`,
    `C${c - 55.4} 0 ${c - 46.5} 7.2 ${c - 44.2} 17.3`,
    `C${c - 39.7} 37.5 ${c - 21.8} 51.9 ${c - 1.1} 51.9`,
    `L${c + 1.1} 51.9`,
    `C${c + 21.8} 51.9 ${c + 39.7} 37.5 ${c + 44.2} 17.3`,
    `C${c + 46.5} 7.2 ${c + 55.4} 0 ${c + 65.8} 0`,
    `L${W - R} 0`,
    `A${R} ${R} 0 0 1 ${W} ${R}`,
    `L${W} ${H}`,
    "Z",
  ].join(" ");
};
```

- Fill: `<LinearGradient id="omTabBarGradient" x1={c} y1={-17.14} x2={c} y2={106.06} gradientUnits="userSpaceOnUse">` with stops `#D7D7D7`/0.8 at offset 0 and `#868484`/0.6 at offset 1. Fixed user-space y values keep the top of the bar identical to Figma. On taller bars the extra bottom area simply holds the end colour.
- Memoize the path string on `[width, height]`.

### 3. New file: `comp/navigation/LhamoTabButton.tsx`

Move the `Rinpoche` component out of `assets/svg/BottomNavigationBar.tsx` and keep its behaviour exactly: the `isNavigating` guard, the 1500 ms reset, the reset on `pathname` change, `navigateToNewChat(router)`, and the dimmed image plus `ActivityIndicator` while navigating.

Changes:

- Use `Pressable` instead of `TouchableOpacity`, with pressed opacity 0.7 to keep the current feel.
- The pressable area is the **whole center column**: orb plus "Lhamo" label. Today the label is not tappable.
- Orb: reuse the existing `images.rinpoche_normal`. It's the same iridescent sphere as the Figma asset, already cut out, so **do not add a new image**. Render it at `ORB_IMAGE_SIZE` × `ORB_IMAGE_SIZE` (78), `resizeMode="contain"`. That makes the visible sphere ≈ 70, matching Figma.
- Position inside the tab bar container (see step 4):
  - Orb image top = 0, centered horizontally. Its center then sits 39 from the container top = 8 below the bar top, as in Figma.
  - "Lhamo" label: same text style as the other labels, `color: TAB_BAR.INACTIVE_COLOR` (always white), placed at the **same vertical position as the other labels**: `ORB_OVERHANG + CONTENT_TOP_PADDING + ICON_SIZE + ICON_LABEL_GAP` from the container top.
- Fix the label text: `"Lhamo"`, not `"Llhamo"`.
- Accessibility: `accessibilityRole="button"`, `accessibilityLabel="Lhamo"`, `accessibilityHint="Starts a new chat with Lhamo"`, `accessibilityState={{ disabled: isNavigating, busy: isNavigating }}`.
- Figma drop shadow on the orb (0 0 5 rgba(0,0,0,0.2)): a shadow on the transparent PNG itself would follow its square box, so put it on a 70 × 70 `View` with `borderRadius: 35`, centered behind the image (same center as the sphere), using `boxShadow: "0 0 5px rgba(0, 0, 0, 0.2)"`. Do not use the legacy `shadow*` / `elevation` props.

### 4. New file: `comp/navigation/AppTabBar.tsx`

This is a custom React Navigation tab bar (`tabBar` prop), the documented way to build a non-standard tab bar. It owns the background, the 4 tabs and the Lhamo button in **one layout tree**, so touch targets and visuals can't drift apart.

```ts
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BottomTabBarHeightCallbackContext } from "@react-navigation/bottom-tabs";
```

Structure:

```
<View                         // root
  pointerEvents="box-none"
  onLayout={e => onHeightChange?.(e.nativeEvent.layout.height)}
  style={{ position: "absolute", left: 0, right: 0, bottom: 0,
           height: ORB_OVERHANG + backgroundHeight }}>
  <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
    <TabBarBackground width={width} height={backgroundHeight} />
  </View>
  <View pointerEvents="box-none"  // content row, starts at the bar top
        accessibilityRole="tablist"
        style={{ position: "absolute", left: 0, right: 0, top: ORB_OVERHANG,
                 paddingTop: CONTENT_TOP_PADDING, flexDirection: "row" }}>
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", paddingLeft: sidePadding }}>
      {Home} {Explore}
    </View>
    <View style={{ width: CENTER_SLOT_WIDTH }} />   // spacer under the orb
    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", paddingRight: sidePadding }}>
      {Journal} {Profile}
    </View>
  </View>
  <LhamoTabButton />  // absolutely positioned, centered, top 0; sibling of the tablist, NOT inside it
</View>
```

`tablist` goes on the content row, not the root, so the Lhamo button (a `button`, not a tab) isn't counted as one of the tabs by VoiceOver.

- `width` from `useWindowDimensions()` (it updates on rotation and split-screen; never use `Dimensions.get` at module scope).
- `insets` come from the `BottomTabBarProps` `insets` prop. That's the same source React Navigation uses, so don't call `useSafeAreaInsets()` separately here.
- `backgroundHeight = getTabBarBackgroundHeight(insets.bottom)`, `sidePadding = getTabBarSidePadding(width)`.
- `onHeightChange = useContext(BottomTabBarHeightCallbackContext)`. Reporting the measured height is what makes `useBottomTabBarHeight()` correct in screens (step 6). The reported height deliberately **includes** `ORB_OVERHANG`, so scroll content always clears the orb.
- The root and content row are `pointerEvents="box-none"`, so taps in the transparent overhang beside the orb reach the screen underneath.

**Tabs config.** Render from a fixed list rather than iterating `state.routes`, because hidden routes exist:

```ts
const TABS = [
  { name: "index",   label: "Home",    Icon: Home },
  { name: "explore", label: "Explore", Icon: Explore },
  { name: "journal", label: "Journal", Icon: Journal },
  { name: "profile", label: "Profile", Icon: Profile },
] as const;
```

Look up each `route` with `state.routes.find(r => r.name === tab.name)`.

**Active state.** `const focusedName = state.routes[state.index].name`. A tab is active when `focusedName === tab.name`. Profile is also active when `focusedName` is `"saved"` or `"recently-played"`. This replaces the current `usePathname()` check.

**Tab item** (`Pressable`, a private component in this file):

- Size `ITEM_WIDTH` × `ITEM_HEIGHT`, `flexShrink: 1`, `alignItems: "center"`. That gives a touch target ≥ 48 × 48 (Android) and ≥ 44 × 44 (iOS). No `hitSlop` needed.
- Icon: render the existing `assets/svg/{Home,Explore,Journal,Profile}` components with `color={active ? ACTIVE_COLOR : INACTIVE_COLOR}` at their native 37 × 36 size. Wrap them in a 36-high, centered box. **No** per-icon margin hacks.
- Label: `fontFamily: FONTS.inter`, `fontSize: 12`, `lineHeight: 13`, `textAlign: "center"`, `numberOfLines={1}`, `maxFontSizeMultiplier={1.2}` (honours large text a little without breaking the fixed bar), `marginTop: ICON_LABEL_GAP`.
- Pressed feedback: opacity 0.7.
- Press handling: the standard React Navigation pattern, so `listeners`/`tabPress` keep working:

```ts
const onPress = () => {
  const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
  if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
};
const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });
```

  `isFocused` here means the route itself is focused (`focusedName === route.name`), not the "Profile is also active on saved" visual rule. Tapping Profile while on `saved` must navigate to `profile`.
- Accessibility: `accessibilityRole="tab"`, `accessibilityState={{ selected: active }}`, `accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel ?? label}`, `testID={\`tab-${tab.name}\`}`.

**Hiding.** Return `null` (render nothing) when either:

- `BottomNavVisibilityContext.isVisible === false`. Now it hides the **whole** bar, fixing bug 4. Keep the context API unchanged.
- The keyboard is visible: `useKeyboardState((s) => s.isVisible)` from `react-native-keyboard-controller`, which is already installed and its `KeyboardProvider` already wraps the app in `app/_layout.tsx`. This replaces React Navigation's `tabBarHideOnKeyboard`, which custom tab bars don't get.

### 5. Update `app/(tabs)/_layout.tsx`

- Pass `tabBar={(props) => <AppTabBar {...props} />}` to `<Tabs>`.
- `screenOptions`: reduce to `{ headerShown: false }`. Remove `tabBarStyle`, `tabBarItemStyle`, `tabBarShowLabel`, `tabBarActiveTintColor`, all `bottom`/`height` magic numbers, the `insets` usage and the `usePathname` logic.
- Remove the `icon()` helper, the absolutely positioned `<BottomNavigationBar>` overlay, the wrapping `<View style={{ flex: 1 }}>`, the `styles` object, and the render-time `console.log`.
- Keep every `Tabs.Screen` (`index`, `explore`, `lhamo`, `journal`, `profile`, `recently-played`, `saved`) so routing and deep links are unchanged.
  - `lhamo`: remove the `tabBarButton`, `tabBarIcon`, `tabBarItemStyle` and `listeners` hacks. Add `href: null`. Keep its header options (`headerShown: true`, `headerTitle: () => <LhamoHeader />`, `headerTitleAlign: "center"`). No code navigates to this route today; leave the screen file alone.
  - The other screens keep their current `title`/`headerShown` options. Delete the `tabBarIcon` options; the custom bar doesn't read them.
- Delete `assets/svg/BottomNavigationBar.tsx`. `_layout.tsx` is its only importer; its orb logic moves to `LhamoTabButton` in step 3.

### 6. Make tab screens clear the bar using the real height

Replace hardcoded bottom spacing with `useBottomTabBarHeight()` from `@react-navigation/bottom-tabs`. It works in any screen inside the `(tabs)` navigator. Use `tabBarHeight + 24` as the bottom padding of the scroll content unless noted below. Don't change top padding or any other spacing (except the Journal Android top note below).

Do **not** add `contentInsetAdjustmentBehavior="automatic"` to these scroll views. On iOS it adds the bottom safe-area inset, which `tabBarHeight` already includes, so the inset would be counted twice.

| File | Current | Change to |
| --- | --- | --- |
| `app/(tabs)/index.tsx` | `contentContainer: { paddingVertical: 100 }` | `paddingTop: 100` in styles; `paddingBottom: tabBarHeight + 24` inline on `contentContainerStyle` |
| `app/(tabs)/explore.tsx` | `verticalContent: { paddingBottom: 24 }` | `paddingBottom: tabBarHeight + 24` (fixes last row hidden under bar) |
| `app/(tabs)/journal.tsx` | `ctaWrap` / `selectionActionsWrap` `paddingBottom: 118`, inside RN core `SafeAreaView` | `paddingBottom: tabBarHeight + 16`. **Also** switch the core `SafeAreaView` (deprecated in RN 0.81, iOS-only) to `SafeAreaView` from `react-native-safe-area-context` with `edges={["top"]}`, so the bottom inset isn't counted twice (the tab bar height already includes it). Expected side effect: on Android, Journal content moves down by the status-bar height (the core `SafeAreaView` did nothing on Android). That's intended, and now matches iOS |
| `app/(tabs)/profile.tsx` | `contentContainer.paddingBottom: 32` + `followSection.marginBottom: 100` | `followSection.marginBottom: 0`; `paddingBottom: tabBarHeight + 24` on `contentContainerStyle` |
| `app/(tabs)/saved.tsx` | `paddingBottom: insets.bottom + 126` | `paddingBottom: tabBarHeight + 24`. Remove `useSafeAreaInsets` if no longer used |
| `app/(tabs)/recently-played.tsx` | `paddingBottom: insets.bottom + 126` | `paddingBottom: tabBarHeight + 24`. Remove `useSafeAreaInsets` if no longer used |
| `comp/profile/ProfileFeedbackForm.tsx` | `contentContainer.paddingBottom: 140` | `paddingBottom: tabBarHeight + 24` inline on `contentContainerStyle`. Leave the inner `formContent.paddingBottom: 120` (a centering offset, not bar clearance) and `minHeight: 760` unchanged |
| `comp/profile/ProfileContactForm.tsx` | `contentContainer.paddingBottom: 140` | `paddingBottom: tabBarHeight + 24` inline on `contentContainerStyle`. Leave `minHeight: 760` unchanged |

The two Profile form components are returned **in place of** the Profile screen content (`profile.tsx`, `if (activeFeedbackForm)` / `if (isContactFormVisible)`), so they render inside the tab navigator. `useBottomTabBarHeight()` works in them directly.

Leave `app/(tabs)/lhamo.tsx` alone; its `setIsVisible` logic keeps working through the context.

## Out Of Scope

- Background blur (decided against).
- iPad / tablet layouts.
- Visual redesign of icons (existing 37 × 36 SVG icons are used as-is; they match Figma).
- Android navigation-bar colour / scrim tweaks (no `expo-navigation-bar`). With SDK 54 edge-to-edge, the system draws its own translucent scrim over 3-button nav, which is acceptable.
- Animating the bar in/out.
- The unused `comp/BottomBar.tsx` stub.

## Acceptance Criteria

1. On every device in the test matrix, the grey bar touches the physical bottom edge. No screen content is visible below it.
2. On devices with a bottom inset, the bottom of every label is at least `insets.bottom` above the screen bottom. Nothing interactive sits in the home-indicator / nav-bar zone.
3. On a device with `insets.bottom = 0` at width 394, the bar is 88 tall, items are at x 23/88/252/317, and the orb is centered with its sphere top 27 above the bar top. That's a pixel match to Figma.
4. The notch is a perfect symmetric cut-out at every width. No stretching or ellipse on 360 or 430 wide.
5. Active tab icon and label are `#242424`; inactive and Lhamo are white. Profile is active on `/profile`, `/saved` and `/recently-played`.
6. Tapping Home/Explore/Journal/Profile switches tabs. Tapping the active tab does nothing new. Tapping the orb **or** the "Lhamo" label opens a new chat once (a double-tap does not open two).
7. Taps in the transparent area beside the orb (above the bar's flat top) reach the screen content below.
8. `setIsVisible(false)` hides the entire bar (icons, labels, orb, background).
9. On Android and iOS, focusing a text input in a tab screen hides the bar; dismissing the keyboard restores it.
10. On every tab screen the last piece of content can be scrolled fully above the bar and orb.
11. VoiceOver / TalkBack read each tab as "Home, tab, selected" (or the platform equivalent; position like "1 of 4" isn't required, since TalkBack doesn't announce it for React Native tabs) and the orb as a "Lhamo" button.
12. `yarn lint` and `npx tsc --noEmit` pass with no new errors. No `console.log` left in the new or changed files.

## Test Matrix

Run on simulators/emulators at minimum. Check the screenshot comparison against the Figma frame on the 394/393-wide device.

| Platform | Device | Width | Bottom inset | Expected bar height |
| --- | --- | --- | --- | --- |
| iOS | iPhone SE (3rd gen) | 375 | 0 | 88 |
| iOS | iPhone 16 / 15 | 393 | 34 | 103 |
| iOS | iPhone 16 Pro Max | 440 | 34 | 103 |
| Android | Pixel 8 (gesture nav) | 412 | ~24 | ~93 |
| Android | Pixel 8 (3-button nav) | 412 | ~48 | ~117 |
| Android | Small phone, e.g. 360-wide Galaxy profile | 360 | gesture | ~88–93 |

On each device, check: home screen (mood check-in grid), explore (last row), journal (CTA button), profile (bottom section), saved and recently-played (from profile), the Lhamo tap, and keyboard focus on any input in a tab screen.

## Files Summary

- **Add:** `comp/navigation/tabBarMetrics.ts`, `comp/navigation/TabBarBackground.tsx`, `comp/navigation/LhamoTabButton.tsx`, `comp/navigation/AppTabBar.tsx`
- **Edit:** `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/(tabs)/journal.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/saved.tsx`, `app/(tabs)/recently-played.tsx`, `comp/profile/ProfileFeedbackForm.tsx`, `comp/profile/ProfileContactForm.tsx`, `package.json` (+ lockfile, via `yarn add @react-navigation/bottom-tabs@^7.4.0`)
- **Delete:** `assets/svg/BottomNavigationBar.tsx`
