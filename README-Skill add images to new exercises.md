# Skill: Add images to new exercises

This document describes the **add-exercise-media** project skill: how to attach open-source exercise animations to Fitness Deck pages without letting manifests go stale when you add rows to markdown tables.

## Skill location

```
.agents/skills/add-exercise-media/
├── SKILL.md
└── scripts/sync_exercise_media.py
```

Ask an agent to follow that skill, or run the sync script yourself locally.

## Why tracking exists

Exercise pages live in `md-file/**/*.md`. Media mappings live in `assets/data/exercise-media-*.json`.

If you **add new exercises** to a markdown table, old manifests do not automatically grow. The sync script compares each page’s markdown **mtime + sha256** (stored in `assets/data/exercise-media-index.json`) and, when the file changed, matches media for **new exercise names only** (existing matches are kept).

## Sources

- [Kaggle Fitness Exercises Dataset](https://www.kaggle.com/datasets/exercisedb/fitness-exercises-dataset/data)
- [ExerciseDB OSS API](https://oss.exercisedb.dev/docs)
- [anil-g11h/exercises-dataset](https://github.com/anil-g11h/exercises-dataset) (GitHub mirror used for GIF/JPG URLs)

Attribution (shown in the in-app **Credits** modal):

> Exercise animations provided by ExerciseDB / Fitness Exercises Dataset. Gym visuals via AscendAPI ExerciseDB. Non-commercial use; attribution required.

## Commands

From the repository root:

```bash
# See which pages are stale / have new unmatched exercises
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check

# Incremental sync for all configured pages
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py

# One page
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Shoulders"

# Rematch all names on configured pages
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
```

## Workflow after editing exercises

1. Edit `md-file/.../SomeMuscle.md` (add/rename/remove exercise rows).
2. Run `--check` (optional) then sync without `--force`.
3. Commit updated `assets/data/exercise-media-*.json` and `exercise-media-index.json` with the markdown change.
4. Open the page in the app: cards with matches show a demo GIF; bottom **Credits** opens the attribution modal.

## Adding a new muscle page to the sync list

Edit `PAGE_FILTERS` in `.agents/skills/add-exercise-media/scripts/sync_exercise_media.py` with:

- `body_parts` — ExerciseDB body part filter (e.g. `chest`, `back`, `waist`)
- `targets` — optional muscle target filter (e.g. `biceps`, `lats`)
- `min_score` — auto-match threshold
- `manual` — optional exact-ish aliases `{ "Our Name": "catalog name" }`

Then run sync for that page.

## Frontend wiring

`assets/js/tabularize-exercises.js` loads `assets/data/exercise-media-index.json`, then the page’s `manifest`. No hardcoded per-muscle list is required once the index entry exists.
