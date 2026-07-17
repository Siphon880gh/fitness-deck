# AGENTS_CODE_REFERENCE-session.md

AI-oriented map of the **exercise session** UI (cards, marks, comments, filters, Outline).

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Session bar / history: [AGENTS_CODE_REFERENCE-session-history.md](AGENTS_CODE_REFERENCE-session-history.md)  
Media/Credits: [AGENTS_CODE_REFERENCE-media.md](AGENTS_CODE_REFERENCE-media.md)

---

## What this module does

Loads one markdown table page into an interactive card deck. Users mark difficulty steps (4 colors), edit comments, search/filter, jump via Outline notes (optional `.up.md`), pick a random unmarked card, and open Session tools (timer/reps/history—see session-history companion). Outline jump items show user comments and a brush icon for the card’s mark color.

---

## Tech stack (this module)

| File | ~lines |
|------|--------|
| `views/tabularize-exercises.php` | ~304 |
| `assets/js/tabularize-exercises.js` | ~1616 |
| `assets/css/tabularize-exercises.css` (+ `@import` includes) | ~1954 |
| Session widgets | see [session-history companion](AGENTS_CODE_REFERENCE-session-history.md) |

CDN: jQuery, markdown-it, DataTables CSS/JS (legacy; primary UI is `.fd-deck` cards).

---

## Architecture

```
?md-file=Folder/Page
  tabularize-exercises.php
    → filename, upMdExists, upMdFilename
    → chrome: top bar, filters, Outline, Session tools, credits/reps modals
  tabularize-exercises.js
    renderMDFile → markdown-it table → buildExerciseDeck → hydrate → load IDB → media
    filters / notes / section nav / syncNotesMarks / legend
  session-history.js + control-bar / countdown / reps  (Session bar)
```

---

## Relevant file tree

```
views/tabularize-exercises.php
assets/js/tabularize-exercises.js
assets/js/session-history.js          # Session bar (companion)
assets/js/{control-bar,countdown,reps,modal}.js
assets/css/tabularize-exercises.css
assets/css/includes/{control-bar,countdown,reps,session-history}.css
md-file/<Folder>/<Page>.md
md-file/<Folder>/<Page>.up.md         # optional Outline source
```

---

## High-level code flow

### PHP bridge (near end of `tabularize-exercises.php`)

Injects `filename`, `upMdExists`, `upMdFilename`. Conditionally renders Outline button + panel when `.up.md` exists. Also wires filter panel, Session toggle (`#bar-controls`), Credits modal, Session accordion markup.

### IndexedDB (top of `tabularize-exercises.js`)

- DB name `fitness-deck`, `window.dbVersion = 4`
- `upgradeDb`: **create missing stores only** (Addressed, Comment, SessionHistory)—never deletes existing stores
- Page key: `getWebpageIdentifier()` ← `md-file` query param
- Marks: one record per page `{ id: pageKey, value: { "<Exercise>-<colIndex>": "addressed-N", … } }`
- Comments: keyed by exercise name via load/save helpers nearby
- History CRUD: `loadSessionHistory` / `saveSessionHistoryEntry` / `deleteSessionHistoryEntry` (used by session-history.js)

### Deck build (`buildExerciseDeck`, around middle of the file)

From the rendered `<table>`:

1. Headers matching `/variation/i` → ladder steps (`.fd-step`, `data-id` = `name-colIndex`).
2. Column 0 → exercise name; last column → contentEditable `.fd-ex-comment`.
3. Non-variation middle columns → `.fd-ex-meta`.
4. Parentheses in names → `.text-parentheses` + Detail toggle.
5. Google Images link (strips junk / parentheticals from query).
6. Empty `.fd-ex-media` for GIF attach.

`hydrateDeckInteractions`: click cycles `addressed-1`→`4`→clear; contextmenu clears when marked; selection `is-selected`. Selecting a card also assigns Session via `sessionHistoryUi.setAssignedExercise` when present. After mark changes, `syncNotesMarks()` refreshes Outline icons.

### Render pipeline (`renderMDFile`, ~60% into the file)

1. `fetch(filename)` markdown.
2. Append “Edit Comments” column.
3. markdown-it → `.container` → replace table with deck; `#addressed` counter.
4. hydrate → `loadAddressed` → `loadComments` → `loadExerciseMediaForPage`.

### Filters (`window.fdFilterState`, ~last third)

- `search`, `colorMode` (`5` = none, else `1`–`4`), `commentMode` (`all` | `with` | `without`)
- `applyExerciseFilters` toggles `.hidden` on `.fd-ex`
- Outline list items respect comment filter via `applyNotesCommentFilter`

### Outline / notes (latter part of JS)

- `loadNotesContent`: fetch `.up.md`, markdown-it, external links `_blank`
- `linkNotesToExercises`: matching list items → `fd-notes-jump` + jump-to-card (also assigns Session exercise)
- `syncNotesComments`: user comment text under each jump
- `syncNotesMarks`: `.fd-notes-mark-icon` brush with `data-mark` 1–4 from the card’s ladder color
- `buildSectionNav` / IntersectionObserver: ≥2 `h2`s → sticky section jump UI
- Escape closes Outline and filter panel

### First-run legend (very end of JS)

localStorage `FitnessDeck__legendDismissed` controls `#first-run-legend`.

---

## Markdown table contract

```markdown
| Exercise | …meta… | Easiest Variation | … | Hardest Variation |
```

Runtime adds a Comments column. Variation headers must contain “Variation” (case-insensitive).

```
md-file/Stretch/Back.md      # table
md-file/Stretch/Back.up.md   # Outline (headings + bullet exercise names)
```

---

## DOM / CSS hooks worth knowing

| Class / id | Role |
|------------|------|
| `.fd-deck` / `.fd-ex` | Card list / card |
| `.fd-ladder` / `.fd-step` | Difficulty steps |
| `.addressed-1`…`4` | Color marks |
| `#toggle-btns` / `.fd-tool` | Bottom-right tools |
| `#notes-panel` | Outline drawer |
| `.fd-notes-jump` / `.fd-notes-mark-icon` | Outline jump + mark brush |
| `#bar-controls` | Session panels |
| `#save-status` | Brief “Saved” flash |
| `#fd-media-attribution` | Credits link host (created by JS) |

Design tokens: `--fd-*` in `tokens.css` (Barlow Condensed + Figtree; green-tinted oklch).

---

## Safe-edit notes

1. Prefer extending `buildExerciseDeck` / filter helpers over reintroducing a full DataTable grid.
2. Bump `?v=` on CSS/JS in the PHP view when shipping client changes.
3. Do not wipe IndexedDB stores in `upgradeDb`; only add missing stores/indexes.
4. Outline jump matching depends on list item text aligning with exercise names; keep `syncNotesMarks` / `syncNotesComments` in sync when changing jump markup.
5. Random tool (`goRandomRow`) only considers visible unmarked cards—respect filters.
6. Session assign/save/history live in `session-history.js`—edit there, not by duplicating logic in this file.
