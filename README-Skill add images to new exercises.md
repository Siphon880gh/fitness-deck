# Skill: Add images to new exercises

This document describes the **add-exercise-media** project skill: attach open-source exercise animations to Fitness Deck pages, for **one page or all pages**, using internal state so only pages that need updates are rewritten.

## Skill location

```
.agents/skills/add-exercise-media/
├── SKILL.md
└── scripts/sync_exercise_media.py
```

Ask an agent to follow that skill, or run the sync script yourself locally.

## One page vs all pages

| Goal | Command |
|------|---------|
| See what needs updating (all pages) | `.../sync_exercise_media.py --check` |
| Update only pages that need it (all) | `.../sync_exercise_media.py` |
| One page check | `.../sync_exercise_media.py --check --page "Stretch/Hips"` |
| One page update if needed | `.../sync_exercise_media.py --page "Stretch/Hips"` |
| Force rematch | add `--force` (with or without `--page`) |

The sync script reads `assets/data/exercise-media-index.json`. For each page it compares the markdown **sha256** and the list of **exercise names** from the last sync. If nothing changed, that page is skipped (`ok`). If the file changed or new rows appeared, it matches media for new names only (existing matches are kept).

## Why tracking exists

Exercise pages live in `md-file/**/*.md`. Media mappings live in `assets/data/exercise-media-*.json`.

Without the index, adding rows would leave demos missing forever—or force rematching everything. State-aware sync grows manifests only when needed.

## Sources

- [Kaggle Fitness Exercises Dataset](https://www.kaggle.com/datasets/exercisedb/fitness-exercises-dataset/data)
- [ExerciseDB OSS API](https://oss.exercisedb.dev/docs)
- [anil-g11h/exercises-dataset](https://github.com/anil-g11h/exercises-dataset) (GitHub mirror used for GIF/JPG URLs)

Attribution (shown in the in-app **Credits** modal):

> Exercise animations provided by ExerciseDB / Fitness Exercises Dataset. Gym visuals via AscendAPI ExerciseDB. Non-commercial use; attribution required.

## Commands

From the repository root:

```bash
# All pages — report stale (exit 0 = nothing to do)
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check

# All pages — sync only what the index says needs work
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py

# One page
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check --page "Bodybuilding - Minimum Equipment/Shoulders"
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Shoulders"

# Force rematch
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force --page "Stretch/Hips"
```

## Workflow after editing exercises

1. Edit `md-file/.../SomeMuscle.md` (add/rename/remove exercise rows).
2. Prefer one-page sync for that file; use all-pages sync if you edited many files.
3. Run `--check` (optional) then sync without `--force`.
4. Commit updated `assets/data/exercise-media-*.json` and `exercise-media-index.json` with the markdown change.
5. Open the page in the app: matched cards show a demo GIF; bottom **Credits** opens attribution.

## Improving match quality (optional)

Edit `PAGE_FILTERS` in `.agents/skills/add-exercise-media/scripts/sync_exercise_media.py`:

- `body_parts` / `targets` — catalog filters
- `min_score` — auto-match threshold (Stretch pages use ~0.68+ plus stretch-aware scoring)
- `manual` — `{ "Our Name": "catalog name" }`; use `None` or `""` to **force unmatch** (prefer no GIF over a wrong demo)
- `prefer_tokens` — boost catalog names containing these tokens

Pages without an entry still sync using defaults.

## Frontend wiring

`assets/js/tabularize-exercises.js` loads `assets/data/exercise-media-index.json`, then the page’s `manifest`.
