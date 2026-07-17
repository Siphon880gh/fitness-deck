# AGENTS_CODE_REFERENCE.md

AI-oriented codebase map for safe modification, feature tracing, and implementation planning.

**Approximate location cues are intentional** (e.g. “near the top”, “around the middle”). Do not treat them as exact line numbers—code shifts often.

## Companion files

| File | Scope |
|------|--------|
| [AGENTS_CODE_REFERENCE-directory.md](AGENTS_CODE_REFERENCE-directory.md) | Home listing, goal chips, continue-session, A–Z vs By goal |
| [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md) | Exercise cards, IndexedDB marks/comments, filters, Outline notes, session timer/reps |
| [AGENTS_CODE_REFERENCE-media.md](AGENTS_CODE_REFERENCE-media.md) | Demo GIF manifests, Credits modal, sync skill/script |

Also see [AGENTS.md](AGENTS.md) for how to discover project skills under `.agents/skills/`.

When context is tight: prefer this file first; open a companion only for the module you are changing.

---

## What the app does

**Fitness Deck** is a local/static PHP + browser app that turns markdown exercise tables into interactive “decks.” Users pick a program/muscle page, mark difficulty steps with cycling colors, leave per-exercise comments, optionally open author Outline notes (`.up.md`), and (on synced pages) see open-source demo GIFs. Progress stays on-device—no accounts.

Live demo path (production): `https://wengindustry.com/tools/fitness-deck/`

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Server | PHP (thin router + view includes); no framework |
| Content | Markdown tables under `md-file/` (one folder deep) |
| Client | Vanilla JS + jQuery + markdown-it; DataTables CSS still linked but UI is card-based |
| Persistence | IndexedDB (`fitness-deck`) + localStorage prefs |
| Styling | CSS variables in `assets/css/tokens.css`; page CSS in `list-directories.css` / `tabularize-exercises.css` |
| Media sync | Python script under `.agents/skills/add-exercise-media/` → JSON manifests in `assets/data/` |
| CDN | Font Awesome, Remix Icon, jQuery, DataTables, markdown-it |

---

## Architecture

```
Browser
  ├─ index.php
  │    ├─ no ?md-file → list-directories (programs)
  │    └─ ?md-file=Folder/Page → tabularize-exercises (session)
  ├─ fetch md-file/...md → markdown-it → HTML table → card deck
  ├─ optional fetch ...up.md → Outline panel
  ├─ optional fetch exercise-media-index.json → page manifest → GIFs
  └─ IndexedDB / localStorage for marks, comments, UI prefs
```

Content and progress are intentionally decoupled: editing markdown never requires a DB migration; client stores are keyed by page path / exercise name.

---

## Relevant file tree

```
fitness-deck/
├── index.php                         # Router (~15 lines)
├── AGENTS.md                         # Agent skill discovery rules
├── icons.config.js                   # Folder icon overrides (JSON)
├── md-file/                          # Content: Folder/Page.md (+ optional Page.up.md)
│   ├── Bodybuilding - Minimum Equipment/
│   ├── Stretch/ | Cardio/ | Mobility/ | Rehab - Shin Splints/
├── views/
│   ├── list-directories.php          # Directory shell
│   ├── tabularize-exercises.php      # Session shell
│   └── includes/ld-include.php       # Glob md-file → window.dirs
├── assets/
│   ├── css/tokens.css                # Shared design tokens
│   ├── css/list-directories.css
│   ├── css/tabularize-exercises.css  # Largest stylesheet (~1.8k lines)
│   ├── js/
│   │   ├── list-directories.js       # Listing modes, continue, chips
│   │   ├── common-sense-directories.js + common-sense-view.html  # By-goal HTML
│   │   ├── tabularize-exercises.js   # Core session logic (~1.4k lines)
│   │   ├── countdown.js | reps.js | control-bar.js | modal.js
│   └── data/
│       ├── exercise-media-index.json
│       └── exercise-media-*.json     # Per-page byExercise maps
└── .agents/skills/add-exercise-media/
    ├── SKILL.md
    └── scripts/sync_exercise_media.py
```

Line counts (approx.): `tabularize-exercises.js` ~1374; `tabularize-exercises.css` ~1827; `list-directories.js` ~228; `sync_exercise_media.py` ~506; `tabularize-exercises.php` ~259.

---

## High-level code flow

### 1. Entry

Near the top of `index.php`: if `$_GET["md-file"]` is absent → include directory view; else strip trailing `.md` and include session view.

```php
// index.php — near top
if(!isset($_GET["md-file"])) {
    include("views/list-directories.php");
} else {
    // normalize .md suffix, then:
    include("views/tabularize-exercises.php");
}
```

### 2. Directory

1. `ld-include.php` recursively globs `md-file/**/*.md`, drops `*.up.md`, builds `$relativePaths` like `Stretch/Back.md`.
2. PHP injects `window.dirs` into the page.
3. `list-directories.js` on DOMContentLoaded: continue-session card, goal chips, mode toggle (`AREAS` vs `ALPHAB` in localStorage).
4. AREAS mode fetches `common-sense-view.html` (curated goal grouping). ALPHAB rebuilds `<ul.dirs>` from `window.dirs`.

### 3. Session

1. PHP sets `filename`, `upMdExists`, `upMdFilename` for JS.
2. `tabularize-exercises.js` → `renderMDFile()` fetches the markdown, appends an “Edit Comments” column, renders with markdown-it, then `buildExerciseDeck()` replaces the table with `.fd-ex` cards.
3. `hydrateDeckInteractions()` wires color cycles on `.fd-step`; blur on comments saves to IndexedDB.
4. `loadExerciseMediaForPage()` may attach demos + Credits.
5. Outline button (if `.up.md` exists) loads notes, jump-links matching exercise names, section nav for `h2`s.

### 4. Content contract

Markdown tables expect: **Exercise** name in column 0, columns matching `/variation/i` as the difficulty ladder, last column treated as comments (runtime-augmented). Parentheticals in names become muteable “Detail” spans.

Folder depth: **one level only** under `md-file/` (`Folder/File.md`). Listing code uses `dir.split("/")[0|1]`.

---

## Persistence keys (safe-edit cheat sheet)

| Store | Key / shape | Purpose |
|-------|-------------|---------|
| IndexedDB `fitness-deck` v3 | Object stores `FitnessAddressedStore`, `FitnessCommentStore` | Per-page color marks; per-exercise comments |
| localStorage | `FitnessDeck__lastOpened` | Recent paths for Continue |
| localStorage | `FitnessDeck__indexMode` | `AREAS` \| `ALPHAB` |
| localStorage | `FitnessDeck__legendDismissed` | First-run legend |

Addressed colors: classes `addressed-1`…`addressed-4` on ladder steps; cycle on click, clear on contextmenu when marked.

---

## Recent direction (from git history)

- Visual redesign (tokens, directory hero, card deck instead of dense DataTable UX).
- Filters panel (comments + color swatches) + toast feedback.
- Outline panel UX (notes + jump anchors).
- Exercise demo media for Bodybuilding Minimum Equipment pages via manifests + sync skill.
- Parenthesis muting in exercise names; hardened link/query cleanup.

---

## Safe-modification notes for AI

1. **Prefer editing content in `md-file/`** over inventing UI for new exercises.
2. After adding/renaming Bodybuilding exercises, run the media sync skill (`--check` then sync)—see media companion.
3. Do not vendor thousands of GIF binaries; manifests use hosted URLs.
4. Keep `md-file` one folder deep unless you also upgrade listing parsing.
5. Cache-bust query on session assets (`?v=…` on CSS/JS in the PHP view) when shipping client changes.
6. Scan `.agents/skills/` live for skills; do not hardcode a skill list from memory.

Refer to companion files for module-level detail before loading whole 1k+ line sources into context.
