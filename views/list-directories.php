<?php
    require("includes/ld-include.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Fitness Deck — AI-sourced exercise progressions for stretch, strength, mobility, and rehab.">
    <title>Fitness Deck</title>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/tokens.css">
    <link rel="stylesheet" href="assets/css/list-directories.css">
</head>
<body class="fd-directory">
    <div class="fd-shell">
        <header class="fd-hero">
            <p class="fd-hero-brand">Fitness Deck</p>
            <p class="fd-hero-tagline">AI-sourced progressions for stretch, strength, mobility, and rehab.</p>
        </header>

        <section id="continue-session" class="fd-continue" hidden>
            <p class="fd-section-label">Continue</p>
            <div class="fd-continue-card">
                <a id="continue-link" class="fd-continue-link" href="#">
                    <span class="fd-continue-title"></span>
                </a>
                <button id="continue-date" class="fd-continue-date" type="button"></button>
            </div>
        </section>

        <nav class="fd-programs" aria-label="Programs">
            <div class="fd-programs-inner">
                <p class="fd-section-label">Programs</p>
                <div class="fd-goal-chips">
                    <a class="fd-chip" href="#goal-stretch" data-goal="stretch">Stretch</a>
                    <a class="fd-chip" href="#goal-build" data-goal="build">Build</a>
                    <a class="fd-chip" href="#goal-mobility" data-goal="mobility">Mobility</a>
                    <a class="fd-chip" href="#goal-rehab" data-goal="rehab">Rehab</a>
                    <a class="fd-chip" href="#goal-cardio" data-goal="cardio">Cardio</a>
                </div>
            </div>
        </nav>

        <div class="fd-listing-toolbar">
            <div class="fd-mode-toggle" role="group" aria-label="Listing mode">
                <button type="button" id="mode-areas" class="fd-mode-btn" data-mode="AREAS" aria-pressed="true">By goal</button>
                <button type="button" id="mode-alphab" class="fd-mode-btn" data-mode="ALPHAB" aria-pressed="false">A–Z</button>
            </div>
        </div>

        <main class="fd-main">
            <article class="intro">
                <section class="dirs-wrapper">
                    <ul class="dirs"></ul>
                </section>
            </article>
        </main>

        <footer class="fd-footer">
            <p>Tap a variation cell to mark it—colors mean whatever you need (progress, reviewed, focus). Use the last column for comments. Progress stays on this device.</p>
            <p class="fd-credit">
                Made by
                <button type="button" class="fd-credit-toggle" onclick="document.querySelector('.creds-socials').classList.toggle('is-open')">Weng</button>
            </p>
            <div class="creds-socials">
                <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow">GitHub</a>
                <a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow">LinkedIn</a>
                <a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow">YouTube</a>
            </div>
        </footer>
    </div>

    <script>
        try {
            eval("window.dirs = " + `<?php echo json_encode($relativePaths); ?>`);
        } catch(err) {
            console.error({err})
        }
    </script>
    <script src="assets/js/common-sense-directories.js"></script>
    <script src="assets/js/list-directories.js"></script>
</body>
</html>
