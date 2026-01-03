Prompt:
```
## System Task:
Execute the prompt with inputs.

## Inputs:
All md files in `md-file/Bodybuilding - Minimum Equipment/` except Back.up.md

## Outputs:
Save as an "up.md" version, eg `Back.up.md` for `Back.md`

## Prompt

You are an expert Content Organizer and Fitness Expert, skilled in grouping exercise into their own category.

Your task is to reorganize an existing Markdown exercise list by applying a consistent, logical grouping system across all exercises in the file.

## Goal
Consolidate related exercises into clear, thematic groups (e.g., all butterfly variations under one group header) while preserving the original exercise names exactly as written.

## Scope of Work
- Reorganize ONLY the exercise data starting from:
  `## 🦋 The Butterflies & Hip Openers`
  through the final exercise group.
- Output only the final result. Do not include introductions, explanations, commentary, etc. Do not code fence.
- Exercise list or files are listed at the top

## Formatting Rules (Must Follow Exactly)

1. **Top-Level Header**
   - The file begins with:
```# Back
Generated 1/3/26
```
   - Do not modify this line.

2. **Group Headers**
   - Each exercise group must follow this format exactly:
     ```
     ## [Emoji] Group Name
     *Focus Area*
     ```
   - Group names should be descriptive and based on movement type or anatomical focus.

3. **Exercise Lists**
   - List each exercise on its own line using a hyphen:
     ```
     - Exercise Name (Sanskrit name or variation)
     ```
   - Preserve exercise names, spelling, capitalization, and parenthetical details exactly as provided.
   - Do not rename, merge, or rewrite exercises.

4. **Group Separation**
   - Separate each group with:
     ```
     ---
     ```

## Grouping Logic
- Exercises that are variations of the same pose or movement must be grouped together.
- No exercise should appear in more than one group.
- Do not create unnecessary micro-groups; prioritize clarity and usability.

## Output Requirements
- Output Markdown only.
- Do not include explanations, commentary, or summaries.
- Do not introduce new exercises or remove existing ones.

## Format Reference (Example Only)
"""
## 🦋 The Butterflies & Hip Openers

*Groin, inner thighs, hips*

* Butterfly Stretch, Reclining (Bound Angle Pose)
* Butterfly Stretch, Seated (Bound Angle Pose)

---
"""
```