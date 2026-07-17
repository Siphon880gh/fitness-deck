#!/usr/bin/env python3
"""
Sync open-source exercise demo media onto Fitness Deck markdown pages.

Modes:
  - All pages (default): discover every md-file/**/*.md (except .up.md)
  - One page: --page "Folder/File"

Internal state (assets/data/exercise-media-index.json):
  mdSha256 + exerciseNames from last sync. Without --force, only pages that
  need work are updated (never synced, sha changed, or new exercise names).

Usage:
  python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check
  python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py
  python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --page "Bodybuilding - Minimum Equipment/Back"
  python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --force
  python3 .agents/skills/add-exercise-media/scripts/sync_exercise_media.py --check --page "Stretch/Hips"
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
INDEX_PATH = DATA_DIR / "exercise-media-index.json"
CATALOG_URL = (
    "https://raw.githubusercontent.com/anil-g11h/exercises-dataset/main/data/exercises.json"
)
MEDIA_BASE = "https://raw.githubusercontent.com/anil-g11h/exercises-dataset/main"

ATTRIBUTION = {
    "text": (
        "Exercise animations provided by ExerciseDB / Fitness Exercises Dataset. "
        "Gym visuals via AscendAPI ExerciseDB. Non-commercial use; attribution required."
    ),
    "links": [
        {
            "label": "Kaggle dataset",
            "url": "https://www.kaggle.com/datasets/exercisedb/fitness-exercises-dataset/data",
        },
        {
            "label": "ExerciseDB OSS API",
            "url": "https://oss.exercisedb.dev",
        },
        {
            "label": "exercises-dataset",
            "url": "https://github.com/anil-g11h/exercises-dataset",
        },
    ],
}

# pageKey (relative to md-file, no .md) -> catalog filters
PAGE_FILTERS = {
    "Bodybuilding - Minimum Equipment/Chest": {
        "body_parts": ["chest"],
        "targets": None,
        "min_score": 0.7,
        "manual": {
            "Push-Ups": "push-up",
            "Chest Dips": "chest dip",
            "Incline Push-Ups": "incline push-up",
            "Decline Push-Ups": "decline push-up",
            "Archer Push-Ups": "archer push up",
            "Dumbbell Flyes": "dumbbell fly",
            "Dumbbell Chest Press": "dumbbell bench press",
            "Dumbbell Chest Pullover": "dumbbell pullover",
            "Medicine Ball Push-Ups": "push-up medicine ball",
            "Bosu Ball Push-Ups": "push up on bosu ball",
            "Suspended Push-Ups": "suspended push-up",
            "Push-Up Plus": "push-up plus",
            "Isometric Chest Squeeze": "isometric chest squeeze",
            "Plyometric Medicine Ball Chest Pass": "medicine ball chest pass",
            "Resistance Band Chest Press": "resistance band seated chest press",
            "Pike Push-Ups": "exercise ball pike push up",
        },
    },
    "Bodybuilding - Minimum Equipment/Abs": {
        "body_parts": ["waist"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Crunches": "crunch",
            "Plank": "plank",
            "Russian Twists": "russian twist",
            "Mountain Climbers": "mountain climber",
            "Hanging Leg Raises": "hanging leg raise",
            "Bicycle Crunches": "bicycle crunch",
            "Reverse Crunches": "reverse crunch",
            "Dead Bug": "dead bug",
            "Hollow Body Hold": "hollow hold",
            "V-Ups": "v-up",
            "Flutter Kicks": "flutter kicks",
            "Toe Touches": "jackknife sit-up",
        },
    },
    "Bodybuilding - Minimum Equipment/Back": {
        "body_parts": ["back"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Pull-Ups": "pull-up",
            "Chin-Ups": "chin-up",
            "Inverted Rows": "inverted row",
            "Superman": "superman",
            "Dumbbell Rows": "dumbbell bent over row",
            "Renegade Rows": "dumbbell renegade row",
            "Bird Dog": "bird dog",
            "Resistance Band Rows": "band seated row",
        },
    },
    "Bodybuilding - Minimum Equipment/Lats": {
        "body_parts": ["back"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Pull-Ups": "pull-up",
            "Chin-Ups": "chin-up",
            "Lat Pulldown with Resistance Band": "band straight back stiff leg deadlift",
            "Resistance Band Lat Pulldowns": "band kneeling one arm pulldown",
        },
    },
    "Bodybuilding - Minimum Equipment/Biceps": {
        "body_parts": ["upper arms"],
        "targets": ["biceps"],
        "min_score": 0.62,
        "manual": {
            "Dumbbell Curls": "dumbbell curl",
            "Hammer Curls": "dumbbell hammer curl",
            "Concentration Curls": "dumbbell concentration curl",
            "Chin-Ups": "chin-up",
            "Resistance Band Curls": "band biceps curl",
        },
    },
    "Bodybuilding - Minimum Equipment/Triceps": {
        "body_parts": ["upper arms"],
        "targets": ["triceps"],
        "min_score": 0.62,
        "manual": {
            "Diamond Push-Ups": "push-up",
            "Close Grip Push-Ups": "push-up",
            "Tricep Dips": "triceps dip",
            "Bench Dips": "bench dip",
        },
    },
    "Bodybuilding - Minimum Equipment/Shoulders": {
        "body_parts": ["shoulders"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Push-ups": "push-up",
            "Pike Push-ups": "pike push up",
            "Dumbbell Shoulder Press": "dumbbell shoulder press",
            "Dumbbell Lateral Raises": "dumbbell lateral raise",
            "Dumbbell Front Raises": "dumbbell front raise",
            "Dumbbell Rear Deltoid Flyes": "dumbbell rear fly",
            "Dumbbell Arnold Press": "arnold press",
            "Dumbbell Shrugs": "dumbbell shrug",
        },
    },
    "Bodybuilding - Minimum Equipment/Hamstrings": {
        "body_parts": ["upper legs"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Bodyweight Romanian Deadlift": "romanian deadlift",
            "Nordic Hamstring Curl": "nordic hamstring curl",
            "Swiss Ball Hamstring Curl": "exercise ball leg curl",
            "Bodyweight Glute Bridge": "bridge",
            "Walking Lunges": "lunge",
            "Bulgarian Split Squat": "dumbbell bulgarian split squat",
        },
    },
    "Bodybuilding - Minimum Equipment/Quadriceps": {
        "body_parts": ["upper legs"],
        "targets": None,
        "min_score": 0.62,
        "manual": {
            "Squats": "squat",
            "Lunges": "lunge",
            "Step-ups": "dumbbell step-up jump",
            "Bulgarian split squats": "dumbbell bulgarian split squat",
            "Jump squats": "jump squat",
            "Wall sits": "wall sit",
            "Pistol squats": "pistol squat",
            "Walking Lunges": "lunge",
        },
    },
    "Bodybuilding - Minimum Equipment/Calf": {
        "body_parts": ["lower legs"],
        "targets": None,
        "min_score": 0.58,
        "manual": {
            "Standing Calf Raises": "calf raise",
            "Seated Calf Raises": "dumbbell seated calf raise",
            "Donkey Calf Raises": "donkey calf raise",
            "Bodyweight Calf Raises": "calf raise",
            "Single-Leg Calf Raises on Bosu Ball": "one leg floor calf raise",
        },
    },
    # Stretch — search full catalog; boost names containing stretch
    "Stretch/Abs": {"body_parts": None, "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch"], "manual": {}},
    "Stretch/Ankle": {"body_parts": None, "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "ankle"], "manual": {}},
    "Stretch/Back": {"body_parts": ["back"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch"], "manual": {}},
    "Stretch/Biceps": {"body_parts": ["upper arms"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch"], "manual": {}},
    "Stretch/Calf": {"body_parts": ["lower legs"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "calf"], "manual": {}},
    "Stretch/Chest": {"body_parts": ["chest"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch"], "manual": {}},
    "Stretch/Hamstrings": {"body_parts": ["upper legs"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "hamstring"], "manual": {}},
    "Stretch/Hips": {"body_parts": ["upper legs"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "hip"], "manual": {}},
    "Stretch/Lats": {"body_parts": ["back"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "lat"], "manual": {}},
    "Stretch/Neck": {"body_parts": ["neck"], "targets": None, "min_score": 0.5, "prefer_tokens": ["stretch", "neck"], "manual": {}},
    "Stretch/Quadriceps": {"body_parts": ["upper legs"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "quad"], "manual": {}},
    "Stretch/Shins": {"body_parts": ["lower legs"], "targets": None, "min_score": 0.5, "prefer_tokens": ["stretch", "shin", "tibialis"], "manual": {}},
    "Stretch/Shoulders": {"body_parts": ["shoulders"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch"], "manual": {}},
    "Stretch/Triceps": {"body_parts": ["upper arms"], "targets": None, "min_score": 0.55, "prefer_tokens": ["stretch", "tricep"], "manual": {}},
    "Mobility/Mobility": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.55,
        "prefer_tokens": ["mobility", "stretch", "circle"],
        "manual": {},
    },
    "Cardio/10-Minute Burns": {
        "body_parts": ["cardio"],
        "targets": None,
        "min_score": 0.55,
        "prefer_tokens": ["jump", "burpee", "run", "jack"],
        "manual": {
            "Jumping Jacks": "jumping jack",
            "Burpees": "burpee",
            "High Knees": "high knee",
            "Mountain Climbers": "mountain climber",
        },
    },
    "Rehab - Shin Splints/Rehab Shin Splints": {
        "body_parts": ["lower legs"],
        "targets": None,
        "min_score": 0.5,
        "prefer_tokens": ["calf", "tibialis", "shin", "stretch"],
        "manual": {},
    },
}


def default_page_filter(page_key: str) -> dict:
    """Fallback config for any md page not listed in PAGE_FILTERS."""
    return {
        "body_parts": None,
        "targets": None,
        "min_score": 0.58,
        "prefer_tokens": [],
        "manual": {},
    }


def discover_page_keys() -> list[str]:
    keys = []
    for path in sorted(MD_ROOT.rglob("*.md")):
        if path.name.endswith(".up.md"):
            continue
        rel = path.relative_to(MD_ROOT).as_posix()
        if rel.endswith(".md"):
            keys.append(rel[:-3])
    return keys


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def slugify_page_key(page_key: str) -> str:
    s = page_key.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return "exercise-media-" + s + ".json"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def file_mtime_ms(path: Path) -> int:
    return int(path.stat().st_mtime * 1000)


def load_index() -> dict:
    if INDEX_PATH.exists():
        return json.loads(INDEX_PATH.read_text())
    return {"updatedAt": None, "catalogSource": CATALOG_URL, "pages": {}}


def save_index(index: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    index["updatedAt"] = utc_now()
    index["catalogSource"] = CATALOG_URL
    INDEX_PATH.write_text(json.dumps(index, indent=2) + "\n")


def parse_exercise_names(md_path: Path) -> list[str]:
    names = []
    lines = md_path.read_text(encoding="utf-8", errors="replace").splitlines()
    for line in lines[2:]:
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if not parts:
            continue
        name = parts[0].replace("\\n", " ").strip()
        if not name or name.startswith("---") or name.lower() == "exercise":
            continue
        if name.lower().startswith("exercise name"):
            continue
        # Skip author note rows
        if name.lstrip("\\").lstrip("*").lower().startswith("note"):
            continue
        names.append(name)
    return names


def norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r"\([^)]*\)", " ", s)
    s = s.replace("push-ups", "push up").replace("push ups", "push up").replace("push-up", "push up")
    s = s.replace("pull-ups", "pull up").replace("chin-ups", "chin up")
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def fetch_catalog() -> list[dict]:
    req = urllib.request.Request(CATALOG_URL, headers={"User-Agent": "fitness-deck-sync"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode())


def filter_catalog(catalog: list[dict], body_parts, targets) -> list[dict]:
    out = []
    for ex in catalog:
        bp = (ex.get("body_part") or "").lower()
        tg = (ex.get("target") or "").lower()
        if body_parts and bp not in body_parts:
            continue
        if targets and tg not in [t.lower() for t in targets]:
            continue
        gif_path = ex.get("gif_url") or ""
        img_path = ex.get("image") or ""
        if not gif_path:
            continue
        out.append(
            {
                "name": ex["name"],
                "norm": norm(ex["name"]),
                "gifUrl": f"{MEDIA_BASE}/{gif_path}",
                "imageUrl": f"{MEDIA_BASE}/{img_path}" if img_path else "",
                "equipment": (ex.get("equipment") or "").lower(),
                "target": tg,
                "body_part": bp,
            }
        )
    return out


def score(our_n: str, ex: dict, prefer_tokens=None) -> float:
    a = set(our_n.split())
    b = set(ex["norm"].split())
    if not a or not b:
        return 0.0
    j = len(a & b) / len(a | b)
    cov = len(a & b) / len(a)
    s = 0.55 * j + 0.45 * cov
    prefer_eq = {"body weight", "dumbbell", "band", "stability ball", "medicine ball", "bosu ball", "assisted"}
    avoid = {"barbell", "cable", "smith machine", "leverage machine"}
    eq = ex["equipment"]
    if eq in prefer_eq:
        s += 0.06
    if any(x in eq for x in avoid):
        s -= 0.08
    if our_n == ex["norm"] or our_n in ex["norm"] or ex["norm"] in our_n:
        s += 0.25
    for tok in prefer_tokens or []:
        if tok and tok in ex["norm"]:
            s += 0.08
    return s


def resolve_by_source_name(pool: list[dict], source_name: str, full_catalog_pool=None):
    key = norm(source_name)
    search_spaces = [pool]
    if full_catalog_pool is not None:
        search_spaces.append(full_catalog_pool)
    for space in search_spaces:
        for ex in space:
            if ex["norm"] == key or key in ex["norm"] or ex["norm"] in key:
                return ex
    best = None
    best_s = 0.0
    for ex in pool:
        s = score(key, ex)
        if s > best_s:
            best_s = s
            best = ex
    return best if best_s >= 0.5 else None


def match_exercises(names: list[str], pool: list[dict], cfg: dict, existing: dict, force: bool, full_pool=None) -> dict:
    min_score = cfg.get("min_score", 0.8)
    manual = cfg.get("manual") or {}
    prefer_tokens = cfg.get("prefer_tokens") or []
    result = {} if force else dict(existing)
    search_pool = pool if pool else (full_pool or [])

    for our, src in manual.items():
        if our not in names:
            continue
        ex = resolve_by_source_name(search_pool, src, full_catalog_pool=full_pool)
        if not ex:
            continue
        result[our] = {
            "gifUrl": ex["gifUrl"],
            "imageUrl": ex["imageUrl"],
            "sourceName": ex["name"],
            "source": "anil-g11h/exercises-dataset (ExerciseDB / Gym visual media)",
        }

    for name in names:
        if name in result and not force:
            continue
        n = norm(name)
        best = None
        best_s = 0.0
        for ex in search_pool:
            s = score(n, ex, prefer_tokens=prefer_tokens)
            if s > best_s:
                best_s = s
                best = ex
        # Fall back to full catalog if body-part pool is weak
        if (best_s < min_score) and full_pool and full_pool is not search_pool:
            for ex in full_pool:
                s = score(n, ex, prefer_tokens=prefer_tokens)
                if s > best_s:
                    best_s = s
                    best = ex
        if best and best_s >= min_score:
            result[name] = {
                "gifUrl": best["gifUrl"],
                "imageUrl": best["imageUrl"],
                "sourceName": best["name"],
                "source": "anil-g11h/exercises-dataset (ExerciseDB / Gym visual media)",
            }

    name_set = set(names)
    return {k: v for k, v in result.items() if k in name_set}


def sync_page(page_key: str, catalog: list[dict], index: dict, force: bool, check_only: bool) -> dict:
    md_path = MD_ROOT / f"{page_key}.md"
    if not md_path.exists():
        return {"pageKey": page_key, "status": "missing-md"}

    cfg = PAGE_FILTERS.get(page_key) or default_page_filter(page_key)

    mtime_ms = file_mtime_ms(md_path)
    digest = sha256_file(md_path)
    prev = (index.get("pages") or {}).get(page_key) or {}
    sha_changed = prev.get("mdSha256") != digest
    manifest_rel = prev.get("manifest") or f"assets/data/{slugify_page_key(page_key)}"
    manifest_path = REPO_ROOT / manifest_rel

    names = parse_exercise_names(md_path)
    prev_names = set(prev.get("exerciseNames") or [])
    added_since_sync = [n for n in names if n not in prev_names]

    existing = {}
    if manifest_path.exists():
        try:
            existing = (json.loads(manifest_path.read_text()).get("byExercise")) or {}
        except Exception:
            existing = {}

    # Needs rerun when: never synced, md content hash changed, new exercise rows since last sync, or --force
    needs_work = (
        force
        or not prev
        or not manifest_path.exists()
        or sha_changed
        or bool(added_since_sync)
    )

    if check_only:
        return {
            "pageKey": page_key,
            "status": "stale" if needs_work else "ok",
            "shaChanged": sha_changed,
            "addedSinceSync": added_since_sync,
            "exerciseCount": len(names),
            "matchedCount": len(existing),
            "unmatchedCount": max(0, len(names) - len(existing)),
            "lastSyncedAt": prev.get("lastSyncedAt"),
        }

    if not needs_work:
        return {
            "pageKey": page_key,
            "status": "ok",
            "exerciseCount": len(names),
            "matchedCount": len(existing),
            "unmatchedCount": max(0, len(names) - len(existing)),
        }

    full_pool = filter_catalog(catalog, None, None)
    pool = filter_catalog(catalog, cfg.get("body_parts"), cfg.get("targets"))
    if cfg.get("targets") and len(pool) < 15:
        pool = filter_catalog(catalog, cfg.get("body_parts"), None)
    if not pool:
        pool = full_pool

    by_exercise = match_exercises(names, pool, cfg, existing, force=force, full_pool=full_pool)

    payload = {
        "pageKey": page_key,
        "attribution": ATTRIBUTION,
        "byExercise": by_exercise,
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(payload, indent=2) + "\n")

    index.setdefault("pages", {})[page_key] = {
        "mdPath": str(md_path.relative_to(REPO_ROOT)),
        "mdMtimeMs": mtime_ms,
        "mdSha256": digest,
        "manifest": manifest_rel,
        "bodyParts": cfg.get("body_parts"),
        "targets": cfg.get("targets"),
        "exerciseNames": names,
        "lastSyncedAt": utc_now(),
        "exerciseCount": len(names),
        "matchedCount": len(by_exercise),
        "unmatchedCount": len(names) - len(by_exercise),
    }

    return {
        "pageKey": page_key,
        "status": "synced",
        "addedSinceSync": added_since_sync,
        "exerciseCount": len(names),
        "matchedCount": len(by_exercise),
        "unmatchedCount": len(names) - len(by_exercise),
        "manifest": manifest_rel,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync exercise media manifests")
    parser.add_argument(
        "--page",
        help='One page only (e.g. "Bodybuilding - Minimum Equipment/Back"). Omit to process all md-file pages.',
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Rematch selected page(s) even if index says up to date",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only report stale vs ok from index state (no writes); exit 1 if any stale",
    )
    args = parser.parse_args()

    pages = [args.page] if args.page else discover_page_keys()
    index = load_index()

    catalog = None
    if not args.check:
        print("Fetching exercise catalog…")
        catalog = fetch_catalog()
        print(f"Catalog size: {len(catalog)}")

    results = []
    for page_key in pages:
        if args.check:
            results.append(sync_page(page_key, [], index, force=args.force, check_only=True))
        else:
            results.append(sync_page(page_key, catalog, index, force=args.force, check_only=False))

    if not args.check:
        # Drop index entries for deleted pages
        living = set(pages)
        index["pages"] = {k: v for k, v in (index.get("pages") or {}).items() if k in living}
        save_index(index)

    stale = [r for r in results if r.get("status") in ("stale", "synced")]
    ok = [r for r in results if r.get("status") == "ok"]

    # Compact summary
    print("\n=== Summary ===")
    for r in results:
        pk = r.get("pageKey", "?")
        short = pk.split("/")[-1] if pk else "?"
        folder = pk.split("/")[0] if "/" in pk else ""
        status = r.get("status")
        matched = r.get("matchedCount", 0)
        total = r.get("exerciseCount", 0)
        unmatched = r.get("unmatchedCount", max(0, total - matched))
        print(f"{status:8} {folder}/{short}: {matched}/{total} matched ({unmatched} unmatched)")

    if args.check:
        print(f"\nok={len(ok)} stale={len([r for r in results if r.get('status')=='stale'])}")
        return 1 if any(r.get("status") == "stale" for r in results) else 0

    print(f"\nDone. Updated index: {INDEX_PATH.relative_to(REPO_ROOT)}")
    print(f"Pages synced this run: {len(stale)} / {len(results)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
