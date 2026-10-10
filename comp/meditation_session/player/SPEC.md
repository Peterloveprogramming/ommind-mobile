# Session Player Spec

Read this file before changing session-player behavior.

## Structure

- `comp/meditation_session/SessionPlayer.tsx` is the route entrypoint for `/meditation_session/player`.
- `sessionPlayerParams.ts` parses route params once and returns either `kind: "generated"` or `kind: "course"`.
- `GeneratedSessionPlayer.tsx` owns generated meditation playback.
- `CourseSessionPlayer.tsx` owns normal course playback.
- Shared UI/hooks live beside the player components only when they reduce duplication.

## UI

- Design source: Figma `37GSSpgSU44KPNvLuVKAOw` nodes `2546:9671` (playing) and `2546:9728` (paused).
- The route hides the native header (`app/_layout.tsx`); `PlayerScaffold` in `sessionPlayerShared.tsx` draws the blurred background, close/share bar and artwork for both players, using safe-area insets so iOS and Android match.
- Artwork scales with screen width (37px gutters) and shrinks to the remaining height on short screens; keep fixed pixel offsets out of the layout.
- Close saves progress and dismisses to explore. Share is visual only for now.
- The large timer shows remaining time; the progress row shows elapsed and `-remaining`.
- Icons come from Figma as SVG components in `assets/svg/meditation_session/`; the loop glyph is the Figma PNG `assets/images/meditation_session/loop.png`.

## Route Compatibility

- Do not change the route path: `/meditation_session/player`.
- Do not rename existing params or navigation callers.
- Keep generated detection compatible with both `is_generated` and the existing typo alias `is_genrated`.
- Normalize Expo Router string-array params in `sessionPlayerParams.ts`, not in the player components.

## Course Playback

- Course sessions call `get_audio_url` through `useMeditationAudio`.
- The backend returns presigned S3 URLs in `data.audio[0]` and `data.bgm[0]`.
- `CourseSessionPlayer` gives those URLs to `expo-audio` players and also explicitly calls `replace({ uri })` when URLs are ready.
- Initial autoplay must not wait for `isLoaded`; remote URLs can stay unloaded until `play()` is called.
- Progress saving, recently accessed updates, resume prompt, seeking, BGM toggle, playlist skip, and completion/advance behavior belong to the course player.

## Generated Playback

- Generated sessions use `message_id`.
- `GeneratedSessionPlayer` fetches chat message content with `get_chat_message_content_by_id`.
- It sends that content to `useWebsocketHexPcmAudio` for websocket PCM/TTS playback.
- Generated sessions intentionally do not use the course URL/BGM/progress path.
- Dispose websocket audio on leave or when the generated message changes.

## Telemetry

- Keep course audio telemetry implementation in `utils/courseSessionTelemetry.ts`.
- Do not send full presigned S3 URLs, query strings, or signatures to Sentry.
- Use sanitized URL fields from `sanitizeCourseAudioUrl`.
- Course audio events should keep the `course_session_audio` Sentry category and `course_session_player` context.
- Important debug events include `audio_urls_ready`, `audio_url_probe_finished`, `autoplay_play_called`, `audio_player_status_changed`, and `playback_not_started_10s_after_urls_ready`.

## Edit Checklist

- Preserve visible UI and behavior unless the change is intentionally requested.
- Keep generated and course logic separated.
- Run targeted lint for the touched player/telemetry files.
- If changing behavior, manually verify both course and generated entrypoints in the app.
