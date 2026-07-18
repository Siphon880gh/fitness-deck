---
name: add-exercise-media
description: >-
  Sync open-source exercise GIFs/images for one Fitness Deck page or all pages.
  Checks exercise-media-index.json (md sha + exercise name snapshot) and only
  updates pages that need new image matches. Use when adding/refreshing exercise
  media, after md-file edits, or when asked to sync one page vs all pages.
---

# Add exercise media

## User prompt (verbatim)

Add exercise images or animations to one exercise page.
Use media from open-source exercise libraries such as:
Kaggle Fitness Exercises Dataset: https://www.kaggle.com/datasets/exercisedb/fitness-exercises-dataset/data
ExerciseDB OSS API: https://oss.exercisedb.dev/docs
Exercises Dataset on GitHub: https://github.com/anil-g11h/exercises-dataset
wger exercise database: https://wger.de (per-image CC BY, CC BY-SA, or CC0 licensing)
Other similar open-source exercise image or animation libraries

At the bottom of the exercise page, add a Credits link that opens a modal showing the appropriate source and licensing attribution.

Example attribution:
“Exercise animations provided by ExerciseDB / Fitness Exercises Dataset. Additional exercise images provided by wger under each image’s listed Creative Commons license.”

Only add a catalog after reviewing the media rights, not merely the repository's
code license. Do not use datasets whose maintainers cannot establish the media
provenance, or whose terms prohibit this project's intended use. Preserve
per-image author and license metadata when a source provides it.

## Scope: one page or all pages

This skill supports both modes. Prefer the smallest scope that matches the user:

| User intent | What to run |
|-------------|-------------|
| One page (e.g. “Chest”, “Stretch/Hips”) | `--page "Folder/File"` (optional `--check` first for that page) |
| All exercise pages / “make sure everything has images” | `--check`, then sync **without** `--page` |
| Rematch from scratch | add `--force` (one page or all) |

**Internal state:** `assets/data/exercise-media-index.json` records each page’s markdown `mdSha256` and `exerciseNames` from the last sync. A normal sync (no `--force`) **skips pages that are already up to date** and only fetches/matches for pages that need it:

- never synced, or
- markdown content hash changed, or
- new exercise row names appeared since last sync

Permanently unmatched names alone do **not** mark a page stale.

## When to run

- User asks to add images/animations to **one** exercise page → use `--page`
- User asks to cover **all** pages / refresh media globally → all-pages sync
- User edited `md-file/**/*.md` → `--check`, then sync (page or all as appropriate)
- Before shipping: `--check` (exit `0` = nothing to do)

## Local sync

From the repo root:

```bash
# --- All pages: see what needs updating (reads index state) ---
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check

# --- All pages: sync only stale/new (skips up-to-date pages) ---
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py

# --- One page: check ---
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check --page "Bodybuilding - Minimum Equipment/Back"

# --- One page: sync if needed ---
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Back"

# --- Force rematch (ignores “already up to date”) ---
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force --page "Stretch/Hips"
```

`--check` exit code `0` = no rerun needed; `1` = at least one selected page is stale.
When the user asks to search newly available sources even though pages are
unchanged, use all-pages `--force`; the index intentionally cannot detect
changes in remote catalogs.

### Tracking details

Index fields per page: `mdSha256`, `mdMtimeMs`, `exerciseNames`, `manifest`, `matchedCount`, `unmatchedCount`, `lastSyncedAt`.

On sync for a page that needs work:

1. Fetch the ExerciseDB-derived animation catalog and wger's Creative Commons image catalog
2. Parse exercise names from the markdown table
3. Keep existing `byExercise` mappings for names still present
4. Match only **new** names (unless `--force`)
5. Drop mappings for removed names
6. Rewrite that page’s manifest + update the index

All-pages mode discovers every `md-file/**/*.md` except `.up.md`.

Frontend loads media via the index (`pages[pageKey].manifest`). Credits UI is already implemented (Credits link → modal).

## Agent checklist

1. Decide **one page** vs **all pages** from the user request.
2. Run `--check` (same scope) when unsure whether work is needed.
3. Run sync **without** `--force` unless the user wants a full rematch.
4. Optional: add/adjust `PAGE_FILTERS` / `manual` aliases in the script for better match quality; pages without a filter still sync via defaults. Use `manual: { "Name": None }` to force-unmatch when the catalogs have no acceptable demo (prefer no media over a wrong stretch GIF).
5. Do not vendor GIF binaries; use hosted open-dataset URLs.
6. Keep each mapping's source, source URL, author, license, and license URL fields.
7. Respect non-commercial / attribution terms from ExerciseDB / Gym visual and Creative Commons attribution/share-alike terms from wger images.

## Related docs

- [README-Skill add images to new exercises.md](../../../README-Skill%20add%20images%20to%20new%20exercises.md)
- [AGENTS.md](../../../AGENTS.md)
