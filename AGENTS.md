# AGENTS

Guidance for AI agents working in this repository.

## Skills (dynamic)

Project skills live under:

```
.agents/skills/<skill-name>/SKILL.md
```

**Do not treat any hardcoded skill list in docs as authoritative.** When the user asks what skills are available, or before claiming a skill exists:

1. List directories in `.agents/skills/`.
2. For each directory that contains a `SKILL.md`, read its YAML frontmatter (`name`, `description`).
3. Present that live inventory.

Optional scripts for a skill live in `.agents/skills/<skill-name>/scripts/`.

### How users invoke skills

- Ask in chat (e.g. “run the add-exercise-media skill” / “sync exercise images”).
- Or open the skill’s `SKILL.md` and follow it.
- Human-oriented writeup for media sync: [README-Skill add images to new exercises.md](README-Skill%20add%20images%20to%20new%20exercises.md)

## Product notes

- Content: `md-file/` markdown tables (one folder deep).
- Progress: browser IndexedDB / localStorage (no accounts).
- Entry: `views/list-directories.php`; session UI: `views/tabularize-exercises.php`.
- Exercise demo media manifests: `assets/data/exercise-media-*.json` + `exercise-media-index.json`.
