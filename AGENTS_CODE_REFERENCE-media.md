# AGENTS_CODE_REFERENCE-media.md

AI-oriented map of **exercise demo media** (manifests, Credits UI, sync skill).

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Session attach points: [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md)  
Human guide: [README-Skill add images to new exercises.md](README-Skill%20add%20images%20to%20new%20exercises.md)  
Skill: [.agents/skills/add-exercise-media/SKILL.md](.agents/skills/add-exercise-media/SKILL.md)

---

## What this module does

Maps exercise names on selected markdown pages to hosted GIF/image URLs from open ExerciseDB-related datasets. The session page loads an index → page manifest → attaches demos on cards and a Credits modal. A Python sync script keeps manifests fresh using markdown mtime + sha256 so new/renamed rows get matched without dumping binaries into the repo.

---

## Tech stack (this module)

- Frontend attach: functions in `assets/js/tabularize-exercises.js` (media block roughly mid-file, after deck build helpers)
- Data: `assets/data/exercise-media-index.json` + `assets/data/exercise-media-*.json`
- Sync: `.agents/skills/add-exercise-media/scripts/sync_exercise_media.py` (~506 lines)
- Credits modal markup: near the bottom of `views/tabularize-exercises.php` (`#credits-modal`)

---

## Architecture

```
md-file/.../Page.md
     ↑ mtime/sha tracked
sync_exercise_media.py  →  exercise-media-index.json
                        →  exercise-media-<slug>.json  (byExercise + attribution)
session page
  getPageMediaKey() → index.pages[key].manifest → attachExerciseMedia()
  → Credits button + modal (attribution.links)
```

---

## Relevant file tree

```
assets/data/
  exercise-media-index.json
  exercise-media-bodybuilding-minimum-equipment-*.json
.agents/skills/add-exercise-media/
  SKILL.md
  scripts/sync_exercise_media.py
assets/js/tabularize-exercises.js   # load / attach / credits
views/tabularize-exercises.php      # #credits-modal shell
```

Current index covers **10** Bodybuilding — Minimum Equipment pages (Abs, Back, Biceps, Calf, Chest, Hamstrings, Lats, Quadriceps, Shoulders, Triceps). Stretch/Cardio/etc. have no manifests unless added to `PAGE_FILTERS` and synced.

---

## High-level code flow

### Index shape (`exercise-media-index.json`)

Top-level: `updatedAt`, `catalogSource`, `pages` map keyed by `Folder/Page` (no `.md`).

Each page entry includes: `mdPath`, `mdMtimeMs`, `mdSha256`, `manifest` path, optional `bodyParts`/`targets`, sync stats (`matchedCount`, `unmatchedCount`, `lastSyncedAt`).

### Manifest shape (per-page JSON)

Near the top of a page file:

- `pageKey`
- `attribution`: `{ text, links: [{ label, url }] }`
- `byExercise`: map of **exact exercise name string** → `{ gifUrl, imageUrl, sourceName, source }`

Keys must match `card.dataset.exercise` (raw table name).

### Frontend load (session JS, media section mid-file)

1. `getPageMediaKey()` — `md-file` query without `.md`
2. `loadExerciseMediaIndex()` — cached promise, `cache: "no-cache"`
3. `mediaManifestPathForPage` → fetch manifest (`force-cache`)
4. `attachExerciseMedia`:
   - Fill `.fd-ex-media` with static `imageUrl` first, swap to `gifUrl` via IntersectionObserver when near viewport
   - Mark card `has-media`
5. `renderMediaAttribution` — inject `#fd-media-attribution` Credits button; populate modal body

Credits open/close helpers bind once (`window.__fdCreditsModalBound`); Escape handled with other modals.

### Sync script (`sync_exercise_media.py`)

Near the top: `REPO_ROOT`, `CATALOG_URL`, `MEDIA_BASE`, `ATTRIBUTION`, `PAGE_FILTERS` (per-page `body_parts` / `targets` / `min_score` / `manual` name aliases).

Typical CLI:

```bash
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Back"
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
```

Incremental behavior: keep existing `byExercise` for unchanged names; match new names; drop removed; rewrite manifest + index. `--force` rematches everything on selected pages.

---

## Licensing / product rules

- Do **not** vendor large GIF trees into git; use hosted dataset URLs.
- Non-commercial + attribution required (ExerciseDB / Gym visual via AscendAPI)—Credits copy is already in the UI and script `ATTRIBUTION`.
- Prefer running the skill after md-file edits on configured pages.

---

## Safe-edit notes

1. New muscle page: add filter entry to `PAGE_FILTERS` in the sync script, run sync for that `--page`, confirm Credits still opens.
2. Renamed exercises: sync drops old keys; manual aliases help fuzzy/catalog mismatches.
3. Frontend matching is **exact string** on `byExercise` keys—typos in md names break demos.
4. Discover the skill via `.agents/skills/*/SKILL.md` (see [AGENTS.md](AGENTS.md)); do not assume a fixed skill inventory.
