# Dream Journal Entry — Figma Redesign + New Optional Details

## Goal

Rebuild the dream journal write/edit screen (`app/journal/write.tsx`, dream branch only) to match Figma as closely as possible, add the four optional dream details that Figma has and the app does not, persist them in the backend `dream_logs` table, and feed them into the dream workflow so the orchestrator's dream analysis receives them.

Every dream detail stays optional. A dream with only text must save and analyze exactly as today.

The screen must look and behave the same on iOS and Android and hold up on common phone sizes (iPhone SE 375×667 up to Pro Max 430×932; Android 360×640 up to ~412×915).

## Figma Reference

File: `37GSSpgSU44KPNvLuVKAOw` (OmMind Copy, page "Design System", section "Lhamo").

| Node | What it shows |
| --- | --- |
| `3128:9986` | **Primary target.** Details panel fully expanded, all 9 groups, ⌃ collapse caret at the bottom, "Show reflection prompts" pill |
| `2631:10316` | New entry with the keyboard open, details panel **collapsed** (single row + ⌄ on the right) |
| `2631:10494` | Reflection prompts card open ("Reflection prompts" + 4 bullets + "Hide reflection prompts") |
| `3103:11183` | Older 4-group version. **Ignore** (see decisions) |

Use `get_design_context` / `download_assets` on these nodes at implementation time for exact values and assets. The style tables below were taken from them.

## Decisions (confirmed with the user)

1. **Saving: autosave on back.** No Save/Update button. Leaving the screen (header back, Android hardware back, iOS swipe-back) saves the dream (create or update) when the text is non-empty and something changed, then returns to the journal list. "Get AI Reflection" also saves first, as it does today. A new entry with empty text is discarded silently.
2. **Delete: confirm, then delete.** Existing entry: confirmation alert → `delete_dream_log` → back to the list. New entry that was never saved: Delete discards the draft and goes back with no API call (keep the same confirmation alert for consistency).
3. **Remove the "Other" chip** and its 50-char free-text input from every chip group, to match Figma. Stored legacy values that match no chip are preserved (see "Legacy values").
4. **Dream only.** The awareness journal keeps today's layout (Back + Save, bulb instructions). Do not change awareness behaviour.
5. **Panel has two states: collapsed / expanded.** `3103:11183` is an older design. A new entry starts **collapsed**. Editing an entry that already has at least one stored detail opens **expanded**.
6. **Keyboard accessory bar** (image + pen icons in the Figma keyboard frames) is **out of scope**. Image attachments and drawing need their own backend and storage. Follow-up only.
7. **Free-text details** (body sensation, health/wellness context): max **256 chars**, no counter. Matches `VARCHAR(256)` and the backend's `MAX_DREAM_DETAIL_CHARS = 256`.

## Current State (what exists today)

### Mobile

- `app/journal/write.tsx` is shared by dream and awareness.
- The dream branch has:
  - a header with Back + `Save`/`Update` text;
  - a bulb icon that toggles writing instructions;
  - the text input;
  - a details card with 5 chip groups, each with an extra `Other` chip + 50-char text;
  - a full-width yellow `Analyze Dream` button at the bottom.
- 5 detail groups: dream time, waking feeling, recurring dream, recent life connection, stress level. Stress options are `Low / Moderate / High / Not sure`. Figma says **`Medium`**.
- Route params carry the 5 stored details from `app/(tabs)/journal.tsx` (`mapDreamLogToJournalEntry` → `handleEntryPress`).
- `Analyze Dream` saves, then pushes `/chat/new_index` with `dream_analysis_payload = { dreamLogId, dreamJournal }`. The chat screen calls the `analyze_dream` route with `dream_log_id`. **The backend loads the dream text and details from the saved row.** Details are never sent from the client to the chat route.
- Layout problems that hurt cross-device consistency:
  - it uses `SafeAreaView` from `react-native`, which does nothing on Android;
  - the outer safe area has hard-coded `paddingHorizontal: 25, paddingVertical: 50`;
  - the outer padding stacks on an inner `paddingHorizontal: 20`;
  - `KeyboardAvoidingView` comes from `react-native` and uses a magic iOS offset.
- Known bug: after `Analyze Dream` creates a new log, `logId` stays undefined. Coming back from chat and analyzing again (or saving) **creates a duplicate** dream log.
- Font gotcha: `FONTS.figtreeMedium` is actually `Figtree_400Regular`. Figma "Figtree Medium" = `FONTS.figtreeMedium500` (`Figtree_500Medium`).

### Backend (`/Users/zimingyan/PycharmProjects/lhamo`)

- `db/database_migration.py`: `dream_logs` has `dream_time, waking_feeling, recurrence, recent_life_connection, stress_level` (all `VARCHAR(256)`). Migrations are idempotent `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE … ADD COLUMN IF NOT EXISTS` blocks.
- `controllers/database/dream_logs.py`:
  - `DREAM_LOG_SELECT_COLUMNS`, `format_dream_log_row` (positional tuple indexes), `create_dream_log`, `update_dream_log_by_id`.
  - **Bug:** update uses `COALESCE(%s, column)`, so sending `null` never clears a field. Deselecting a chip in the app does not persist.
- `controllers/api/dream_logs.py`:
  - `DREAM_LOG_CONTEXT_FIELDS` has the 5 fields.
  - `DREAM_CONTEXT_ALIASES` **already** lists `sleep_quality`, `season`, `body_sensation_after_waking` (alias `body_sensation`) and `health_or_wellness_context` (aliases `health_context`, `wellness_context`). They are dropped because `_dream_log_context_for_database` only keeps `DREAM_LOG_CONTEXT_FIELDS`.
- `llm/workflows/dream/inputs.py`:
  - `DreamInput` (pydantic, `extra = "forbid"`), `DREAM_DETAIL_FIELDS`, `DREAM_DETAIL_LABELS`, `to_prompt_text()`.
  - `NOT_PROVIDED_VALUES` (`"not sure"` etc.) are normalised to `None`.
  - Values are truncated to 256 chars.
- `services/dream_analysis.py`: `build_dream_analysis_event` builds `DreamInput(**{field: dream_log[field] for field in DREAM_DETAIL_FIELDS})`. Adding fields to `DREAM_DETAIL_FIELDS` and to the row formatter flows them into `workflowSpecificInput` automatically.
- `llm/workflows/dream/prompts.py`: the understanding and guidance prompts name the 5 details explicitly.
- `llm/orchestration/models.py`: `WorkflowSpecificInput = Union[GuidedMeditationInput, DreamInput]`. `GuidedMeditationInput` has required fields, so adding optional fields to `DreamInput` does not create union ambiguity.

## Dream Detail Fields (source of truth)

Store the exact chip label string (current behaviour), e.g. `"Middle of the night"`.

| # | UI title | Type | Options (in order) | API / DB key | Figma icon node | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Dream time | single-select chips | Early night, Middle of the night, Early morning, After 7am, Not sure | `dream_time` | `3128:10026` (14px) | exists |
| 2 | Waking feeling | single-select chips | Pleasant, Unpleasant, Neutral, Mixed, Not sure | `waking_feeling` | `3128:10042` (14px) | exists |
| 3 | Recurring dream? | single-select chips | First time, Recurring, Not sure | `recurrence` | `3128:10058` (14px) | exists |
| 4 | Recent life connection | single-select chips | Work, Relationship, Family, Health, Spiritual practice, Major change, Not sure | `recent_life_connection` | `3128:10070` (13px) | exists |
| 5 | Stress level | single-select chips | Low, **Medium**, High, Not sure | `stress_level` | `3130:10151` (15px) | exists; rename `Moderate` → `Medium` |
| 6 | Sleep quality | single-select chips | Good, Restless, Interrupted, Poor, Not sure | `sleep_quality` | `3130:10111` (13px) | **new** |
| 7 | Season | single-select chips | Spring, Summer, Autumn, Winter, Transition, Not sure | `season` | `3130:10131` (16px, `contain`) | **new** |
| 8 | Body sensation after waking | free text, ≤256 | placeholder: `For example: heavy, light, tense, warm, cold, peaceful, unsettled...` | `body_sensation_after_waking` | `3130:10171` (15px) | **new** |
| 9 | Health or wellness context | free text, ≤256 | placeholder: `Anything you feel is relevant, such as stress, sleep changes, illness, medication, or emotional pressure...` | `health_or_wellness_context` | `3130:10211` (15px) | **new** |

All single-select groups are single choice. Tapping the selected chip deselects it (value → `null`). Recent life connection stays single-select, matching the current model and the single DB column.

## Backend Changes (`/Users/zimingyan/PycharmProjects/lhamo`)

### B1. Migration — `db/database_migration.py`

- Add the 4 columns to the `CREATE TABLE IF NOT EXISTS dream_logs` definition, all `VARCHAR(256)` nullable:
  - `sleep_quality`
  - `season`
  - `body_sensation_after_waking`
  - `health_or_wellness_context`
- Extend the existing `ALTER TABLE dream_logs ADD COLUMN IF NOT EXISTS …` block with the same 4 columns so existing databases pick them up. Additive and nullable: no backfill, no downtime.
- `db/set_up_query.py` `set_up_dream_logs`: add sample values for the 4 new columns (optional, nice for local dev).

### B2. DB controller — `controllers/database/dream_logs.py`

- Append the 4 columns to `DREAM_LOG_SELECT_COLUMNS` **after** `stress_level` and **before** `created_at`, or switch to dict rows. If staying positional, update `format_dream_log_row` indexes and its short-row fallback, and keep `created_at` last.
- `create_dream_log`: accept and insert the 4 new kwargs (default `None`).
- `update_dream_log_by_id` **fix the clear bug**:
  - Build the `SET` clause only from detail keys **present** in the request.
  - Present with a value → set it. Present with `null`/`""` → set `NULL`. Absent → leave the column unchanged.
  - Replace `COALESCE` with a dynamic `SET` list built from a fixed whitelist of column names (never interpolate user input into SQL; values stay `%s` params).
  - `log` is always set.

### B3. API controller — `controllers/api/dream_logs.py`

- Add the 4 keys to `DREAM_LOG_CONTEXT_FIELDS`. The aliases already exist in `DREAM_CONTEXT_ALIASES`.
- Change `_dream_log_context_for_database` (or add a sibling for update) to return **only keys that were present** in the event or `user_context`, under any alias. Present-but-empty maps to `None`.
  - `add_dream_log` can keep passing all fields (missing → `None`).
  - `update_dream_log` must pass only present keys so B2 can tell "clear" from "unchanged". That keeps older app builds, which send only the 5 old keys, from wiping the new columns.
- Enforce the 256-char limit server-side: truncate or reject (> 256 → `400 "<field> must be 256 characters or fewer"`). Prefer **400** so the client knows. The client also enforces `maxLength`.
- Responses (`format_dream_log_row`) include the 4 new keys on every dream-log endpoint (`get_dream_logs`, `get_dream_log`, add, update).

### B4. Dream workflow input — `llm/workflows/dream/inputs.py`

- Add the 4 keys to `DREAM_DETAIL_FIELDS` and `DreamInput` (all `Optional[str] = None`). The validator decorator already uses `*DREAM_DETAIL_FIELDS`.
- Add labels to `DREAM_DETAIL_LABELS`:
  - `sleep_quality` → "Sleep quality"
  - `season` → "Season"
  - `body_sensation_after_waking` → "Body sensation after waking"
  - `health_or_wellness_context` → "Health or wellness context"
- `services/dream_analysis.py` needs no logic change. It iterates `DREAM_DETAIL_FIELDS`, so once B2 returns the new keys they reach `workflowSpecificInput`. Verify the existing "details: …" log line still logs **field names only**, never values. Health text is sensitive.

### B5. Dream prompts — `llm/workflows/dream/prompts.py`

- `DREAM_UNDERSTANDING_SYSTEM_MESSAGE`:
  - extend the "reported details" bullet and the paragraph after it to include sleep quality, season, body sensation after waking and health/wellness context;
  - map them into the existing JSON fields: body sensation → `energy_signals`/`emotions`, sleep quality / health context / season → `life_context`;
  - no new JSON keys (keep `DreamUnderstanding` unchanged).
- `DREAM_GUIDANCE_SYSTEM_MESSAGE`:
  - extend the "dreamer's reported details" list;
  - Season and sleep quality may inform the Tibetan energy reading only when the dream supports it;
  - body sensation is first-person evidence;
  - health/wellness context is context only: **never diagnose, never connect it to illness predictions**. The existing safety rules already cover this; restate it for this field.
- `to_prompt_text()` already renders `Label: value` lines for whatever is provided. No change needed beyond B4.

### B6. Backend tests

Update or add:

- `controllers/database/test_dream_logs.py`, `controllers/api/test_dream_logs.py` (if present):
  - new columns round-trip on create/get/list;
  - update with a key present as `null` clears it;
  - update with a key absent keeps it;
  - > 256 chars → 400.
- `llm/workflows/dream/test_inputs.py`: new fields normalise ("not sure" → `None`, 256 truncation), and appear in `to_prompt_text()` with their labels.
- `services/test_dream_analysis.py`: a row with the new fields produces `workflowSpecificInput` containing them.
- `llm/orchestration/test_models.py`: a dream `workflowSpecificInput` with new keys still parses as `DreamInput`, not as an error.
- `llm/workflows/dream/test_graph.py`, `llm/orchestration/test_orchestrator.py`: still pass.

Run the backend test suite the same way specs 01–08 did (pytest in the lhamo repo).

## Mobile Changes

### M1. Types and requests — `api/dreamLogs/types.ts`, `api/dreamLogs/requests.ts`

- Add `sleep_quality`, `season`, `body_sensation_after_waking`, `health_or_wellness_context` (all `string | null` optional) to `DreamLogContextInput` and `DreamLogItem`.
- `requests.ts` already spreads `...dreamContext`, so no change is needed. The write screen must always send all 9 keys (explicit `null` when unset) so the backend can clear values (B2/B3).

### M2. Journal list — `app/(tabs)/journal.tsx`

- `JournalEntry` + `mapDreamLogToJournalEntry`: carry the 4 new fields.
- `handleEntryPress`: pass them as route params (`sleepQuality`, `season`, `bodySensationAfterWaking`, `healthOrWellnessContext`), same pattern as the existing 5.
- After returning from the write screen, the list must refetch (it already does on focus; verify autosaved edits show).

### M3. Write screen — dream branch of `app/journal/write.tsx`

Keep the awareness branch's behaviour and look unchanged. Split the dream UI into a component if `write.tsx` becomes unwieldy, e.g. `comp/journal/DreamJournalEditor.tsx` plus small pieces like `DreamDetailsCard`, `DetailChipGroup` and `ReflectionPromptsFooter`. Follow the existing `StyleSheet` + `FONTS`/`COLORS` conventions.

#### Data/config

- Replace `DREAM_DETAIL_SECTIONS` with the 9-row table above. Each entry is `{ key, apiKey, title, icon, kind: "chips" | "text", options?, placeholder? }`. The icon size comes from the table.
- Remove `DREAM_DETAIL_OTHER_OPTION`, `DREAM_DETAIL_OTHER_CHARACTER_LIMIT`, `otherDreamDetails` state, the `getInitialDreamDetailOtherText*` helpers and the `Other` input UI.
- Free-text limit constant: `DREAM_DETAIL_TEXT_MAX_LENGTH = 256`.

#### Legacy values

Stored values may not match a chip: older "Other" text, `Moderate`, or lowercase seed values like `"medium"`.

- Chip selected ⇔ the stored value equals the option **case-insensitively**. Map legacy `Moderate` → `Medium` for selection.
- If a stored value matches no chip, show no chip selected, and keep the raw stored value in state. On save, if the user has **not touched** that group, send the original value back unchanged. If they tap a chip, send the chip label. Nothing is silently lost.

#### State

- `entryText`; `details: Record<DreamDetailKey, string | null>`; `touchedDetailKeys: Set<DreamDetailKey>`; `isDetailsExpanded`; `arePromptsVisible`.
- `savedLogId`: initialised from the `logId` param. Set it from the create response. **Fixes the duplicate-create bug.** Every later save (back, Get AI Reflection after returning from chat) updates instead of creating.
- `lastSavedSnapshot`: text + details after the last successful save, or the initial params for an existing entry. Used for dirty checking.
- `isEditMode` = `savedLogId` is set.

#### Header (`3128:10002`)

- Row with `justifyContent: "space-between"`, `alignItems: "center"`, height 52, horizontal padding 23.5 (Figma: 347 wide on 394 → use padding, not a fixed width).
- **Back** (left, `3128:10003`):
  - 52×52 grey circle with a left **arrow**, not the chevron in `BackButton`;
  - download the SVG from node `3128:10003` into `assets/svg/journal/` as a `react-native-svg` component, same size on both platforms (unlike `assets/svg/header/Back.tsx`, which changes size per platform);
  - `hitSlop` 12, `accessibilityRole="button"`, `accessibilityLabel="Back"`;
  - action: autosave on back (see Behaviour).
- **Get AI Reflection** (center, `3128:10008`):
  - pill `backgroundColor: COLORS.brandYellow` (#F8C63E), height 36, `borderRadius: 50`, `paddingLeft: 10`, `paddingRight: 15`, gap 5;
  - magic-stick icon 22×22 (download from `3128:10009`; white);
  - text "Get AI Reflection", `FONTS.figtreeSemiBold` 15 / lineHeight 20, `letterSpacing: -0.24`, white;
  - disabled (opacity 0.45) when trimmed text is empty or a save/analyze is in flight;
  - shows a white `ActivityIndicator` in place of the icon while analyzing;
  - action: existing `handleAnalyzeDream` flow (save → push `/chat/new_index` with `dream_analysis_payload`), using `savedLogId`.
- **Delete** (right, `3128:10016`): text "Delete", `FONTS.interSemiBold` 16 / lineHeight 21, `letterSpacing: -0.32`, color `#8E8E93`; `hitSlop` 12. Action: see Behaviour.
- On narrow screens (≤360pt wide), the three items must not overlap. Header content is ~52 + 166 + 49 = 267pt, so it fits at 360 − 47 = 313pt. Do not shrink the pill. Set `numberOfLines={1}` on the pill text.

#### Title + input (`3128:9991`)

- Horizontal padding 23. Header bottom → title: 20.
- Title: `FONTS.figtreeMedium500` 16 / 20, `letterSpacing: -0.24`, `#000000`.
  - New entry: `Dream on {Month D, YYYY}`. **Figma uses the US order "July 7, 2025"**, so switch `formatEntryDate` to `Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })` for the dream branch.
  - Existing entry: keep today's title param (first 4 words, matches `2631:10494`).
- Gap title → input: 10.
- Input:
  - multiline, auto-growing (`scrollEnabled={false}`; the page `ScrollView` scrolls);
  - `FONTS.figtreeMedium500` 14 / lineHeight 20, `letterSpacing: -0.24`, text color `#8C8C8A`, placeholder color `#8C8C8A`;
  - placeholder "Describe your dream as you remember it...";
  - `cursorColor` / `selectionColor` = `COLORS.brandYellow` (Figma's yellow caret);
  - `padding: 0`, `minHeight: 26`;
  - `autoFocus` only for new entries;
  - Android: `textAlignVertical="top"`, `includeFontPadding={false}`.
- Input → details card: 37.

#### Optional details card

Shared card style:

- `marginHorizontal: 20`, `backgroundColor: "#FFFFFF"`, `borderWidth: 1`, `borderColor: "rgba(143,143,143,0.34)"`, `borderRadius: 10`.
- Width fills the screen minus margins. Never fixed widths. Figma's 334/351/325 values are for a 394 frame.

**Collapsed** (`2631:10316` → `3079:10391`):

- The whole row is one pressable, height 40, `paddingHorizontal: 10`.
- Left: "✨" (15) + two spaces + "Optional details for a deeper reading" (`FONTS.figtreeMedium500` 14 / 20, `letterSpacing: -0.24`, black).
- Right: chevron-down 9×5 (download `3079:10389`), 20 from the right edge, vertically centred.
- `accessibilityRole="button"`, `accessibilityState={{ expanded: false }}`.

**Expanded** (`3128:10018`):

- Content inset 7 left/right, 9 top. Vertical gap 10 between header row and groups.
- Header row is the same text as collapsed with no right chevron. Tapping it also collapses.
- Each chip group (`3128:10023`):
  - wrapper `paddingVertical: 3`; inner gap 6 between group header and chips.
  - Group header: row, `paddingHorizontal: 7`, gap 8 (Season: 5), icon at the size in the table (`resizeMode` `cover`, Season `contain`), title `FONTS.figtreeMedium500` 15 / 20, `letterSpacing: -0.24`, black.
  - Chips container: `flexDirection: "row"`, `flexWrap: "wrap"`, `rowGap: 5`, `columnGap: 6`, `paddingHorizontal: 5`. No fixed container height; let it wrap naturally.
  - Chip: `height: 27`, `paddingHorizontal: 9`, `justifyContent/alignItems: "center"`, `backgroundColor: "#FAFAFA"`, `borderWidth: 0.5`, `borderColor: "#ECE0D7"`, `borderRadius: 5`. On Android, check that 0.5 borders render. If they vanish on low-density devices, use `StyleSheet.hairlineWidth`.
  - Chip text: `FONTS.figtreeMedium500` 14 / 20, `letterSpacing: -0.24`. **Unselected `#757575`, selected `#000000`.** Figma changes only the text colour on selection; background and border stay the same. Implement exactly that.
  - `accessibilityRole="button"`, `accessibilityState={{ selected }}`, `numberOfLines={1}`.
- Free-text group (`3130:10169`, `3130:10209`):
  - same group header;
  - input box `marginHorizontal: 5`, `minHeight: 47`, `paddingHorizontal: 9`, `paddingVertical: 4`, same bg/border/radius as a chip;
  - text `FONTS.figtreeMedium500` 14 / 20, `letterSpacing: -0.24`, typed text `#000000`, placeholder `#757575`;
  - multiline, auto-grows, `maxLength={256}`, `textAlignVertical="top"`, no counter.
- Group order and spacing: groups 1–3 separated by 10; groups 4–9 inside one column with gap 10. Visually it's a uniform 10 + 2×3 padding between groups, so a single 16 gap is acceptable.
- Collapse caret (`3130:10217`): full-width pressable row, height ~15 plus hit slop. Chevron-up 9×5 centred (download from that node). 5 above it, 15 below to the card edge. `accessibilityLabel="Collapse optional dream details"`.

**Initial state:** new entry → collapsed. Existing entry with ≥1 stored detail (any of the 9 non-empty) → expanded. Otherwise collapsed.

#### Reflection prompts (footer)

Replace the top-right bulb button for the dream branch.

- Pinned footer above the keyboard and above the bottom safe-area inset. Centred horizontally. Not inside the scroll content. Matches `2631:10316`, where it sits just above the keyboard, and `3128:9986`, where it's at the bottom.
- Give the `ScrollView` `contentContainerStyle.paddingBottom` = footer height (measure with `onLayout`) + 16 so the last group is never hidden behind it.
- **Pill** (`3128:9996`), shown when prompts are hidden:
  - height 36, `borderRadius: 50`, `backgroundColor: "#EEEEEE"`, `borderWidth: 1`, `borderColor: "rgba(143,143,143,0.34)"`, `paddingLeft: 10`, `paddingRight: 15`, gap 5;
  - bulb icon 22×22 at `opacity: 0.84` (download from `3128:9998`; compare with the existing `magic_bulb.png` and reuse it if identical);
  - text "Show reflection prompts", `FONTS.figtreeSemiBold` 15 / 20, `letterSpacing: -0.24`, `#757575`.
- **Card** (`2631:10529`), shown when prompts are visible; replaces the pill:
  - `marginHorizontal: 23`, white, border `rgba(143,143,143,0.34)` 1, radius 10, `paddingTop: 15`, `paddingBottom: 10`, `paddingHorizontal: 10`, gap 5;
  - header: bulb 22 + "Reflection prompts" (`FONTS.figtreeSemiBold` 15 / 20, `#757575`);
  - 4 bullets, each a row with `paddingHorizontal: 8`, gap 5: a 5×5 dot (download `2631:10687`; brand yellow in the render) + text `FONTS.figtreeMedium500` 13 / 20, `letterSpacing: -0.24`, `#8C8C8A`, wrapping. Reuse `DREAM_INSTRUCTIONS` (same 4 strings as Figma);
  - centred "Hide reflection prompts" pill: same style as the Show pill but no icon, `paddingHorizontal: 15`.
- With the keyboard open, the footer rides above the keyboard (see Platform).

#### Behaviour

**Payload**

`buildDreamLogPayload()` returns `log` = trimmed text + all 9 keys:

- chip groups → selected label, or the legacy raw value if untouched, or `null`;
- text groups → trimmed text or `null`.

**Dirty check**

The payload differs from `lastSavedSnapshot`.

**Autosave on leave**

Triggers: header back, Android hardware back, iOS swipe-back.

- Use the expo-router / react-navigation `beforeRemove` listener (`navigation.addListener("beforeRemove", …)` or `usePreventRemove`) so **every** exit path is covered. Keep a ref flag so the listener lets programmatic navigation through (after save, after delete, or into chat via `router.push`, which doesn't remove the screen anyway).
- Text empty and new entry → leave without saving.
- Text empty and existing entry → don't save; leave. Never send an empty `log`; the backend rejects it. Optionally toast "Dream text can't be empty — changes not saved".
- Not dirty → leave.
- Dirty → prevent removal, save (create or update by `savedLogId`), then on success toast "Dream log saved" / "Dream log updated" and navigate as today (`router.replace("/journal", { activeTab: "dreams" })`).
- On failure: stay on the screen (existing hook error toast) so the user doesn't lose text.
- Guard against double-trigger while a save is in flight.

**Get AI Reflection**

As today:

- validate the text;
- save (update when `savedLogId` is set, otherwise create, and store the new id plus snapshot);
- push the chat with `dreamLogId`;
- coming back from chat with no changes does not re-save (not dirty).

**Delete**

`Alert.alert("Delete dream?", "This can't be undone.", [Cancel, Delete (destructive)])`, then:

- `savedLogId` set: call `deleteDreamLog({ dream_log_id: savedLogId })` from `useDreamLogs()` (exposed as `deleteDreamLog: removeDreamLog`; check whether it already toasts, so you don't show a double toast). On success, toast "Dream log deleted" and navigate to the list without autosave (set the bypass flag). On failure stay.
- not saved yet: navigate back without saving.

**Remove**

- the `Save`/`Update` header text (dream branch);
- the bottom `Analyze Dream` button;
- the top-right bulb button (dream branch);
- all "Other" handling.

### M4. Platform and screen-size consistency

- Use `SafeAreaView` (or `useSafeAreaInsets`) from `react-native-safe-area-context` (already used by journal tab, chat, profile) for the dream branch, with top and bottom edges. Remove the hard-coded `paddingHorizontal: 25, paddingVertical: 50`. All horizontal spacing comes from the Figma values above.
- Keyboard: use `react-native-keyboard-controller` (`KeyboardProvider` is mounted in `app/_layout.tsx`; `ProfileFormScreen` uses `KeyboardAwareScrollView`).
  - `KeyboardAwareScrollView` keeps a focused free-text field at the bottom of the card visible.
  - `KeyboardStickyView` or `KeyboardAvoidingView` from keyboard-controller keeps the footer pill above the keyboard.
  - Same behaviour on both platforms. No `Platform.OS` offsets.
- Always use the `ScrollView` for the dream branch (`keyboardShouldPersistTaps="handled"`, no vertical indicator).
- Fonts: always set an explicit `lineHeight`. Use `includeFontPadding: false` on Android `Text`/`TextInput` in this screen so 20/27 heights match iOS.
- Dynamic type: allow scaling but cap `maxFontSizeMultiplier={1.3}` on chips, pills and header so chips wrap rather than overflow. Body input and free text may scale freely.
- No absolute positioning except the footer container. No fixed widths derived from the 394 frame.
- Status bar: dark content on the `#FAFAFA` background (Figma page background; current screen uses `#FBFBF8` — switch to `#FAFAFA` for the dream branch).
- Touch targets: chips are 27 tall. Add `hitSlop={{ top: 4, bottom: 4 }}` so they don't overlap neighbours. Header controls ≥44.

### M5. Assets to add

Download with `download_assets` (keep root SVG sizes) into `assets/images/journal/`, or `assets/svg/journal/` for vector assets turned into components:

- back arrow button (`3128:10003`);
- magic-stick, white (`3128:10009`);
- reflection bulb (`3128:9998`) if it differs from `magic_bulb.png`;
- chevron down (`3079:10389`) and up (`3130:10217`);
- prompt bullet dot (`2631:10687`);
- new group icons:
  - `sleep_quality` (`3130:10111`);
  - `season` (`3130:10131`);
  - `body_sensation` (`3130:10171`);
  - `health_context` (`3130:10211`).

Compare the 5 existing group icons (`dream_time.png`, `waking_feeling.png`, `recurring_dream.png`, `recent_life_connection.png`, `stress_level.png`) with Figma nodes `3128:10026 / 10042 / 10058 / 10070`, `3130:10151`. Replace any that differ. No references to temporary Figma URLs may remain in code.

## Out of Scope

- Awareness journal UI changes.
- Keyboard accessory toolbar (image / pen icons).
- Multi-select for any group.
- Showing dream details in the chat transcript. The chat's first human bubble stays `Analyze the dream journal below --- text ---` (spec 01). Details reach the model via `workflowSpecificInput` only.
- Changing `analyze_dream` request shape. The client still sends only `dream_log_id`.
- Editable dream titles.

## Edge Cases

- New entry, select details, no text, back → nothing saved (no orphan row).
- Existing entry, deselect a chip, back → that column becomes `NULL` in the DB (B2 fix). Verify via `get_dream_log`.
- Existing entry with legacy `stress_level = "Moderate"` → "Medium" chip shows selected; on save without touching, sends the original value; tapping Medium sends `"Medium"`.
- Existing entry with a legacy "Other" value (e.g. `"Exams"`) → no chip selected; value preserved unless the user picks a chip.
- New entry → Get AI Reflection → back from chat → edit text → back → **updates** the same log (no duplicate).
- Older app build (5 keys only) updating a dream that has new-column values → new columns unchanged (B3 present-key semantics).
- Free text pasted > 256 chars → client truncates via `maxLength`; server enforces too.
- `"Not sure"` is stored as-is but dropped by `DreamInput` normalisation before the prompt (existing behaviour, applies to the new chip groups too).
- Save fails on back → stay on screen, text intact.
- Android hardware back while the keyboard is open → first press dismisses the keyboard (OS default), second triggers autosave.

## Acceptance Criteria

- The dream entry screen matches Figma `3128:9986` (expanded), `2631:10316` (collapsed) and `2631:10494` (prompts open) on iPhone 15 and a Pixel-class Android: spacing, colours, fonts, chip states, header layout.
- Nothing overlaps or clips on 360pt-wide Android, iPhone SE (375×667) or Pro Max (430×932). Chips wrap; the footer never hides content or the input.
- All 9 detail groups render, are optional, and persist to `dream_logs` (4 new columns) on autosave and on Get AI Reflection.
- Deselecting a detail persists as `NULL`.
- Reopening an entry shows all stored details (list → write params).
- No Save/Update button and no Analyze Dream button. Back autosaves, Delete confirms and deletes, Get AI Reflection saves and opens the analysis chat.
- No "Other" chips anywhere.
- No duplicate dream logs from repeated Get AI Reflection / back sequences.
- The orchestrator's dream workflow receives the new fields: `workflowSpecificInput` in `chat_jobs.request_payload` contains them, and the understanding/guidance prompts show them under "Dreamer's reported details".
- Awareness journal looks and behaves exactly as before.
- `npm run lint` passes; backend tests pass.

## Verification

Mobile:

```sh
npm run lint
```

Manual, on one iOS simulator and one Android emulator (plus a small-screen device or emulator):

1. New dream: details collapsed; type text; expand; select one chip in every chip group and fill both text fields; back → list shows the entry.
2. Reopen: panel expanded, every value shown; deselect two chips, clear one text field; back; reopen → those three are empty.
3. Show/Hide reflection prompts; open the keyboard → footer stays above it; focus the bottom free-text field → still visible.
4. Get AI Reflection → chat opens and the analysis arrives; back → back again → only one dream log exists.
5. Delete an existing entry (confirm) → gone from the list. New entry → Delete → nothing created.
6. Android hardware back and iOS swipe-back both autosave.

Backend:

- Run the migration against local/staging DB; `\d dream_logs` shows the 4 new columns.
- Pytest suite (B6) passes.
- Trigger an analysis for a dream with new fields set. Check `chat_jobs.request_payload.workflowSpecificInput` includes them, and the LLM trace for the understanding layer shows them in "Dreamer's reported details".

## Deploy Order

1. Backend first. The migration is additive and nullable. Code is backward compatible: old app builds send 5 keys, absent keys are untouched.
2. Then ship the mobile build. A new app build talking to the old backend would have its 4 new keys silently dropped, so do not release the app before the backend is live.
