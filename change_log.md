# Change Log

## 2026-07-17

### Frontend Homepage Aggregation

- Added `getHomepageInfo` API support and route typing for the new `get_homepage_info` backend route.
- Extended `HomePageInfoSlice` to cache daily mood, mood check-in, intention/affirmation, homepage text, recommended session, and fetch timestamps.
- Refactored the home tab to use one serialized homepage info request, validate cached data first, and avoid concurrent homepage backend calls.
- Replaced the mood submit chain with a single `getHomepageInfo({ mood })` request that caches the returned homepage data.
- Updated session playback to refresh cached homepage text from the accessed session title and clear cached recommendations after meaningful session access or progress.
