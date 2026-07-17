# AGENTS_CODE_REFERENCE-directory.md

AI-oriented map of the **home / program directory** surface.

**Approximate location cues are intentional.** Do not treat them as exact line numbers.

Parent overview: [AGENTS_CODE_REFERENCE.md](AGENTS_CODE_REFERENCE.md)

---

## What this module does

Lists exercise markdown pages under `md-file/`, grouped by goal (Stretch / Build / Mobility / Rehab / Cardio) or alphabetically. Offers “Continue” for the last opened session and stores listing mode prefs in localStorage.

---

## Tech stack (this module)

- PHP: `views/list-directories.php` + `views/includes/ld-include.php`
- JS: `assets/js/list-directories.js` (~228 lines), `assets/js/common-sense-directories.js` (~15 lines)
- Static HTML fragment: `assets/js/common-sense-view.html` (~47 lines)
- CSS: `assets/css/list-directories.css` (~335 lines), tokens via `assets/css/tokens.css`
- Config: `icons.config.js` (folder display icons)

---

## Architecture

```
index.php (no md-file)
  → ld-include.php builds $relativePaths
  → list-directories.php shell + window.dirs JSON
  → list-directories.js
       ├─ Continue session (localStorage FitnessDeck__lastOpened)
       ├─ Goal chips → scroll to #goal-*
       └─ Mode: AREAS → common-sense-view.html | ALPHAB → build from window.dirs
```

---

## Relevant file tree

```
views/
  list-directories.php
  includes/ld-include.php
assets/js/
  list-directories.js
  common-sense-directories.js
  common-sense-view.html
assets/css/
  list-directories.css
  tokens.css
icons.config.js
md-file/                    # source of listed pages
```

---

## High-level code flow

### Path discovery (`ld-include.php`)

Near the middle of the file: recursive `glob_recursive` on `md-file/*\.md`, then filter out paths ending in `.up.md`. Maps to relative paths `Folder/File.md` for the client.

```php
// views/includes/ld-include.php — around the filtering block
$filepaths = array_values(array_filter($filepaths, function($filepath) {
    return substr($filepath, -6) !== '.up.md';
}));
```

### Shell (`list-directories.php`)

Hero brand, Continue section (`#continue-session`), goal chips (`data-goal`), mode toggle (`#mode-areas` / `#mode-alphab`), empty `<ul class="dirs">`. Near the end, PHP embeds `window.dirs` via `json_encode($relativePaths)`.

### Listing modes (`list-directories.js`)

- Near the top: `getLastOpened` / `renderContinueSession` / `handleLastOpened` — MRU list (max 8), links `?md-file=…`.
- Middle: `initIndexAllUI` — A–Z from sorted `window.dirs`; folder rows get `data-folder`; files are links with `data-path`. Optional icons from `icons.config.js` when `displayName` matches folder.
- `setIndexMode` / `loadIndexInitial` — persist `FitnessDeck__indexMode` (`AREAS` default).
- `intIndexBinnedUI` → `sortIntoAreas()` in `common-sense-directories.js` replaces `.intro` with curated HTML from `common-sense-view.html`, then re-hydrates click handlers and last-opened badges.
- Goal chips: if not in AREAS mode, switch to AREAS then smooth-scroll to `#goal-stretch` etc.

### Curated AREAS HTML (`common-sense-view.html`)

Hardcoded `<li class="goal-heading" id="goal-…">` and file links. **When adding a new md page that should appear in By-goal mode, update this HTML** (ALPHAB mode picks it up automatically from the glob).

---

## Content / URL contract

- Query: `?md-file=Folder/File.md` (`.md` optional; router strips it for the session view).
- One folder deep only; ALPHAB listing uses `segments[0]` folder and `segments[1]` file.
- Folders whose display name starts with `-` have that token stripped for labels in ALPHAB mode.

---

## Safe-edit notes

1. New program folders: add under `md-file/`, update `common-sense-view.html` for AREAS, optionally `icons.config.js`.
2. Do not list `.up.md` in the directory (already filtered in PHP).
3. Preserve `data-path` on anchors—Continue and last-opened annotations depend on it.
