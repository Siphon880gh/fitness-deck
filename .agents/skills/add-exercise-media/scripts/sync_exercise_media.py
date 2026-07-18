#!/usr/bin/env python3
"""
Sync open-source exercise demo media onto Fitness Deck markdown pages.

Modes:
  - All pages (default): discover every md-file/**/*.md (except .up.md)
  - One page: --page "Folder/File"

Internal state (assets/data/exercise-media-index.json):
  mdSha256 + exerciseNames from last sync. Without --force, only pages that
  need work are updated (never synced, sha changed, or new exercise names).
  PAGE_FILTERS.manual may map a name to None/"" to force-unmatch (no GIF).

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
WGER_CATALOG_URL = "https://wger.de/api/v2/exerciseinfo/?limit=1000&language=2"
WGER_LICENSE_URL = "https://wger.de/api/v2/license/?limit=100"
CATALOG_URLS = [CATALOG_URL, WGER_CATALOG_URL, WGER_LICENSE_URL]

ATTRIBUTION = {
    "text": (
        "Exercise animations provided by ExerciseDB / Fitness Exercises Dataset; "
        "additional exercise images provided by wger under the Creative Commons "
        "license and author shown for each matched image."
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
        {
            "label": "wger exercise database",
            "url": "https://wger.de",
        },
        {
            "label": "wger licensing",
            "url": "https://wger.readthedocs.io/en/latest/",
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
    # Stretch — search full catalog; prefer correct stretch GIFs or no media.
    # manual value None = force unmatch (catalog has no acceptable demo).
    "Stretch/Abs": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "pose"],
        "manual": {
            "Sphinx Pose": "sphinx",
            "Butterfly Stretch, Seated (Floor Seated) (Aka Bound Angle Pose)": "butterfly yoga pose",
            "Downward Dog": None,
            "- Standing Abdominal Stretch": "standing lateral stretch",
            "- Standing Side Bend (Aka Standing Oblique Stretch)": "45° side bend",
            "- Standing Quadriceps Stretch": "intermediate hip flexor and quad stretch",
        },
    },
    "Stretch/Ankle": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "ankle"],
        "manual": {
            "Achilles Tendon Stretch, Standing": "standing calves calf stretch",
            "Achilles Tendon Stretch, Seated": "seated calf stretch (male)",
            "Achilles Tendon Stretch, Wall-Leaning": "calf stretch with hands against wall",
            "Ankle Circles": "ankle circles",
        },
    },
    "Stretch/Back": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "pose", "back"],
        "manual": {
            "Sphinx Pose": "sphinx",
            "Upward Facing Dog": "upward facing dog",
            "Downward-Facing Dog (Adho Mukha Svanasana)": None,
            "Seated Wide Angle Pose (Upavistha Konasana)": "seated wide angle pose sequence",
            "- Twisting Lower Back Stretch (Lying Spinal Twist without pulling leg to horizontal position)": "seated lower back stretch",
            "- Butterfly Stretch, Seated (Floor Seated) (Aka Bound Angle Pose)": "butterfly yoga pose",
            "Frog Pose, Diamond": "rocking frog stretch",
            "Frog Pose, Half (Ardha Bhekasana) (Half or not Half)": "rocking frog stretch",
            "- Reclined Hand-to-Big-Toe Pose (Supta Padangusthasana)": "reclining big toe pose with rope",
            "Standing Big Toe Pose (Padangusthasana)": "reclining big toe pose with rope",
            "- Side Plank (Vasisthasana)": "bodyweight incline side plank",
            "- Knees-to-Chest Stretch": None,
            "Side Angle Pose (Utthita Parsvakonasana) (Aka Lateral Lunge)": None,
        },
    },
    "Stretch/Biceps": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.72,
        "prefer_tokens": ["stretch", "bicep", "wrist"],
        "manual": {
            "Wall Biceps Stretch (Flexed Wrist, straight arm)": None,
            "Wall Biceps Stretch (Both arms against wall behind body)": None,
            "Wall Biceps Stretch (Arm against wall)": None,
            "Standing Biceps Stretch (Hands clasped behind, palms away from body)": None,
            "Seated Biceps Stretch (Floor Seated)": None,
            "Wrist Extension Stretch (Brachioradialis)": "side wrist pull stretch",
            "Shoulder Flexion Stretch, Overheard Arms, Standing": "chest and front of shoulder stretch",
            "Shoulder Flexion Stretch, Overheard Arms, Bent Over (Arms on wall or chair)": "chest and front of shoulder stretch",
            "Shoulder Flexion Stretch, Overheard Arms, Supine": "chest and front of shoulder stretch",
        },
    },
    "Stretch/Calf": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "calf"],
        "manual": {
            "Downward Dog Calf Stretch": None,
            "Downward Dog Calf Stretch, Single Leg": None,
            "Seated Calf Stretch (Floor Seated)": "seated calf stretch (male)",
            "Seated Calf Stretch with Band (Floor Seated)": "seated calf stretch (male)",
            "Seated Calf Stretch with Towel (Floor Seated)": "seated calf stretch (male)",
            "Wall Calf Stretch, Foot Bent Against Wall": "calf stretch with hands against wall",
            "Wall Calf Stretch, Foot Bent against Wall, PNF with Back Leg": "calf stretch with hands against wall",
            "Wall Calf Stretch (Lunged, Back leg straight)": "calf stretch with hands against wall",
            "Wall Soleus Stretch (Lunged, Back leg bent to relax calf, back leg closer to front leg, allowing focus on soleus)": "calf stretch with hands against wall",
            "Stair Calf Stretch": "standing calves calf stretch",
            "Calf Raises": "bodyweight standing calf raise",
        },
    },
    "Stretch/Chest": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "chest"],
        "manual": {
            "Upward Facing Dog (Urdhva Mukha Svanasana)": "upward facing dog",
            "- Behind-the-back Chest Stretch": "behind head chest stretch",
            "- Behind-the-back Chest Stretch, Towl": "behind head chest stretch",
            "- Doorway Chest Stretch (W pose approx, one side)": "dynamic chest stretch (male)",
            "- Doorway Chest Stretch (Low arm, one side, turn chest away)": "dynamic chest stretch (male)",
            "- Wall Chest Stretch (Bent at elbow for chest expansion/opener)": "dynamic chest stretch (male)",
            "- Swiss Ball Kneeling Chest Stretch, Prone": "chest stretch with exercise ball",
            "- Resistance Band Chest Stretch (Pull band apart in T pose approx)": "dynamic chest stretch (male)",
            "- Scap Push-ups (Prone Protraction)": None,
            "Pilates Spine Twist": "spine twist",
        },
    },
    "Stretch/Hamstrings": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "hamstring"],
        "manual": {
            "Downward Dog Stretch": None,
            "Downward Dog Stretch, Single Leg": None,
            "Downward Dog Stretch, with Twist": None,
            "Standing Hamstring Stretch": "hamstring stretch",
            "Supine Hamstring Stretch": "hamstring stretch",
            "Seated Hamstring Stretch (Floor Seated)": "exercise ball seated hamstring stretch",
            "Seated Hamstring Stretch (Butt on chair)": "exercise ball seated hamstring stretch",
            "Butterfly Stretch, Seated (Floor Seated) (Aka Bound Angle Pose)": "butterfly yoga pose",
            "Wall Straddle Stretch": None,
            "Reclined Hand-to-Big-Toe Pose (Supta Padangusthasana)": "reclining big toe pose with rope",
        },
    },
    "Stretch/Hips": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "hip"],
        "manual": {
            "Downward Dog Calf Stretch": None,
            "Downward Dog Calf Stretch, Single Leg": None,
            "Downward Dog Stretch": None,
            "Downward Dog Stretch, Single Leg": None,
            "Downward Dog Stretch, with Twist": None,
            "Standing Calf Stretch": "standing calves calf stretch",
            "Standing Hamstring Stretch": "hamstring stretch",
            "Standing Hamstring Stretch with Strap": "standing hamstring and calf stretch with strap",
            "Standing Hip Flexor Stretch": "exercise ball hip flexor stretch",
            "Kneeling Hip Flexor Stretch (Pushing forward)": "exercise ball hip flexor stretch",
            "Standing Quad Stretch": "intermediate hip flexor and quad stretch",
            "Standing Adductor Stretch": "assisted side lying adductor stretch",
            "Kneeling Glute Stretch": "seated glute stretch",
            "Wall Pigeon Stretch": None,
            "Wall Hamstring Stretch": "hamstring stretch",
            "Supine Hamstring Stretch": "hamstring stretch",
            "Frog Pose (Half or not Half)": "rocking frog stretch",
            "Squat, Sumo Squat": None,
            "Lunge Twist": "world greatest stretch",
            "Lunge Twist, Low Lunge": "world greatest stretch",
            "Standing Crossover Stretch": "standing lateral stretch",
            "Lunge Stretch, Side Lunge": "weighted stretch lunge",
        },
    },
    "Stretch/Lats": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "lat"],
        "manual": {
            "Kneeling Lat Stretch, Hands on Floor (aka Quadruped Lat Stretch)": "kneeling lat stretch",
            "Kneeling Lat Stretch, Hands on Bench/Box": "kneeling lat stretch",
            "Kneeling Lat Stretch, Elbows on Bench/Box": "kneeling lat stretch",
            "Side Lying Floor Stretch": "side lying floor stretch",
            "Side Lying Swiss Ball Stretch": "exercise ball lying side lat stretch",
            "Seated Side Bend Stretch on Swiss Ball": "exercise ball lying side lat stretch",
            "Standing Side Bend": "45° side bend",
            "Seated Side Bend (Chair or Floor)": "45° side bend",
            "Seated Side Bend Stretch (Chair Seated)": "45° side bend",
        },
    },
    "Stretch/Neck": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "neck"],
        "manual": {
            "Sphinx Pose": "sphinx",
            "- Neck Circles (aka Head Rolls) (Careful)": "neck side stretch",
            "-- Scalene Stretch, Self-Assisted (...Pull skin at end of muscle)": "side push neck stretch",
            "- Bridge": None,
            "Yoga Mudra Pose": None,
        },
    },
    "Stretch/Quadriceps": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "quad"],
        "manual": {
            "Standing Quadriceps Stretch": "intermediate hip flexor and quad stretch",
            "Prone Quadriceps Stretch": "assisted prone lying quads stretch",
            "Wall Quadriceps Stretch": "lying (side) quads stretch",
            "Kneeling Quadriceps Stretch": "assisted prone rectus femoris stretch",
            "Dynamic Quadriceps Stretch": None,
            "Seated Quadriceps Stretch (Floor Seated)": None,
            "Overhead Reach Quadriceps Stretch": None,
            "Chair Quadriceps Stretch": "chair leg extended stretch",
            "Lunge Quadriceps Stretch": "weighted stretch lunge",
            "Quadriceps Stretch with Stability Ball": "assisted prone lying quads stretch",
        },
    },
    "Stretch/Shins": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "shin", "tibialis"],
        "manual": {
            "Anterior Tibialis Stretch, Kneeling": "posterior tibialis stretch",
            "Toe Drag, Single Leg, Standing": None,
        },
    },
    "Stretch/Shoulders": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "shoulder"],
        "manual": {
            "- Cross-Arm Stretch (aka Cross-Body Stretch)": "iron cross stretch",
            "- Behind-the-back Chest Stretch": "behind head chest stretch",
            "- Behind-the-back Chest Stretch, Towl": "behind head chest stretch",
            "- Shoulder Extension Stretch, Standing (Think Naruto run with the arms)": "standing lateral stretch",
            "- Shoulder Extension Stretch, Seated (Floor Seated)": None,
            "- Scapular Push-Ups": None,
            "- Scapular Push-Ups, Prone (aka Scapular Protraction Push-Ups)": None,
            "- Scapular Wall Push (aka Scapular Protraction Against Wall) (Wall in front, arms straight in front, hands on wall)": None,
            "-+ Band Pull-Apart": None,
            "-+ Bent-Over Band Pull-Apart": None,
            "- Lying Reverse Fly": None,
            "-- Corner Wall Stretch (W pose approx)": "dynamic chest stretch (male)",
            "-- Doorway Chest Stretch (Low arm, one side, turn chest away)": "dynamic chest stretch (male)",
            "-- Doorway Chest Stretch (W pose approx, one side)": "dynamic chest stretch (male)",
            "-- Wall Chest Stretch (Bent at elbow for chest expansion/opener)": "dynamic chest stretch (male)",
            "- Side Bend Stretch, Seated (aka Side Reach)": "neck side stretch",
            "- Side Bend Stretch, Standing (aka Side Reach)": "standing lateral stretch",
            "- Lying Chest Stretch, Prone": None,
            "- Prone Handcuffs Stretch": None,
        },
    },
    "Stretch/Triceps": {
        "body_parts": None,
        "targets": None,
        "min_score": 0.68,
        "prefer_tokens": ["stretch", "tricep"],
        "manual": {
            "Cross-Body Triceps Stretch": "triceps stretch",
            "Overheard Triceps Stretch, Seated or Standing": "overhead triceps stretch",
            "Towel Triceps Stretch, Seated or Standing (May sub strap)": "triceps stretch",
            "Wall Overhead Triceps Stretch": "overhead triceps stretch",
            "Shoulder Extension Stretch, Standing (Think Naruto run with the arms)": "standing lateral stretch",
            "Shoulder Extension Stretch, Seated (Floor Seated)": "exercise ball seated triceps stretch",
        },
    },
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
    return {"updatedAt": None, "catalogSource": CATALOG_URL, "catalogSources": CATALOG_URLS, "pages": {}}


def save_index(index: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    index["updatedAt"] = utc_now()
    index["catalogSource"] = CATALOG_URL
    index["catalogSources"] = CATALOG_URLS
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


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "fitness-deck-sync"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode())


def fetch_catalog() -> list[dict]:
    catalog = fetch_json(CATALOG_URL)
    for ex in catalog:
        ex["_source"] = "anil-g11h/exercises-dataset (ExerciseDB / Gym visual media)"
        ex["_source_url"] = "https://github.com/anil-g11h/exercises-dataset"

    wger_licenses = {
        item["id"]: item
        for item in (fetch_json(WGER_LICENSE_URL).get("results") or [])
    }
    wger_payload = fetch_json(WGER_CATALOG_URL)
    for ex in wger_payload.get("results") or []:
        translations = ex.get("translations") or []
        english = next((item for item in translations if item.get("language") == 2 and item.get("name")), None)
        images = ex.get("images") or []
        image = next((item for item in images if item.get("is_main")), images[0] if images else None)
        if not english or not image or not image.get("image"):
            continue

        license_info = wger_licenses.get(image.get("license")) or ex.get("license") or {}
        license_name = license_info.get("short_name") or license_info.get("full_name") or "Creative Commons"
        license_url = license_info.get("url") or "https://wger.readthedocs.io/en/latest/"
        author = (
            image.get("license_author")
            or english.get("license_author")
            or ex.get("license_author")
            or "wger contributor"
        )
        aliases = [item.get("alias") for item in (english.get("aliases") or []) if item.get("alias")]
        name = english["name"]

        catalog.append(
            {
                "name": name,
                "_match_name": f"{name} {' '.join(aliases)}",
                "body_part": "",
                "target": "",
                "equipment": ", ".join(item.get("name", "") for item in (ex.get("equipment") or [])),
                "gif_url": image["image"],
                "image": (image.get("thumbnails") or {}).get("medium") or image["image"],
                "_source": f"wger ({license_name}; {author})",
                "_source_url": image.get("license_object_url") or license_url,
                "_license": license_name,
                "_license_url": license_url,
                "_author": author,
            }
        )
    return catalog


def media_url(base: str, path: str) -> str:
    if path.startswith(("https://", "http://")):
        return path
    return f"{base}/{path.lstrip('/')}"


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
                "norm": norm(ex.get("_match_name") or ex["name"]),
                "gifUrl": media_url(MEDIA_BASE, gif_path),
                "imageUrl": media_url(MEDIA_BASE, img_path) if img_path else "",
                "equipment": (ex.get("equipment") or "").lower(),
                "target": tg,
                "body_part": bp,
                "source": ex.get("_source") or "ExerciseDB",
                "sourceUrl": ex.get("_source_url") or "",
                "license": ex.get("_license") or "",
                "licenseUrl": ex.get("_license_url") or "",
                "author": ex.get("_author") or "",
            }
        )
    return out


# Tokens used to reject clearly wrong stretch media matches.
_MUSCLE_TOKENS = {
    "bicep",
    "biceps",
    "tricep",
    "triceps",
    "chest",
    "pec",
    "pectoralis",
    "quad",
    "quads",
    "quadriceps",
    "hamstring",
    "hamstrings",
    "calf",
    "calves",
    "lat",
    "lats",
    "shoulder",
    "shoulders",
    "deltoid",
    "glute",
    "glutes",
    "hip",
    "hips",
    "neck",
    "shin",
    "shins",
    "tibialis",
    "achilles",
    "soleus",
    "ankle",
    "wrist",
    "adductor",
    "abductor",
    "abs",
    "abdominal",
    "oblique",
    "back",
    "spine",
    "piriformis",
    "peroneal",
    "toe",
    "toes",
}
_STRENGTH_TOKENS = {
    "raise",
    "raises",
    "press",
    "curl",
    "curls",
    "row",
    "rows",
    "squat",
    "squats",
    "deadlift",
    "fly",
    "flyes",
    "pulldown",
    "kickback",
    "shrug",
    "dip",
    "dips",
}
_STRETCH_TOKENS = {"stretch", "pose", "yoga"}
_RELATED_MUSCLES = (
    {"calf", "calves", "achilles", "soleus", "ankle"},
    {"hamstring", "hamstrings", "glute", "glutes", "hip", "hips"},
    {"chest", "pec", "pectoralis", "shoulder", "shoulders"},
    {"lat", "lats", "back", "spine"},
    {"quad", "quads", "quadriceps", "hip", "hips"},
    {"bicep", "biceps", "shoulder", "shoulders"},
    {"tricep", "triceps", "shoulder", "shoulders"},
    {"shin", "shins", "tibialis", "ankle", "toe", "toes"},
    {"neck", "shoulder", "shoulders"},
    {"abs", "abdominal", "oblique", "back"},
)
_OPPOSITE_PAIRS = (
    ("downward", "upward"),
    ("upward", "downward"),
    ("prone", "supine"),
    ("supine", "prone"),
)
_GENERIC_NAME_TOKENS = {
    "stretch",
    "stretches",
    "pose",
    "seated",
    "standing",
    "lying",
    "floor",
    "with",
    "and",
    "the",
    "a",
    "of",
    "on",
    "to",
    "aka",
    "male",
    "female",
    "single",
    "leg",
    "one",
    "both",
    "arms",
    "arm",
    "hands",
    "hand",
}


def _muscle_tokens(tokens: set[str]) -> set[str]:
    found = set(tokens & _MUSCLE_TOKENS)
    for tok in tokens:
        for m in _MUSCLE_TOKENS:
            if tok.startswith(m) or m.startswith(tok):
                found.add(m)
    return found


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

    our_stretch = bool(a & _STRETCH_TOKENS) or "stretch" in our_n
    ex_stretch = bool(b & _STRETCH_TOKENS) or "stretch" in ex["norm"]
    ex_strength = bool(b & _STRENGTH_TOKENS) and not ex_stretch
    if our_stretch and ex_strength:
        s -= 0.55
    elif our_stretch and not ex_stretch:
        s -= 0.28
    elif our_stretch and ex_stretch:
        s += 0.1

    our_m = _muscle_tokens(a)
    ex_m = _muscle_tokens(b)
    if our_m and ex_m and our_m.isdisjoint(ex_m):
        related = any((our_m & group) and (ex_m & group) for group in _RELATED_MUSCLES)
        if not related:
            s -= 0.42

    for left, right in _OPPOSITE_PAIRS:
        if left in a and right in b:
            s -= 0.65

    # Prefer no GIF over a wrong pose family (catalog has upward dog only).
    if "dog" in a and "dog" not in b:
        s -= 0.55
    if "butterfly" in a and "butterfly" not in b:
        s -= 0.4
    if "sphinx" in a and "sphinx" not in b:
        s -= 0.4

    # "wall + stretch" must not collapse every wall stretch onto wall calf stretch.
    if "wall" in ex["norm"] and "calf" in ex["norm"]:
        calfish = {"calf", "calves", "achilles", "soleus", "gastroc"}
        if "wall" in a and not (a & calfish):
            s -= 0.5

    # Reject generic "… stretch" catch-alls that only share the word stretch.
    distinctive = a - _GENERIC_NAME_TOKENS
    if our_stretch and distinctive and not (distinctive & b):
        s -= 0.22

    return s


def resolve_by_source_name(pool: list[dict], source_name: str, full_catalog_pool=None):
    key = norm(source_name)
    search_spaces = [pool]
    if full_catalog_pool is not None:
        search_spaces.append(full_catalog_pool)
    # Exact name first so short catalog names cannot steal longer manual aliases
    # (e.g. "standing calves" vs "standing calves calf stretch").
    for space in search_spaces:
        for ex in space:
            if ex["norm"] == key:
                return ex
    for space in search_spaces:
        for ex in space:
            if key in ex["norm"] or ex["norm"] in key:
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
    manual_locked = set()

    for our, src in manual.items():
        if our not in names:
            continue
        # None / "" = force-unmatch (prefer no media over a wrong GIF)
        if src is None or src == "":
            result.pop(our, None)
            manual_locked.add(our)
            continue
        ex = resolve_by_source_name(search_pool, src, full_catalog_pool=full_pool)
        if not ex:
            continue
        result[our] = {
            "gifUrl": ex["gifUrl"],
            "imageUrl": ex["imageUrl"],
            "sourceName": ex["name"],
            "source": ex["source"],
            "sourceUrl": ex["sourceUrl"],
            "license": ex["license"],
            "licenseUrl": ex["licenseUrl"],
            "author": ex["author"],
        }
        manual_locked.add(our)

    for name in names:
        if name in manual_locked:
            continue
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
                "source": best["source"],
                "sourceUrl": best["sourceUrl"],
                "license": best["license"],
                "licenseUrl": best["licenseUrl"],
                "author": best["author"],
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
        # Drop index entries for deleted pages only in all-pages mode.
        # Single-page --page must not wipe unrelated index entries.
        if not args.page:
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
