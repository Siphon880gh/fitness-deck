# AGENTS

Guidance for AI agents working in this repository.

## Skills (dynamic — authoritative)

Project skills live under:

```
.agents/skills/<skill-name>/SKILL.md
```

**Do not treat any hardcoded skill list in docs (including this file’s examples) as authoritative.** Skills are added and removed by changing that directory.

### When the user asks what skills are possible

Or before claiming a skill exists:

1. List directories in `.agents/skills/`.
2. For each directory that contains a `SKILL.md`, read its YAML frontmatter (`name`, `description`).
3. Present that **live inventory** (name + description). Optionally mention companion human READMEs if present at repo root (`README-Skill *.md`).

Do **not** answer from memory of an older chat or an outdated bullet list.

### How users invoke skills

- Ask in chat (e.g. “what skills are available?”, “run the add-exercise-instructions skill”, “sync exercise images”).
- Or open the skill’s `SKILL.md` and follow it.
- Human-oriented writeups (when present):
  - [README-Skill add images to new exercises.md](README-Skill%20add%20images%20to%20new%20exercises.md)
  - [README-Skill add exercise instructions.md](README-Skill%20add%20exercise%20instructions.md)

Optional scripts for a skill live in `.agents/skills/<skill-name>/scripts/`.

## Product notes

- Content: `md-file/` markdown tables (one folder deep).
- Progress: browser IndexedDB / localStorage (no accounts).
- Entry: `views/list-directories.php`; session UI: `views/tabularize-exercises.php`.
- Exercise demo media: `assets/data/exercise-media-*.json` + `exercise-media-index.json` (skill: scan `.agents/skills/` for media sync).
- Exercise instructions column tracking: `assets/data/exercise-instructions-index.json` (skill: scan `.agents/skills/` for instructions sync).
