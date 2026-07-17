# AGENTS_CODE_REFERENCE-instructions.md

AI-oriented map of **exercise Instructions** (markdown column, card copy, sync skill).

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Session attach points: [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md)  
Human guide: [README-Skill add exercise instructions.md](README-Skill%20add%20exercise%20instructions.md)  
Skill: [.agents/skills/add-exercise-instructions/SKILL.md](.agents/skills/add-exercise-instructions/SKILL.md)

---

## What this module does

Keeps how-to **Instructions** cells on Fitness Deck markdown tables filled when exercises are added. Instructions live in the markdown (not a separate manifest). An index tracks per-page mtime/sha/exercise roster and which rows already have text so sync fills **blank** cells only (unless `--force`). The session deck renders matching headers as `.fd-ex-instructions`.

---

## Tech stack (this module)

| Piece | Location | ~lines |
|-------|----------|--------|
| Frontend render | `tabularize-exercises.js` (`buildExerciseDeck`, `/instruction/i` headers) | (shared) |
| Card CSS | `tabularize-exercises.css` (`.fd-ex-instructions`) | (shared) |
| Index | `assets/data/exercise-instructions-index.json` | — |
| Sync script | `.agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py` | ~808 |

---

## Architecture

```
md-file/.../Page.md  (Instructions column in table)
     ↑ mdMtimeMs + mdSha256 + exerciseNames + filled/missing tracked
sync_exercise_instructions.py  →  exercise-instructions-index.json
                               →  patches blank Instructions cells in md
session page
  buildExerciseDeck → header /instruction/i → .fd-ex-instructions
```

Default CLI (no `--page`) processes pages that **already have** an Instructions column or are **already in the index**. `--page` (and `--ensure-column` without `--page`) can add the column where missing.

---

## Relevant file tree

```
assets/data/
  exercise-instructions-index.json   # ~27 pages (tracked)
md-file/**/*.md                      # Instructions cells live here
.agents/skills/add-exercise-instructions/
  SKILL.md
  scripts/sync_exercise_instructions.py
assets/js/tabularize-exercises.js    # /instruction/i → .fd-ex-instructions
assets/css/tabularize-exercises.css  # .fd-ex-instructions layout
```

---

## High-level code flow

### Index shape (`exercise-instructions-index.json`)

Top-level: `updatedAt` (when present), `pages` map keyed by `Folder/Page` (no `.md`).

Each page entry includes: `mdPath`, `mdMtimeMs`, `mdSha256`, `exerciseNames`, `instructionNames`, `missingNames`, `filledCount`, `missingCount`, `lastSyncedAt`.

Stale when: never indexed, blanks to fill, roster/hash/mtime drift needing index refresh, or `--force`. If the file changed but every row already has instructions, sync refreshes the index only (no rewrite).

### Frontend (session JS, deck build mid-file)

1. Collect header indexes matching `/instruction/i`.
2. Exclude those columns from aesthetics `.fd-ex-meta`.
3. Join instruction cell text into `<p class="fd-ex-instructions">` on the card.

No separate fetch—text comes from the same markdown table as the exercise rows.

### Sync script (`sync_exercise_instructions.py`)

Near the top: `REPO_ROOT`, `INDEX_PATH`, `FREE_EXERCISE_DB_URL`, `INSTR_HEADER`.

Around the middle: table parse/patch helpers, pattern templates + optional free-exercise-db lookup, `sync_page`.

Typical CLI:

```bash
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --ensure-column
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --page "Bodybuilding - Minimum Equipment/Chest"
python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --force --page "Bodybuilding - Minimum Equipment/Chest"
```

`--check` exit `0` = nothing to do; `1` = at least one selected page is stale. `--page` implies `--ensure-column` for that file. Generation: short how-to from name patterns + optional free-exercise-db; existing non-blank cells are kept unless `--force`.

---

## Safe-edit notes

1. Prefer one-page `--page` after editing a single md file; use all-pages (or `--ensure-column`) when many pages need tracking.
2. Commit markdown Instruction cell changes **with** `exercise-instructions-index.json`.
3. Do not invent a second instructions store outside the markdown column + index.
4. Discover the skill via `.agents/skills/*/SKILL.md` (see [AGENTS.md](AGENTS.md)); do not assume a fixed skill inventory.
