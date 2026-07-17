---
name: add-exercise-instructions
description: >-
  Sync how-to Instructions cells on Fitness Deck markdown exercise tables for
  one page or all tracked pages. Uses exercise-instructions-index.json (md
  mtime + sha + exercise name snapshot) to diff new or blank rows and only fill
  those. Use after adding/renaming exercises, when instructions may be stale,
  or when asked to sync exercise instructions.
---

# Add exercise instructions

## User prompt (verbatim)

Add or refresh exercise instructions for Fitness Deck pages when exercises are
added or the Instructions column may be stale. Track last-modified state in JSON,
diff for new or blank instruction rows, and fill only what needs work.

## Scope: one page or all pages

| User intent | What to run |
|-------------|-------------|
| One page (e.g. “Chest”, “Bodybuilding - Minimum Equipment/Back”) | `--page "Folder/File"` (optional `--check` first) |
| All pages that already have / track Instructions | `--check`, then sync **without** `--page` |
| All exercise pages (add Instructions column where missing) | sync with `--ensure-column` (no `--page`) |
| Rewrite every instruction on a page | add `--force` |

**Internal state:** `assets/data/exercise-instructions-index.json` stores per page:

- `mdMtimeMs`, `mdSha256`
- `exerciseNames` (roster snapshot)
- `instructionNames` / `missingNames`
- `filledCount`, `missingCount`, `lastSyncedAt`

A normal sync (no `--force`) **skips up-to-date pages** and only writes markdown when:

- never indexed, or
- markdown mtime/sha changed **and** there are blank Instructions cells, or
- new rows have empty Instructions, or
- `--page` on a file that lacks an Instructions column (column is added)

If the file changed but every row already has instructions, sync refreshes the index only (no rewrite).

All-pages mode discovers pages that **already have** an Instructions column or are **already in the index**. Pass `--ensure-column` (without `--page`) to include **every** `md-file/**/*.md` page and add the column where missing. `--page` alone also implies `--ensure-column` for that file.

## When to run

- User asks to add/sync **instructions** for one page → `--page`
- User edited `md-file/**/*.md` and instructions may be stale → `--check`, then sync
- Before shipping pages that use Instructions → `--check` (exit `0` = nothing to do)

## Local sync

From the repository root:

```bash
# --- All tracked / Instructions-column pages ---
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py

# --- All exercise pages (add Instructions column where missing) ---
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --ensure-column

# --- One page (adds Instructions column if missing) ---
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check --page "Bodybuilding - Minimum Equipment/Chest"
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --page "Bodybuilding - Minimum Equipment/Chest"

# --- Force regenerate all instruction cells on a page ---
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --force --page "Bodybuilding - Minimum Equipment/Chest"
```

`--check` exit code `0` = no rerun needed; `1` = at least one selected page is stale.

### What the script writes

1. Parse the markdown table
2. Ensure an `Instructions` column exists (`--page` / `--ensure-column`)
3. Diff roster vs index; fill **blank** cells only (unless `--force`)
4. Generate short how-to text (pattern templates + optional free-exercise-db)
5. Update `exercise-instructions-index.json`

Frontend already renders an Instructions column as `.fd-ex-instructions` on cards.

## Agent checklist

1. Decide **one page** vs **all tracked pages** from the user request.
2. Run `--check` (same scope) when unsure whether work is needed.
3. Run sync **without** `--force` unless the user wants a full rewrite.
4. Review generated wording for newly filled rows; edit the markdown if cues are weak.
5. Commit updated `md-file/...` rows **and** `assets/data/exercise-instructions-index.json` together when shipping.
6. Do not invent a second instructions store outside the markdown column + index.

## Related docs

- [README-Skill add exercise instructions.md](../../../README-Skill%20add%20exercise%20instructions.md)
- [AGENTS.md](../../../AGENTS.md)
