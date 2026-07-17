# AGENTS_CODE_REFERENCE.md

AI-oriented codebase map for safe modification, feature tracing, and implementation planning.

**Approximate location cues are intentional** (e.g. “near the top”, “around the middle”). Do not treat them as exact line numbers—code shifts often.

## Companion files

| File | Scope |
|------|--------|
| [AGENTS_CODE_REFERENCE-directory.md](AGENTS_CODE_REFERENCE-directory.md) | Home listing, goal chips, continue-session, A–Z vs By goal |
| [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md) | Exercise cards, IndexedDB marks/comments, filters, Outline notes |
| [AGENTS_CODE_REFERENCE-session-history.md](AGENTS_CODE_REFERENCE-session-history.md) | Session bar: assign exercise, timer/sets, save/edit/delete history |
| [AGENTS_CODE_REFERENCE-media.md](AGENTS_CODE_REFERENCE-media.md) | Demo GIF manifests (all pages), Credits modal, sync skill/script |
| [AGENTS_CODE_REFERENCE-instructions.md](AGENTS_CODE_REFERENCE-instructions.md) | Instructions column on cards, index tracking, sync skill/script |

Also see [AGENTS.md](AGENTS.md) for how to discover project skills under `.agents/skills/`.

When context is tight: prefer this file first; open a companion only for the module you are changing.

---

## What the app does

**Fitness Deck** is a local/static PHP + browser app that turns markdown exercise tables into interactive “decks.” Users pick a program/muscle page, mark difficulty steps with cycling colors, leave per-exercise comments, read how-to **Instructions** from the markdown table, open author Outline notes (`.up.md`), run a Session bar (assign exercise → duration/sets → save history), and see open-source demo GIFs on synced pages. Progress stays on-device—no accounts.

Live demo path (production): `https://wengindustry.com/tools/fitness-deck/`

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Server | PHP (thin router + view includes); no framework |
| Content | Markdown tables under `md-file/` (one folder deep) |
| Client | Vanilla JS + jQuery + markdown-it; DataTables CSS still linked but UI is card-based |
| Persistence | IndexedDB (`fitness-deck` v4) + localStorage prefs |
| Styling | CSS variables in `assets/css/tokens.css`; page CSS in `list-directories.css` / `tabularize-exercises.css` |
| Media sync | Python script under `.agents/skills/add-exercise-media/` → JSON manifests in `assets/data/` |
| Instructions sync | Python script under `.agents/skills/add-exercise-instructions/` → `exercise-instructions-index.json` |
| CDN | Font Awesome, Remix Icon, jQuery, DataTables, markdown-it |

---

## Architecture

```
Browser
  ├─ index.php
  │    ├─ no ?md-file → list-directories (programs)
  │    └─ ?md-file=Folder/Page → tabularize-exercises (session)
  ├─ fetch md-file/...md → markdown-it → HTML table → card deck
  │    (Instructions column → .fd-ex-instructions; Variation → ladder)
  ├─ optional fetch ...up.md → Outline panel (+ mark icons + comments)
  ├─ optional fetch exercise-media-index.json → page manifest → GIFs
  ├─ Session bar → assign exercise → duration/sets → IndexedDB history
  └─ IndexedDB / localStorage for marks, comments, history, UI prefs
```

Content and progress are intentionally decoupled: editing markdown never requires a DB migration; client stores are keyed by page path / exercise name.

---

## Relevant file tree

```
fitness-deck/
├── index.php                         # Router (~15 lines)
├── AGENTS.md                         # Agent skill discovery rules
├── icons.config.js                   # Folder icon overrides
├── md-file/                          # Content: Folder/Page.md (+ optional Page.up.md)
│   ├── Bodybuilding - Minimum Equipment/
│   ├── Stretch/ | Cardio/ | Mobility/ | Rehab - Shin Splints/
├── views/
│   ├── list-directories.php          # Directory shell
│   ├── tabularize-exercises.php      # Session shell (~304 lines)
│   └── includes/ld-include.php       # Glob md-file → window.dirs
├── assets/
│   ├── css/tokens.css
│   ├── css/list-directories.css
│   ├── css/tabularize-exercises.css  # Imports includes/* (~2026 lines)
│   ├── css/includes/
│   │   ├── control-bar.css | countdown.css | reps.css
│   │   └── session-history.css       # History panel + end toolbar (~436)
│   ├── js/
│   │   ├── list-directories.js
│   │   ├── common-sense-directories.js + common-sense-view.html
│   │   ├── tabularize-exercises.js   # Deck, filters, Outline, IDB (~1704)
│   │   ├── session-history.js        # Assign / save / history UI (~800)
│   │   ├── countdown.js | reps.js | control-bar.js | modal.js
│   └── data/
│       ├── exercise-media-index.json           # ~27 pages keyed Folder/Page
│       ├── exercise-media-*.json
│       └── exercise-instructions-index.json    # Instructions column tracking (~27)
└── .agents/skills/
    ├── add-exercise-media/
    │   ├── SKILL.md
    │   └── scripts/sync_exercise_media.py (~1041 lines)
    └── add-exercise-instructions/
        ├── SKILL.md
        └── scripts/sync_exercise_instructions.py (~808 lines)
```

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
3. `list-directories.js`: continue-session card, goal chips, mode toggle (`AREAS` vs `ALPHAB`).
4. AREAS fetches curated `common-sense-view.html`; ALPHAB rebuilds from `window.dirs`.

### 3. Session (deck + Outline)

1. PHP sets `filename`, `upMdExists`, `upMdFilename`; shells tools, Outline, Session bar, Credits/reps modals.
2. `tabularize-exercises.js` → `renderMDFile()` → `buildExerciseDeck()` → hydrate → load marks/comments → media.
3. Outline (if `.up.md`): jump links, user comments under jumps, brush icons for marked colors (`syncNotesMarks`).
4. Selecting a card (or Outline jump) can assign that exercise into the Session bar via `window.sessionHistoryUi`.

### 4. Session bar + history

Accordion in `#bar-controls`: Exercise → Duration → Sets → Reset; toolbar History + Save. Saves go to IndexedDB `FitnessSessionHistoryStore`. Details: [session-history companion](AGENTS_CODE_REFERENCE-session-history.md).

### 5. Content contract

Markdown tables: **Exercise** in column 0; headers matching `/instruction/i` → card how-to (`.fd-ex-instructions`); headers matching `/variation/i` = difficulty ladder; last column = comments (runtime-augmented). Parentheticals in names → muteable “Detail” spans.

Folder depth: **one level only** under `md-file/` (`Folder/File.md`).

---

## Persistence keys (safe-edit cheat sheet)

| Store | Key / shape | Purpose |
|-------|-------------|---------|
| IndexedDB `fitness-deck` v4 | `FitnessAddressedStore` | Per-page color marks |
| | `FitnessCommentStore` | Per-exercise comments |
| | `FitnessSessionHistoryStore` | Saved sessions (pageKey, exercise, sets, duration) |
| localStorage | `FitnessDeck__lastOpened` | Recent paths for Continue |
| localStorage | `FitnessDeck__indexMode` | `AREAS` \| `ALPHAB` |
| localStorage | `FitnessDeck__legendDismissed` | First-run legend |

`upgradeDb` **creates missing stores only**—it does not wipe existing data on version bumps. Address colors: classes `addressed-1`…`addressed-4` on ladder steps.

---

## Recent direction (from git history)

- Session bar redesign: accordion chips, assign-exercise guards, Reset (duration/sets only), History + Save end toolbar.
- Session history persisted in IndexedDB (edit/delete; confirm before discard on exercise switch).
- Outline jump items show marked-color brush icons.
- Exercise demo media synced across **all** program pages (~27); Stretch pages prefer correct GIF or **no** media (`manual: None` force-unmatch + stricter scoring).
- How-to **Instructions** column synced via `add-exercise-instructions` (index tracks mtime/sha/roster; fills blank cells only).

---

## Safe-modification notes for AI

1. **Prefer editing content in `md-file/`** over inventing UI for new exercises.
2. After adding/renaming exercises, run the media sync skill and/or instructions sync (`--check` then sync)—see media and instructions companions.
3. Do not vendor thousands of GIF binaries; manifests use hosted URLs. Prefer no GIF over a wrong stretch match.
4. Keep `md-file` one folder deep unless you also upgrade listing parsing.
5. Cache-bust `?v=…` on CSS/JS in the PHP view when shipping client changes.
6. Scan `.agents/skills/` live for skills; do not hardcode a skill list from memory.
7. Do not recreate IndexedDB stores on upgrade; add stores/indexes only (see `upgradeDb` near the top of `tabularize-exercises.js`).

Refer to companion files for module-level detail before loading whole 1k+ line sources into context.
