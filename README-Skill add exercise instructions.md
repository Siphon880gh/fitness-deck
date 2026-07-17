# Skill: Add exercise instructions

This document describes the **add-exercise-instructions** project skill: keep how-to **Instructions** cells on Fitness Deck markdown tables fresh when exercises are added, using internal JSON state so only new or blank rows are filled.

## Skill location

```
.agents/skills/add-exercise-instructions/
├── SKILL.md
└── scripts/sync_exercise_instructions.py
```

Ask an agent to follow that skill, or run the sync script yourself locally.

## One page vs all pages

| Goal | Command |
|------|---------|
| See what needs updating (tracked pages) | `.../sync_exercise_instructions.py --check` |
| Fill blanks / refresh index (tracked) | `.../sync_exercise_instructions.py` |
| One page check | `.../sync_exercise_instructions.py --check --page "Bodybuilding - Minimum Equipment/Chest"` |
| One page sync (adds Instructions column if missing) | `.../sync_exercise_instructions.py --page "…"` |
| Rewrite every instruction on a page | add `--force` |

The script reads `assets/data/exercise-instructions-index.json`. For each page it compares markdown **mtime**, **sha256**, and the list of **exercise names** from the last sync. If the file changed, it **diffs** the roster and fills only rows with **blank** Instructions (existing text is kept). `--force` regenerates all instruction cells.

## Why tracking exists

Exercise pages live in `md-file/**/*.md`. Instructions live in an **Instructions** table column (shown on cards as how-to text).

Without the index, adding rows would leave blank instructions forever—or force rewriting every cue. State-aware sync grows instructions only when needed.

## Commands

From the repository root:

```bash
# Tracked pages — report stale (exit 0 = nothing to do)
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check

# Tracked pages — fill blanks / refresh index only where needed
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py

# One page
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check --page "Bodybuilding - Minimum Equipment/Chest"
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --page "Bodybuilding - Minimum Equipment/Chest"

# Force regenerate all instructions on a page
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --force --page "Bodybuilding - Minimum Equipment/Chest"
```

## Workflow after editing exercises

1. Edit `md-file/.../SomeMuscle.md` (add/rename/remove exercise rows).
2. Prefer one-page sync for that file; use all-pages sync if you maintain Instructions on several pages.
3. Run `--check` (optional) then sync without `--force`.
4. Skim any newly filled Instructions cells; edit wording in the markdown if needed.
5. Commit the markdown change **with** `assets/data/exercise-instructions-index.json`.

## What “stale” means

A page is stale when:

- it was never indexed, or
- the markdown mtime/sha changed and there are blank Instructions cells, or
- new exercise names appeared (index must refresh; blanks are filled), or
- you pass `--force`

All-pages mode only considers pages that **already have** an Instructions column or are **already listed** in the index. To start tracking a new page, run `--page "Folder/File"` once.

## Frontend wiring

`assets/js/tabularize-exercises.js` treats a table header matching `/instruction/i` as card copy (`.fd-ex-instructions`), separate from aesthetics meta and the difficulty ladder.
