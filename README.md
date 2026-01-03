# Fitness Deck - AI Sourced

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/fitness-deck/main) <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue"></a>
<a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red"></a>  

By Weng Fei Fung. All possible exercises and their progression variations according to AI. These exercises are for flexibility, mobility, and strength training.

## Live Demo

[Visit Weng's Fitness Deck](https://wengindustry.com/tools/fitness-deck/)


## Exercise Administration

md-file levels can only be one folder deep. Then inside a folder has MD files. 

Here proves it:
```
const fileName = dir.split("/")[1];
```

The foldername would be at `[0]`

Developers can feel free to contribute to a multi level organization. I recommend counting the forward slashes then using hash or other data structure, to track and then render the listing differently.

## Supplementary Notes (.up.md files)

You can author supplementary notes for any exercise file by creating a file with the same name but with `.up.md` extension.

### Authoring Notes

For example, if you have `Back.md`, create `Back.up.md` in the same folder:
```
md-file/Stretch/Back.md      <- Exercise table
md-file/Stretch/Back.up.md   <- Supplementary notes
```

The `.up.md` file supports standard Markdown formatting (headings, lists, links, etc.).

### How Users View Notes

When a `.up.md` file exists for an exercise:
- A 📖 book icon appears as the first button in the bottom-right toggle buttons
- Clicking the icon slides in a notes panel from the right
- Users can dismiss the panel by:
  - Clicking the ✕ close button
  - Clicking the dark overlay
  - Pressing the Escape key

Note: `.up.md` files are automatically hidden from the main directory listing.

## Future version

- Will have built in countdown timer, sets/reps counter. 
- Will load faster by bundling assets with webpack.
- Will load faster by rewriting code in plain javascript. To get rid of jQuery, will have to make DataTables not reliant on jQuery.