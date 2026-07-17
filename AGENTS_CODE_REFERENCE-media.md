# AGENTS_CODE_REFERENCE-media.md

AI-oriented map of **exercise demo media** (manifests, Credits UI, sync skill).

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Session attach points: [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md)  
Human guide: [README-Skill add images to new exercises.md](README-Skill%20add%20images%20to%20new%20exercises.md)  
Skill: [.agents/skills/add-exercise-media/SKILL.md](.agents/skills/add-exercise-media/SKILL.md)

---

## What this module does

Maps exercise names on markdown pages to hosted GIF/image URLs from open ExerciseDB-related datasets. The session page loads an index → page manifest → attaches demos on cards and a Credits modal. A Python sync script discovers **all** `md-file/**/*.md` pages (except `.up.md`) and keeps manifests fresh using markdown sha256 + exercise-name snapshots so new/renamed rows get matched without dumping binaries into the repo.

---

## Tech stack (this module)

| Piece | Location | ~lines |
|-------|----------|--------|
| Frontend attach | `tabularize-exercises.js` (media block mid-file) | (shared) |
| Index + manifests | `assets/data/exercise-media-index.json` + `exercise-media-*.json` | — |
| Sync script | `.agents/skills/add-exercise-media/scripts/sync_exercise_media.py` | ~1041 |
| Credits modal | near bottom of `views/tabularize-exercises.php` (`#credits-modal`) | — |

---

## Architecture

```
md-file/.../Page.md
     ↑ mtime/sha + exerciseNames tracked
sync_exercise_media.py  →  exercise-media-index.json
                        →  exercise-media-<slug>.json  (byExercise + attribution)
session page
  getPageMediaKey() → index.pages[key].manifest → attachExerciseMedia()
  → Credits button + modal (attribution.links)
```

Default CLI with no `--page` processes **every** discovered md page. Tuned catalog filters live in `PAGE_FILTERS`; unknown pages use `default_page_filter` (full catalog, lower `min_score`).

Stretch pages search the full catalog with higher `min_score` (~0.68+) and stretch-aware scoring (penalize strength moves / wrong muscle / opposite pose families). In `PAGE_FILTERS.manual`, value **`None` or `""` force-unmatches** that exercise (prefer no demo over a wrong GIF).

---

## Relevant file tree

```
assets/data/
  exercise-media-index.json          # ~27 pages (all current programs)
  exercise-media-*.json              # Bodybuilding, Stretch, Cardio, Mobility, Rehab…
.agents/skills/add-exercise-media/
  SKILL.md
  scripts/sync_exercise_media.py
assets/js/tabularize-exercises.js   # load / attach / credits
views/tabularize-exercises.php      # #credits-modal shell
```

Programs currently indexed: Bodybuilding — Minimum Equipment (10), Stretch (14), Cardio/10-Minute Burns, Mobility/Mobility, Rehab — Shin Splints.

---

## High-level code flow

### Index shape (`exercise-media-index.json`)

Top-level: `updatedAt`, `catalogSource`, `pages` map keyed by `Folder/Page` (no `.md`).

Each page entry includes: `mdPath`, `mdMtimeMs`, `mdSha256`, `exerciseNames` (snapshot), `manifest` path, optional `bodyParts`/`targets`, sync stats (`matchedCount`, `unmatchedCount`, `lastSyncedAt`).

Stale when: never synced, sha changed, or **new exercise names** vs last snapshot. Permanently unmatched names alone do not force a rerun.

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
   - Fill `.fd-ex-media` with static `imageUrl` first; swap to `gifUrl` via IntersectionObserver near viewport
   - Mark card `has-media`
5. `renderMediaAttribution` — `#fd-media-attribution` Credits button + modal body

Credits bind once (`window.__fdCreditsModalBound`); Escape handled with other modals.

### Sync script (`sync_exercise_media.py`)

Near the top: `REPO_ROOT`, `CATALOG_URL`, `MEDIA_BASE`, `ATTRIBUTION`, `PAGE_FILTERS`.

Around the middle: stretch quality tokens / `score()` penalties, `default_page_filter`, `discover_page_keys` (all md except `.up.md`), `match_exercises` (manual lock + auto), `sync_page`.

Typical CLI:

```bash
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Stretch/Hips"
python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
```

`--check` exit `0` = nothing to do; `1` = at least one selected page is stale. Incremental: keep existing `byExercise` for unchanged names; match new; drop removed; rewrite manifest + index. `--force` rematches selected pages. Manual `None` entries stay unmatched even after `--force` unless you change `PAGE_FILTERS`.

---

## Licensing / product rules

- Do **not** vendor large GIF trees into git; use hosted dataset URLs.
- Non-commercial + attribution required (ExerciseDB / Gym visual via AscendAPI)—Credits copy is in the UI and script `ATTRIBUTION`.
- Prefer running the skill after md-file edits (page or all).

---

## Safe-edit notes

1. New page under `md-file/`: discovery picks it up automatically; add a `PAGE_FILTERS` entry when catalog body_parts/targets/manual aliases improve match quality.
2. Renamed exercises: sync drops old keys; `manual` aliases help catalog mismatches. Use `"Our Name": None` when no acceptable catalog demo exists.
3. Frontend matching is **exact string** on `byExercise` keys—typos in md names break demos.
4. Discover the skill via `.agents/skills/*/SKILL.md` (see [AGENTS.md](AGENTS.md)); do not assume a fixed skill inventory.
