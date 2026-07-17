#!/usr/bin/env python3
"""
Keep Fitness Deck markdown "Instructions" cells fresh when exercises are added.

Modes:
  - All pages (default): every md-file/**/*.md that already has an Instructions
    column, or is already tracked in the index (except .up.md)
  - One page: --page "Folder/File" (adds Instructions column if missing)

Internal state (assets/data/exercise-instructions-index.json):
  mdSha256 + mdMtimeMs + exerciseNames + which rows have non-empty instructions.
  When the file changes, diff for new / blank instruction rows and fill only those
  (unless --force).

Usage:
  python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --check
  python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py
  python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --ensure-column
  python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --page "Bodybuilding - Minimum Equipment/Chest"
  python3 .agents/skills/add-exercise-instructions/scripts/sync_exercise_instructions.py --force --page "Bodybuilding - Minimum Equipment/Chest"
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
MD_ROOT = REPO_ROOT / "md-file"
DATA_DIR = REPO_ROOT / "assets" / "data"
INDEX_PATH = DATA_DIR / "exercise-instructions-index.json"
FREE_EXERCISE_DB_URL = (
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
)

INSTR_HEADER = "Instructions"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def file_mtime_ms(path: Path) -> int:
    return int(path.stat().st_mtime * 1000)


def load_index() -> dict:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    return {"updatedAt": None, "pages": {}}


def save_index(index: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    index["updatedAt"] = utc_now()
    INDEX_PATH.write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")


def split_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def is_sep_row(parts: list[str]) -> bool:
    if not parts:
        return False
    return all(re.fullmatch(r":?-{3,}:?", p or "") for p in parts)


def parse_table(md_path: Path) -> tuple[list[str], list[list[str]], list[str]]:
    """Return (headers, data_rows, raw_non_table_prefix_lines)."""
    lines = md_path.read_text(encoding="utf-8", errors="replace").splitlines()
    header_idx = None
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "exercise" in line.lower():
            header_idx = i
            break
    if header_idx is None:
        return [], [], lines

    headers = split_row(lines[header_idx])
    sep_idx = header_idx + 1
    rows: list[list[str]] = []
    for line in lines[sep_idx + 1 :]:
        if not line.strip().startswith("|"):
            break
        parts = split_row(line)
        if is_sep_row(parts):
            continue
        if not parts or not parts[0]:
            continue
        name = parts[0].replace("\\n", " ").strip()
        if name.lower() in ("exercise", "exercise name"):
            continue
        if name.lstrip("\\").lstrip("*").lower().startswith("note"):
            continue
        while len(parts) < len(headers):
            parts.append("")
        rows.append(parts[: len(headers)] if len(parts) > len(headers) else parts)

    prefix = lines[:header_idx]
    return headers, rows, prefix


def find_instruction_index(headers: list[str]) -> int:
    for i, h in enumerate(headers):
        if re.search(r"instruction", h, re.I):
            return i
    return -1


def ensure_instructions_column(
    headers: list[str], rows: list[list[str]]
) -> tuple[list[str], list[list[str]], int]:
    idx = find_instruction_index(headers)
    if idx >= 0:
        return headers, rows, idx

    # Insert after Exercise (col 0)
    new_headers = [headers[0], INSTR_HEADER] + headers[1:]
    new_rows = []
    for row in rows:
        name = row[0] if row else ""
        rest = row[1:] if len(row) > 1 else []
        new_rows.append([name, ""] + rest)
    return new_headers, new_rows, 1


def page_has_instructions_column(md_path: Path) -> bool:
    headers, _, _ = parse_table(md_path)
    return find_instruction_index(headers) >= 0


def discover_page_keys(include_without_column: bool, index: dict) -> list[str]:
    tracked = set((index.get("pages") or {}).keys())
    keys = []
    for path in sorted(MD_ROOT.rglob("*.md")):
        if path.name.endswith(".up.md"):
            continue
        rel = path.relative_to(MD_ROOT).as_posix()
        if not rel.endswith(".md"):
            continue
        page_key = rel[:-3]
        if include_without_column or page_key in tracked or page_has_instructions_column(path):
            keys.append(page_key)
    return keys


def render_table(headers: list[str], rows: list[list[str]]) -> str:
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(cell))

    def fmt(parts: list[str]) -> str:
        cells = []
        for i, h in enumerate(headers):
            val = parts[i] if i < len(parts) else ""
            cells.append(val)
        return "| " + " | ".join(cells) + " |"

    sep = "|" + "|".join("-" * (w + 2) for w in widths) + "|"
    # Prefer simple dash separators matching existing chest style
    sep = "|" + "|".join("-" * max(3, len(h) + 2) for h in headers) + "|"
    out = [fmt(headers), sep]
    for row in rows:
        out.append(fmt(row))
    return "\n".join(out) + "\n"


def write_table(md_path: Path, prefix: list[str], headers: list[str], rows: list[list[str]]) -> None:
    body = render_table(headers, rows)
    text = ("\n".join(prefix) + ("\n" if prefix else "")) + body
    md_path.write_text(text, encoding="utf-8")


def patch_instruction_cells(
    md_path: Path, instr_idx: int, updates: dict[str, str]
) -> int:
    """Replace blank/force instruction cells in-place without rewriting the whole table."""
    if not updates:
        return 0
    lines = md_path.read_text(encoding="utf-8", errors="replace").splitlines()
    changed = 0
    out = []
    for i, line in enumerate(lines):
        if i < 2 or not line.strip().startswith("|"):
            out.append(line)
            continue
        parts = split_row(line)
        if is_sep_row(parts) or not parts:
            out.append(line)
            continue
        name = parts[0].replace("\\n", " ").strip()
        if name not in updates:
            out.append(line)
            continue
        while len(parts) <= instr_idx:
            parts.append("")
        parts[instr_idx] = updates[name]
        out.append("| " + " | ".join(parts) + " |")
        changed += 1
    if changed:
        md_path.write_text("\n".join(out) + "\n", encoding="utf-8")
    return changed


def norm_name(s: str) -> str:
    s = s.lower()
    s = re.sub(r"\([^)]*\)", " ", s)
    s = s.replace("-", " ")
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace("push ups", "push up").replace("pushups", "push up")
    s = s.replace("flyes", "fly").replace("flye", "fly")
    return s


def fetch_free_exercise_db() -> dict[str, list[str]]:
    """Map normalized name -> instruction steps."""
    try:
        req = urllib.request.Request(FREE_EXERCISE_DB_URL, headers={"User-Agent": "fitness-deck-sync"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode())
    except Exception as exc:
        print(f"Warning: could not fetch free-exercise-db ({exc}); using pattern generator only.")
        return {}
    out: dict[str, list[str]] = {}
    for ex in data:
        name = ex.get("name") or ""
        steps = ex.get("instructions") or []
        if name and steps:
            out[norm_name(name)] = steps
    return out


def compress_steps(steps: list[str], limit: int = 240) -> str:
    text = re.sub(r"\s+", " ", " ".join(steps)).strip()
    if len(text) <= limit:
        return text
    text = re.sub(r"\s+", " ", " ".join(steps[:2])).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rsplit(" ", 1)[0] + "…"


def pattern_instruction(name: str) -> str:
    n = name.lower()

    if "bulgarian" in n:
        return (
            "Rear foot elevated on a bench, front foot planted. Hold a dumbbell at the chest or sides, "
            "lower the front thigh toward parallel, then drive up. Keep torso upright."
        )
    if "archer" in n and "dip" in n:
        return (
            "Support on parallel bars or a sturdy bench edge. Shift load onto one arm as you lower, "
            "keeping the other arm straighter; press back up and alternate sides."
        )
    if "archer" in n and "fly" in n:
        return (
            "Anchor a band behind you. Press one arm out in a fly arc while the other stays extended "
            "with light tension; return and switch sides with control."
        )
    if "archer" in n:
        return (
            "Start in a wide push-up. Shift your chest toward one hand as you lower, keeping the opposite "
            "arm straighter; press up and alternate sides."
        )
    if "spiderman chest crawl" in n:
        return (
            "From a high plank, step one foot toward the same-side hand while staying low, then advance "
            "the opposite hand and foot forward in a crawling pattern."
        )
    if "spiderman" in n:
        return (
            "From a push-up stance, lower your chest while driving one knee toward the same-side elbow; "
            "press up and alternate sides each rep."
        )
    if "t-rotation" in n or "t rotation" in n:
        return (
            "Perform a push-up, then rotate into a side plank, reaching the top arm toward the ceiling. "
            "Return to plank and alternate sides."
        )
    if "renegade" in n:
        return (
            "In a push-up position on dumbbells, do a push-up, then row one dumbbell to the hip while "
            "bracing the core. Alternate rows between push-ups."
        )
    if "side plank" in n:
        return (
            "Complete a push-up, then open into a side plank on one hand. Hold briefly, return to plank, "
            "and alternate sides."
        )
    if "knee tuck" in n:
        return (
            "Hands on floor (or Swiss ball), do a push-up, then draw one or both knees toward the chest "
            "under control before extending again."
        )
    if "push-up to pike" in n or "push up to pike" in n:
        return (
            "From a push-up position, perform a push-up, then pike the hips up so the body forms an "
            "inverted V; return to plank and repeat."
        )
    if "single-arm balance" in n or "single arm balance" in n:
        return (
            "Do a push-up, then shift onto one hand and lift the other briefly while keeping hips square. "
            "Alternate arms across reps."
        )
    if "push-up jacks" in n or "push up jacks" in n:
        return (
            "In plank, jump the feet out and in (jumping-jack pattern) between or during push-up reps "
            "while keeping the torso stable."
        )
    if "push-up plus" in n or "push up plus" in n:
        return (
            "Do a full push-up, then at the top protract the shoulder blades to round the upper back "
            "slightly (the “plus”), and reverse."
        )
    if "eccentric" in n:
        return (
            "From a strong plank, lower the chest to the floor as slowly as you can (3–5 seconds). "
            "Reset to the top by dropping to knees or pressing up."
        )
    if "clapping" in n or "clap" in n:
        return (
            "Explode from the bottom of a push-up so the hands leave the floor; clap (if able) and "
            "soft-land back into the next rep with elbows tracking."
        )
    if "plyometric" in n and "dip" in n:
        return (
            "On a bench or bars, dip down then drive up hard enough that the hands briefly unload; "
            "catch softly and immediately control the next descent."
        )
    if "plyometric" in n and ("medicine" in n or "chest pass" in n):
        return (
            "From a push-up or standing stance, explosively pass or push the medicine ball into a wall "
            "(or partner), catch/reset, and repeat with a braced core."
        )
    if "plyometric" in n:
        return (
            "Lower into a push-up and drive up explosively so the hands leave the floor; land soft, "
            "immediately load the next rep, and keep the body rigid."
        )
    if "lateral medicine ball" in n or "wall throw" in n:
        return (
            "Stand sideways to a wall, rotate through the torso, and throw the medicine ball into the "
            "wall at chest height. Catch the rebound and repeat."
        )
    if "chest pass" in n:
        return (
            "Hold a medicine ball at the chest, step or brace, and pass it forcefully into a wall or "
            "to a partner. Catch and absorb, then repeat."
        )
    if "chest slides" in n or "sliding chest fly" in n:
        return (
            "In a plank on a smooth floor with towels under the hands, slide the hands out into a wide "
            "fly while hips stay level, then squeeze the chest to slide back in."
        )
    if "isometric" in n and "fly" in n:
        return (
            "With a band or light load, open the arms into a fly position and hold mid-range under "
            "tension. Keep a soft elbow bend and squeeze the chest."
        )
    if "isometric" in n and "press" in n:
        return (
            "Set a band or press into an immovable surface at mid-press range and drive forward hard "
            "without moving. Brace the core and keep wrists stacked."
        )
    if "isometric" in n and ("squeeze" in n or "push" in n):
        return (
            "Press palms together or pull a band into a chest-height squeeze and hold. Breathe steadily "
            "while keeping tension through the pecs."
        )
    if "push-up hold" in n or "push up hold" in n:
        return (
            "Hold the top or mid-range of a push-up with a rigid plank line. Squeeze the chest and "
            "glutes; do not let the hips sag."
        )
    if "pullover" in n:
        return (
            "Lie on your back (or bench), hold a dumbbell/band above the chest, lower it in an arc "
            "overhead with soft elbows, then pull back over the chest."
        )
    if "pulldown" in n:
        return (
            "Anchor a band high. Pull the handles down and in toward the upper chest in a hugging path, "
            "squeeze, then return slowly."
        )
    if "dip" in n:
        return (
            "Support on bars or a bench. Lean the torso slightly forward, lower until shoulders are "
            "below elbows (comfortable range), then press up."
        )
    if "diamond" in n:
        return (
            "Hands close under the chest forming a diamond/triangle. Lower with elbows tucked toward "
            "the ribs, then press up—biasing inner chest and triceps."
        )
    if "close-grip" in n or "close grip" in n:
        return (
            "Hands narrower than shoulders. Lower the chest between the hands with elbows closer to "
            "the body, then press up."
        )
    if "wide-grip" in n or "wide grip" in n:
        return (
            "Hands wider than shoulders. Lower the chest with a controlled elbow flare, then press "
            "up—biasing the outer chest."
        )
    if "pike" in n:
        return (
            "Hips high in an inverted-V. Bend the elbows to lower the head/shoulders toward the floor, "
            "then press back up—upper chest and shoulders."
        )
    if "decline" in n and "push" in n:
        return (
            "Feet elevated, hands on the floor. Keep a straight line from head to heels as you lower "
            "the chest and press up (upper-chest bias)."
        )
    if "incline" in n and "push" in n:
        return (
            "Hands elevated on a bench/box. Lower the chest to the edge with a rigid plank line, then "
            "press up (easier than flat; upper-chest friendly)."
        )
    if "fly" in n:
        return (
            "Arms open in a wide arc with soft elbows (dumbbells, band, or rings), stretch the chest, "
            "then hug the load back together over the chest."
        )
    if "press" in n:
        return (
            "From chest level, press the load forward or upward to full extension, squeeze the chest, "
            "then lower under control to the start."
        )
    if "squeeze" in n:
        return (
            "Press palms together or squeeze a band/ball at chest height. Drive inward hard, keep "
            "shoulders down, and breathe through the hold or reps."
        )
    if "bosu" in n or "swiss ball" in n or "stability ball" in n or "medicine ball" in n:
        return (
            f"Set up for {name} on the unstable surface. Brace the core, move through a full "
            "comfortable range, and slow the tempo if balance is the limiter."
        )
    if "band" in n or "resistance band" in n:
        return (
            f"Anchor or hold the band for {name}. Keep tension through the set, move with control, "
            "and avoid shrugging the shoulders."
        )
    if "push-up" in n or "push up" in n:
        return (
            "High plank, hands under shoulders. Lower the chest toward the floor with a rigid body "
            "line, then press back up without sagging the hips."
        )
    if "plank" in n:
        return (
            "Support on forearms or hands with a straight line from head to heels. Brace the core, "
            "squeeze glutes, and breathe steadily without letting the hips sag."
        )
    if "crunch" in n or "sit-up" in n or "sit up" in n:
        return (
            "Lie on your back with knees bent. Curl the ribs toward the hips under control, pause "
            "briefly, then lower without yanking the neck."
        )
    if "row" in n:
        return (
            "Hinge or hang as the variation requires, pull the elbows back to drive the shoulder "
            "blades together, then return under control."
        )
    if "curl" in n:
        return (
            "Keep elbows close to the torso, curl the load up without swinging, squeeze at the top, "
            "then lower slowly."
        )
    if "squat" in n or "lunge" in n:
        return (
            "Brace the core, sit the hips down/back through a comfortable depth with knees tracking "
            "over mid-foot, then drive up to stand tall."
        )
    if "stretch" in n:
        return (
            f"Move into {name} until you feel a gentle stretch (not pain). Breathe steadily and hold "
            "or pulse as the variation describes."
        )

    return (
        f"Set up for {name} using the standard variation. Move through a full comfortable range with "
        "a braced core, controlled tempo, and steady breathing."
    )


def instruction_for(name: str, db: dict[str, list[str]]) -> str:
    text = pattern_instruction(name)
    key = norm_name(name)
    steps = db.get(key)
    if not steps:
        # loose contains match
        cands = []
        for k, v in db.items():
            if key in k or k in key:
                cands.append((abs(len(k) - len(key)), v))
        cands.sort(key=lambda x: x[0])
        steps = cands[0][1] if cands else None
    if text.startswith("Set up for ") and steps:
        return compress_steps(steps).replace("|", "/")
    return text.replace("|", "/")


def blank(cell: str) -> bool:
    t = (cell or "").strip().lower()
    return not t or t in {"-", "—", "n/a", "..", "…"}


def analyze_page(md_path: Path) -> dict:
    headers, rows, prefix = parse_table(md_path)
    if not headers:
        return {
            "headers": [],
            "rows": [],
            "prefix": prefix,
            "instr_idx": -1,
            "names": [],
            "missing": [],
            "filled": [],
        }
    instr_idx = find_instruction_index(headers)
    names = [r[0] for r in rows]
    missing = []
    filled = []
    if instr_idx >= 0:
        for r in rows:
            cell = r[instr_idx] if instr_idx < len(r) else ""
            if blank(cell):
                missing.append(r[0])
            else:
                filled.append(r[0])
    else:
        missing = list(names)
    return {
        "headers": headers,
        "rows": rows,
        "prefix": prefix,
        "instr_idx": instr_idx,
        "names": names,
        "missing": missing,
        "filled": filled,
    }


def sync_page(
    page_key: str,
    index: dict,
    *,
    force: bool,
    check_only: bool,
    ensure_column: bool,
    db: dict[str, list[str]],
) -> dict:
    md_path = MD_ROOT / f"{page_key}.md"
    if not md_path.exists():
        return {"pageKey": page_key, "status": "missing-md"}

    prev = (index.get("pages") or {}).get(page_key) or {}
    mtime_ms = file_mtime_ms(md_path)
    digest = sha256_file(md_path)
    sha_changed = prev.get("mdSha256") != digest
    mtime_changed = prev.get("mdMtimeMs") != mtime_ms

    info = analyze_page(md_path)
    names = info["names"]
    prev_names = set(prev.get("exerciseNames") or [])
    added = [n for n in names if n not in prev_names]
    removed = [n for n in prev_names if n not in set(names)]
    missing = info["missing"]
    has_column = info["instr_idx"] >= 0

    if not has_column and not ensure_column and page_key not in (index.get("pages") or {}):
        return {
            "pageKey": page_key,
            "status": "skipped-no-column",
            "exerciseCount": len(names),
            "addedSinceSync": added,
            "missingCount": len(names),
        }

    # Fill only blank instruction cells (or all rows with --force). New rows with
    # existing text are left alone; they still show up in addedSinceSync for diffs.
    needs_fill = force or bool(missing) or (not has_column and ensure_column)
    needs_index_refresh = (not prev) or (
        bool(prev) and (sha_changed or mtime_changed or bool(added) or bool(removed)) and not needs_fill
    )
    needs_work = force or needs_fill or needs_index_refresh

    if check_only:
        # Stale when untracked, blanks to fill, roster/hash drift needing index refresh, or --force
        status = "stale" if (force or needs_fill or needs_index_refresh) else "ok"
        return {
            "pageKey": page_key,
            "status": status,
            "shaChanged": sha_changed,
            "mtimeChanged": mtime_changed,
            "hasInstructionsColumn": has_column,
            "addedSinceSync": added,
            "removedSinceSync": removed,
            "needsInstructions": names if force else missing,
            "exerciseCount": len(names),
            "filledCount": len(info["filled"]),
            "missingCount": len(missing) if has_column else len(names),
            "lastSyncedAt": prev.get("lastSyncedAt"),
        }

    if not needs_work:
        return {
            "pageKey": page_key,
            "status": "ok",
            "exerciseCount": len(names),
            "filledCount": len(info["filled"]),
            "missingCount": len(missing),
            "addedSinceSync": [],
            "needsInstructions": [],
            "wroteMarkdown": False,
        }

    headers, rows, prefix = info["headers"], info["rows"], info["prefix"]
    wrote_md = False
    filled_targets: list[str] = []

    if needs_fill:
        column_was_missing = not has_column
        headers, rows, instr_idx = ensure_instructions_column(headers, rows)
        if force:
            targets = {r[0] for r in rows}
        else:
            targets = {
                r[0] for r in rows if blank(r[instr_idx] if instr_idx < len(r) else "")
            }
        updates: dict[str, str] = {}
        for row in rows:
            name = row[0]
            if name not in targets:
                continue
            if force or blank(row[instr_idx]):
                text = instruction_for(name, db)
                row[instr_idx] = text
                updates[name] = text
                filled_targets.append(name)

        if column_was_missing:
            write_table(md_path, prefix, headers, rows)
            wrote_md = True
        elif updates:
            patch_instruction_cells(md_path, instr_idx, updates)
            wrote_md = True

    # Snapshot current instruction coverage (after optional write)
    info = analyze_page(md_path)
    names = info["names"]
    filled_names = []
    missing = []
    if info["instr_idx"] >= 0:
        for r in info["rows"]:
            cell = r[info["instr_idx"]] if info["instr_idx"] < len(r) else ""
            if blank(cell):
                missing.append(r[0])
            else:
                filled_names.append(r[0])
    else:
        missing = list(names)

    mtime_ms = file_mtime_ms(md_path)
    digest = sha256_file(md_path)

    index.setdefault("pages", {})[page_key] = {
        "mdPath": str(md_path.relative_to(REPO_ROOT)),
        "mdMtimeMs": mtime_ms,
        "mdSha256": digest,
        "exerciseNames": names,
        "instructionNames": filled_names,
        "missingNames": missing,
        "filledCount": len(filled_names),
        "missingCount": len(missing),
        "lastSyncedAt": utc_now(),
    }

    return {
        "pageKey": page_key,
        "status": "synced" if wrote_md else "indexed",
        "shaChanged": sha_changed,
        "mtimeChanged": mtime_changed,
        "addedSinceSync": added,
        "needsInstructions": filled_targets,
        "exerciseCount": len(names),
        "filledCount": len(filled_names),
        "missingCount": len(missing),
        "wroteMarkdown": wrote_md,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync exercise Instructions columns in md-file tables")
    parser.add_argument(
        "--page",
        help='One page only (e.g. "Bodybuilding - Minimum Equipment/Chest"). Omit for tracked / column pages.',
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate instructions for all rows on selected page(s)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Report stale vs ok from index state (no writes); exit 1 if any stale",
    )
    parser.add_argument(
        "--ensure-column",
        action="store_true",
        help="When syncing, add an Instructions column if the page lacks one (implied for --page)",
    )
    args = parser.parse_args()

    index = load_index()
    ensure_column = bool(args.ensure_column or args.page)

    if args.page:
        pages = [args.page]
    else:
        # With --ensure-column, process every md page (add Instructions where missing).
        pages = discover_page_keys(
            include_without_column=ensure_column,
            index=index,
        )

    db: dict[str, list[str]] = {}
    if not args.check:
        print("Fetching free-exercise-db instructions catalog…")
        db = fetch_free_exercise_db()
        print(f"Catalog entries: {len(db)}")

    results = []
    for page_key in pages:
        results.append(
            sync_page(
                page_key,
                index,
                force=args.force,
                check_only=args.check,
                ensure_column=ensure_column,
                db=db,
            )
        )

    if not args.check:
        if args.page:
            # Keep other pages in index; only refresh selected
            pass
        else:
            living = set(pages) | {
                r["pageKey"] for r in results if r.get("status") in ("synced", "indexed", "ok")
            }
            index["pages"] = {k: v for k, v in (index.get("pages") or {}).items() if k in living}
        save_index(index)

    print("\n=== Summary ===")
    for r in results:
        pk = r.get("pageKey", "?")
        status = r.get("status", "?")
        filled = r.get("filledCount", 0)
        total = r.get("exerciseCount", 0)
        missing = r.get("missingCount", 0)
        added = r.get("addedSinceSync") or []
        needs = r.get("needsInstructions") or []
        extra = ""
        if added:
            extra += f" +{len(added)} new"
        if needs and status in ("stale", "synced"):
            extra += f" fill={len(needs)}"
        print(f"{status:18} {pk}: {filled}/{total} instructed ({missing} blank){extra}")
        if args.check and needs:
            for name in needs[:12]:
                print(f"    - {name}")
            if len(needs) > 12:
                print(f"    … +{len(needs) - 12} more")

    if args.check:
        stale_n = sum(1 for r in results if r.get("status") == "stale")
        ok_n = sum(1 for r in results if r.get("status") == "ok")
        print(f"\nok={ok_n} stale={stale_n}")
        return 1 if stale_n else 0

    print(f"\nDone. Updated index: {INDEX_PATH.relative_to(REPO_ROOT)}")
    wrote = sum(1 for r in results if r.get("wroteMarkdown"))
    print(f"Pages with markdown writes this run: {wrote} / {len(results)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
