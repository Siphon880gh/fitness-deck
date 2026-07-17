# AGENTS_CODE_REFERENCE-session-history.md

AI-oriented map of the **Session bar**: assign exercise, duration/sets, save/edit/delete history.

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)  
Deck / Outline / marks: [AGENTS_CODE_REFERENCE-session.md](AGENTS_CODE_REFERENCE-session.md)

---

## What this module does

When the user opens **Session**, they assign an exercise from the current page, log duration (countdown) and sets/reps/weight, then **Save** into per-page IndexedDB history. History supports edit (reload into the bar) and delete. Switching assigned exercise with an unsaved draft prompts Save vs Discard.

---

## Tech stack (this module)

| File | Role | ~lines |
|------|------|--------|
| `views/tabularize-exercises.php` | `#bar-controls` accordion + History/Save toolbar | (shared shell) |
| `assets/js/session-history.js` | Assign, guards, save/edit/delete, history list | ~800 |
| `assets/js/control-bar.js` | Accordion open/close, `--bar-controls-height`, history-expanded | ~110 |
| `assets/js/countdown.js` | Timer state machine | ~151 |
| `assets/js/reps.js` | Sets table + modal copy string | ~136 |
| `assets/css/includes/session-history.css` | History panel + end toolbar layout | ~436 |
| `assets/css/includes/control-bar.css` | Session bar chrome | ~554 |
| IDB helpers in `tabularize-exercises.js` | `loadSessionHistory` / `saveSessionHistoryEntry` / … | near top |

---

## Architecture

```
#bar-controls
  #control-panels.session-accordion
    Exercise chip/panel  → assign name (select or card click)
    Duration chip/panel  → countdown (locked until assigned)
    Sets chip/panel      → reps table (locked until assigned)
    Reset                → duration + sets only (keeps assignment)
  .session-bar-toolbar
    History panel/list   → edit / delete entries
    Save / Update        → FitnessSessionHistoryStore
```

Bridge API: `window.sessionHistoryUi` (near end of `session-history.js`) exposes `setAssignedExercise`, `populateExercisePick`, `renderHistoryList`, `assignedExerciseName`, `promptAssignExercise`. Deck selection and Outline jumps call `setAssignedExercise`.

---

## Relevant file tree

```
views/tabularize-exercises.php          # Session bar markup (~middle of body)
assets/js/session-history.js
assets/js/control-bar.js
assets/js/countdown.js
assets/js/reps.js
assets/css/includes/session-history.css
assets/css/includes/control-bar.css
assets/css/includes/countdown.css
assets/css/includes/reps.css
assets/js/tabularize-exercises.js       # IDB store + CRUD helpers (top ~15%)
```

Script load order in PHP (near end): `tabularize-exercises.js` → `control-bar.js` → `countdown.js` → `modal.js` → `reps.js` → `session-history.js`.

---

## High-level code flow

### IndexedDB (top of `tabularize-exercises.js`)

- `window.dbVersion = 4`
- Store `FitnessSessionHistoryStore` (keyPath `id`), indexes `pageKeyIndex`, `createdAtIndex`
- `upgradeDb`: create missing stores only (no wipe)
- Helpers: `newSessionHistoryId`, `loadSessionHistory(pageKey)`, `saveSessionHistoryEntry`, `deleteSessionHistoryEntry`
- `loadSessionHistory` filters by `pageKey` (default `getWebpageIdentifier()`), newest `createdAt` first

Entry shape (written in `saveCurrentSession`, ~middle of `session-history.js`):

```js
{
  id,                    // uuid or sess-…
  pageKey,               // md-file query value
  exerciseName,
  createdAt, updatedAt,  // ISO strings
  sets: [{ reps, wt }, …],
  durationSec            // from window.countdown.timeCap
}
```

### Assign + guards (`session-history.js`)

- Near the top: `assignedExerciseName`, `hasSessionDraft`, `setAssignedExercise`
- Switching exercise with a draft → confirm: OK = save then switch+reset; Cancel = discard then switch+reset
- `updateSessionGuards`: Save / Duration / Sets disabled until an exercise is assigned (`is-disabled` / `is-locked`)
- Card click / Outline jump / Random path can call `sessionHistoryUi.setAssignedExercise`
- Deck ready: MutationObserver + `fd-deck-ready` → `populateExercisePick`

### Save / History UI

- Save builds entry from assignment + `collectSetsFromTable` + countdown cap; edit mode sets Save label to “Update”
- `renderHistoryList` fills `#session-history-list` (empty state vs rows with Edit/Delete)
- History chip toggles `#session-history-panel`; `syncSessionBarHistoryExpanded` (in `control-bar.js`) sets `history-expanded` on bar/tools and syncs mobile bar height CSS var

### Reset

`#session-reset-btn` resets **duration and sets only** (keeps assigned exercise). Does not clear history.

### Accordion (`control-bar.js`)

- One `.control-panel` open at a time (`closeAllSessionPanels`)
- Mobile (`max-width: 768px`): measure bar height → `--bar-controls-height` so tools stay clear of the bar

---

## DOM hooks

| Id / class | Role |
|------------|------|
| `#bar-controls` | Session bar root |
| `#session-exercise-name` | Assigned name + `data-exercise` |
| `#session-exercise-pick` | Dropdown of page exercises |
| `#session-time-panel` / `#session-reps-panel` | Duration / sets panels |
| `#session-reset-btn` | Reset duration+sets |
| `#session-history-panel` / `#session-history-list` | History UI |
| `#session-history-chip` / `#session-save-btn` | End toolbar |
| `.history-expanded` | Bar/tools layout when history open |
| `.session-needs-exercise` / `.is-locked` | Guard styling |

---

## Safe-edit notes

1. Keep IDB helpers in `tabularize-exercises.js` and UI in `session-history.js`; do not duplicate open/upgrade logic.
2. Bump `?v=` on `session-history.js` / related CSS includes (via main CSS `?v=`) when shipping changes.
3. Preserve `window.sessionHistoryUi` surface—deck and Outline depend on `setAssignedExercise`.
4. Adding fields to history entries: keep `put` backward-compatible for older records missing new keys.
5. Reset must not delete history rows or clear the assigned exercise unless product intent changes.
