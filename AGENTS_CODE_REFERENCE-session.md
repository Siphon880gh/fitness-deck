# AGENTS_CODE_REFERENCE-session.md

AI-oriented map of the **exercise session** UI (cards, marks, comments, filters, Outline, timer/reps).

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Media/Credits details: [AGENTS_CODE_REFERENCE-media.md](AGENTS_CODE_REFERENCE-media.md)

---

## What this module does

Loads one markdown table page into an interactive card deck. Users mark difficulty steps (4 colors), edit comments, search/filter, jump via Outline notes (optional `.up.md`), pick a random unmarked card, and open a Session control bar (countdown + reps table).

---

## Tech stack (this module)

- PHP shell: `views/tabularize-exercises.php` (~259 lines)
- Core JS: `assets/js/tabularize-exercises.js` (~1374 lines)
- Session widgets: `countdown.js` (~136), `reps.js` (~102), `control-bar.js` (~28), `modal.js` (~19)
- CSS: `assets/css/tabularize-exercises.css` (~1827) + includes under `assets/css/includes/`
- CDN: jQuery, markdown-it, DataTables CSS/JS (legacy; primary UI is `.fd-deck` cards)

---

## Architecture

```
?md-file=Folder/Page
  tabularize-exercises.php
    → sets filename, upMdExists, upMdFilename
    → chrome: top bar, filter panel, Outline, Session tools, credits modal, reps modal
  tabularize-exercises.js
    renderMDFile → markdown-it table → buildExerciseDeck → hydrate → load IDB → media
    filters / notes / section nav / legend
  countdown.js + reps.js  (Session bar panels)
```

---

## Relevant file tree

```
views/tabularize-exercises.php
assets/js/tabularize-exercises.js
assets/js/countdown.js
assets/js/reps.js
assets/js/control-bar.js
assets/js/modal.js
assets/css/tabularize-exercises.css
assets/css/includes/{control-bar,countdown,reps}.css
md-file/<Folder>/<Page>.md
md-file/<Folder>/<Page>.up.md   # optional Outline source
```

---

## High-level code flow

### PHP bridge (near end of `tabularize-exercises.php`)

Injects:

- `filename = 'md-file/…md'`
- `upMdExists` / `upMdFilename` for Outline
- Conditionally renders Outline button + panel markup when `.up.md` exists beside the exercise file

Also wires filter panel chips, Session toggle (shows `#bar-controls`), Credits modal shell.

### IndexedDB (top ~third of `tabularize-exercises.js`)

- DB name `fitness-deck`, `window.dbVersion = 3`
- `upgradeDb`: recreates stores `FitnessAddressedStore` and `FitnessCommentStore` (keyPath `id`)
- Page key: `getWebpageIdentifier()` ← `md-file` query param
- Marks: one record per page `{ id: pageKey, value: { "<Exercise>-<colIndex>": "addressed-N", … } }`
- Comments: records keyed by exercise name (store + page context via load/save helpers nearby)
- `loadAddressed` / `saveAddressed` / `loadComments` / `saveComment` — Safari-oriented open/transaction patterns

### Deck build (around middle of the file — `buildExerciseDeck`)

From the rendered `<table>`:

1. Find columns whose headers match `/variation/i` → ladder steps (`.fd-step` with `data-id` = `name-colIndex`).
2. Column 0 → exercise name; last column → contentEditable `.fd-ex-comment`.
3. Non-variation middle columns → `.fd-ex-meta` text.
4. Parentheses in names → `.text-parentheses` + optional Detail toggle (`has-detail` / `is-detail-open`).
5. Google Images link (strips leading junk and parenthetical notes from query).
6. Empty media slot `.fd-ex-media` for later GIF attach.

`hydrateDeckInteractions`: click cycles `addressed-1`→`4`→clear; contextmenu clears when marked; selection class `is-selected`.

### Render pipeline (`renderMDFile`, ~60% into the file)

1. `fetch(filename)` markdown.
2. Append “Edit Comments” header/separator/cells so the last column exists.
3. markdown-it → inject table into `.container`.
4. Replace table with deck; insert `#addressed` counter (clear-all confirm).
5. `hydrateDeckInteractions` → `loadAddressed` → `loadComments` → row count → `loadExerciseMediaForPage`.

### Filters (`window.fdFilterState`, ~last third)

- `search`, `colorMode` (`5` = none, else `1`–`4`), `commentMode` (`all` | `with` | `without`)
- `applyExerciseFilters` toggles `.hidden` on `.fd-ex`
- Panel UI in PHP (`#fd-filter-panel`); bind/toggle/clear + toast (`showFilterToast`) in JS
- Outline list items respect comment filter via `applyNotesCommentFilter`

### Outline / notes (near end of JS)

- `loadNotesContent`: fetch `.up.md`, markdown-it, external links `_blank`
- `linkNotesToExercises`: list items matching deck names get `fd-notes-jump` + scroll-to-card; syncs user comments under each jump item
- `buildSectionNav` / IntersectionObserver: when ≥2 `h2`s, sticky section jump UI in the panel
- Escape closes Outline and filter panel

### Session bar

- `control-bar.js`: expand/collapse relative panels
- `countdown.js`: `window.countdown` state machine PLAYING/PAUSED/STOPPED; quant buttons 10/30/60/90
- `reps.js`: dynamic set columns; modal copy of `reps×wt/` string; reset

### First-run legend (very end of JS)

localStorage `FitnessDeck__legendDismissed` controls `#first-run-legend` visibility.

---

## Markdown table contract

Example header shape (Bodybuilding / Stretch pages):

```markdown
| Exercise | …meta… | Easiest Variation | … | Hardest Variation |
```

Runtime adds a Comments column. Variation headers must contain the word “Variation” (case-insensitive).

Supplementary notes:

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
| `#bar-controls` | Session panels |
| `#save-status` | Brief “Saved” flash |
| `#fd-media-attribution` | Credits link host (created by JS) |

Design tokens: `--fd-*` in `tokens.css` (fonts Barlow Condensed + Figtree; green-tinted oklch palette).

---

## Safe-edit notes

1. Prefer extending `buildExerciseDeck` / filter helpers over reintroducing a full DataTable grid.
2. Bump `?v=` on CSS/JS in the PHP view when shipping client changes.
3. Changing `dbVersion` or store shapes wipes/recreates stores via `upgradeDb`—treat as data-loss for users.
4. Outline jump matching depends on list item text aligning with exercise names in the table.
5. Random tool (`goRandomRow`) only considers visible unmarked cards—respect filters.
