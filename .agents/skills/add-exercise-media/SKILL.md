---
name: add-exercise-media
description: >-
  Sync open-source exercise GIFs/images onto Fitness Deck muscle pages using
  ExerciseDB / Kaggle / GitHub datasets. Tracks md-file mtime+sha so new
  exercises get matched without stale manifests. Use when adding exercise
  images/animations, refreshing media after md-file edits, or when the user
  asks about exercise media credits/sync.
---

# Add exercise media

## User prompt (verbatim)

Add exercise images or animations to one exercise page.
Use media from open-source exercise libraries such as:
Kaggle Fitness Exercises Dataset: https://www.kaggle.com/datasets/exercisedb/fitness-exercises-dataset/data
ExerciseDB OSS API: https://oss.exercisedb.dev/docs
Exercises Dataset on GitHub: https://github.com/anil-g11h/exercises-dataset
Other similar open-source exercise image or animation libraries

At the bottom of the exercise page, add a Credits link that opens a modal showing the appropriate source and licensing attribution.

Example attribution:
“Exercise animations provided by ExerciseDB / Fitness Exercises Dataset. Gym visuals via AscendAPI ExerciseDB. Non-commercial use; attribution required.”

## When to run

- User asks to add images/animations to an exercise page
- User edited `md-file/**/*.md` and media may be missing for new rows
- User asks to refresh / re-sync exercise media
- Before shipping after exercise catalog changes: run `--check`

## Local sync (preferred)

From the repo root:

```bash
# Report pages whose markdown changed or have unmatched new exercises
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check

# Sync all configured Bodybuilding muscle pages (incremental: keeps existing matches)
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py

# Sync one page
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Back"

# Rematch everything on selected pages
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
```

### Tracking (anti-stale)

`assets/data/exercise-media-index.json` stores per page:

- `mdMtimeMs` + `mdSha256` of the source markdown
- `manifest` path
- `matchedCount` / `unmatchedCount` / `lastSyncedAt`

On sync:

1. Diff current md mtime/sha vs the index
2. Parse exercise names from the markdown table
3. Keep existing `byExercise` mappings for unchanged names
4. Match only **new** names (unless `--force`)
5. Drop mappings for removed names
6. Rewrite the page manifest + update the index

Frontend loads media via the index (`pages[pageKey].manifest`). Credits UI is already implemented (Credits link → modal).

## Agent checklist

1. Run the sync script (prefer `--check` first if unsure).
2. If adding a **new** muscle page not in `PAGE_FILTERS` inside the script, add a filter config (`body_parts` / `targets` / optional `manual` aliases), then sync that page.
3. Confirm Credits modal still shows attribution after media attaches.
4. Do not vendor thousands of GIF binaries into the repo; use hosted URLs from the open dataset mirrors.
5. Respect non-commercial / attribution terms from ExerciseDB / Gym visual.

## Related docs

- [README-Skill add images to new exercises.md](../../../README-Skill%20add%20images%20to%20new%20exercises.md)
- [AGENTS.md](../../../AGENTS.md)
