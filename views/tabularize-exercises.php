<?php
    // Give a name, otherwise leave blank to default to filename
    // Default: $exerciseGroupName = "";
    $exerciseGroupName = "";

    // Parse the URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $uri = $_SERVER['REQUEST_URI'];
    $url = $protocol . $host . $uri;
    $parsedUrl = parse_url($url);

    // Get the query string
    $queryString = $parsedUrl['query'];

    // Parse the query string
    parse_str($queryString, $queryParameters);

    // Get the value of the "md-file" parameter
    $mdFile = $queryParameters['md-file'];

    // Extract the filename from the path
    $filename = basename($mdFile);

    // Remove file extension .md
    $currentPageWithoutExtension = $filename;
    $extensionsToRemove = ['.php', '.md'];
    foreach ($extensionsToRemove as $extension) {
        $currentPageWithoutExtension = str_replace($extension, '', $currentPageWithoutExtension);
    }
    if(strlen($exerciseGroupName)===0) $exerciseGroupName = $currentPageWithoutExtension;

    // Program folder label for chrome
    $programName = dirname($mdFile);
    if ($programName === '.' || $programName === '') {
        $programName = '';
    }

    // Check if a supplementary .up.md file exists
    $dirPath = dirname($mdFile);
    $upMdFile = $dirPath . '/' . $currentPageWithoutExtension . '.up.md';
    $upMdExists = file_exists('md-file/' . $upMdFile);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="description" content="Fitness Deck — <?php echo htmlspecialchars($exerciseGroupName); ?>">
    <title>Fitness Deck — <?php echo htmlspecialchars($exerciseGroupName); ?></title>

    <link href="https://cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" rel="stylesheet"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.9/css/fixedHeader.dataTables.css">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/tokens.css">
    <link rel="stylesheet" href="assets/css/tabularize-exercises.css?v=5.35">
</head>

<body class="fd-table">
    <div id="top-bar">
        <div id="back-to-directory">
            <button type="button" class="fd-back-btn" onclick="window.location.href='index.php'" aria-label="Back to directory">
                <i class="fas fa-arrow-left" aria-hidden="true"></i>
                <span>Directory</span>
            </button>
        </div>
        <div class="fd-table-title">
            <span class="fd-table-program"><?php echo htmlspecialchars($programName); ?></span>
            <span class="fd-table-group"><?php echo htmlspecialchars($exerciseGroupName); ?></span>
        </div>
        <div class="fd-top-actions">
            <div id="save-status">Saved</div>
            <div class="fd-search-wrap">
                <input id="bind-inner-search" type="search" oninput="bindToInnerSearch()" placeholder="Search" aria-label="Search exercises">
                <small id="count-rows" aria-live="polite"></small>
            </div>
        </div>
    </div>

    <div id="first-run-legend" class="fd-legend" hidden>
        <p>Each exercise shows a difficulty ladder—tap a step to mark it (colors mean what you decide). Add notes in Comments. Tools: outline, filter, random, session.</p>
        <button type="button" id="dismiss-legend" class="fd-legend-dismiss">Got it</button>
    </div>

    <div class="container" style="display:flex;">
    </div>

    <div id="toggle-btns" class="fd-tools" role="toolbar" aria-label="Session tools">
        <div id="fd-filter-panel" class="fd-filter-panel" hidden>
            <p class="fd-filter-panel-label">Comments</p>
            <div class="fd-filter-panel-row" role="group" aria-label="Comment filters">
                <button type="button" class="fd-filter-chip" data-comment-filter="with" aria-pressed="false">With comments</button>
                <button type="button" class="fd-filter-chip" data-comment-filter="without" aria-pressed="false">No comments</button>
            </div>
            <p class="fd-filter-panel-label">Color</p>
            <div class="fd-filter-colors" role="group" aria-label="Color filters">
                <button type="button" class="fd-color-swatch" data-color-filter="1" aria-label="Filter green marks" title="Green"></button>
                <button type="button" class="fd-color-swatch" data-color-filter="2" aria-label="Filter cyan marks" title="Cyan"></button>
                <button type="button" class="fd-color-swatch" data-color-filter="3" aria-label="Filter pink marks" title="Pink"></button>
                <button type="button" class="fd-color-swatch" data-color-filter="4" aria-label="Filter purple marks" title="Purple"></button>
            </div>
            <button type="button" class="fd-filter-clear" id="fd-filter-clear">Clear all</button>
        </div>
        <button type="button" id="btn-filter" class="fd-tool" onclick="toggleFilterPanel()" aria-label="Filters" aria-expanded="false" aria-controls="fd-filter-panel">
            <i class="fas fa-filter" aria-hidden="true"></i>
            <span>Filter</span>
        </button>
        <?php if($upMdExists): ?>
        <button type="button" id="btn-notes" class="fd-tool" onclick="toggleNotesPanel()" aria-label="Outline — groupings and your comments">
            <i class="fas fa-list-ul" aria-hidden="true"></i>
            <span>Outline</span>
        </button>
        <?php endif; ?>
        <button type="button" class="fd-tool" onclick="goRandomRow()" aria-label="Jump to random unmarked exercise">
            <i class="fas fa-random" aria-hidden="true"></i>
            <span>Random</span>
        </button>
        <button type="button" class="fd-tool fd-tool-session" onclick="$(this).toggleClass('active'); $('#bar-controls').toggleClass('active'); $('#top-bar').toggleClass('active'); document.querySelector('#toggle-btns').classList.toggle('out-of-way')" aria-label="Session timer and reps">
            <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
            <span>Session</span>
        </button>
    </div>

    <!-- Outline slide-in panel (.up.md groupings + your comments) -->
    <?php if($upMdExists): ?>
    <div id="notes-overlay" onclick="closeNotesPanel()"></div>
    <div id="notes-panel">
        <div id="notes-panel-header">
            <h3>Outline</h3>
            <button id="notes-close" type="button" onclick="closeNotesPanel()" aria-label="Close outline">✕</button>
        </div>
        <div id="notes-panel-content">
            Loading...
        </div>
    </div>
    <?php endif; ?>

    <div id="bar-controls">
        <ul id="control-panels" class="session-accordion">
            <li id="session-exercise-item" class="session-accordion-item">
                <div class="icon" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                    <div class="icon-inner" id="session-exercise-chip" role="button" tabindex="0" aria-expanded="false" aria-controls="session-exercise-panel">
                        <img src="assets/icons/box.png" alt="">
                        <span>Exercise</span>
                        <i class="fas fa-chevron-down session-accordion-caret" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="control-panel cp-hidden" id="session-exercise-panel">
                    <div id="session-exercise">
                        <div id="session-exercise-popover" class="session-exercise-popover" hidden role="status" aria-live="polite">
                            <strong>Assign an exercise first</strong>
                            <span>Click an exercise card on the deck, or pick one from the dropdown.</span>
                        </div>
                        <div class="session-exercise-head">
                            <div id="session-exercise-name" class="session-exercise-empty" data-exercise="">No exercise assigned</div>
                            <button type="button" id="session-exercise-clear" class="session-exercise-clear-link" title="Clear assigned exercise">Clear</button>
                        </div>
                        <div class="session-exercise-actions">
                            <label class="session-exercise-pick-label">
                                <span class="visually-hidden">Pick exercise</span>
                                <select id="session-exercise-pick" aria-label="Pick exercise from this page">
                                    <option value="">Pick…</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </div>
            </li>
            <li class="session-accordion-item session-needs-exercise" id="session-time-item">
                <div class="icon">
                    <div class="icon-inner is-disabled" id="session-time-chip" role="button" tabindex="0" aria-label="Duration" aria-expanded="false" aria-controls="session-time-panel" aria-disabled="true" title="Assign an exercise first">
                        <img src="assets/icons/countdown.png" alt="">
                        <span>Duration</span>
                        <i class="fas fa-chevron-down session-accordion-caret" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="control-panel cp-hidden" id="session-time-panel">
                    <div id="cp-countdown">
                        <button id="countdown-operator" class='is-plus' onclick="event.target.classList.toggle('is-plus')"></button>
                        <button class='countdown-quant' data-value="10">10</button>
                        <button class='countdown-quant' data-value="15">15</button>
                        <button class='countdown-quant' data-value="30">30</button>
                        <button class='countdown-quant' data-value="60">60</button>
                        <hr id="countdown-divider"/>
                        <div id="countdown-mains">
                            <button type="button" id="countdown-play" aria-label="Play timer"></button>
                            <div id="countdown-display"></div>
                            <button type="button" id="countdown-stop" aria-label="Stop timer"></button>
                        </div>
                    </div>
                </div>
            </li>
            <li class="session-accordion-item session-needs-exercise" id="session-reps-item">
                <div class="icon">
                    <div class="icon-inner" id="session-reps-chip" role="button" tabindex="0" aria-label="Sets and reps" aria-expanded="false" aria-controls="session-reps-panel">
                        <i class="fas fa-dumbbell" aria-hidden="true"></i>
                        <span>Sets</span>
                        <i class="fas fa-chevron-down session-accordion-caret" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="control-panel cp-hidden" id="session-reps-panel">
                    <div id="reps-sets-wrapper">
                        <div id="r-plus"></div>
                        <table id="reps-sets-table">
                            <tr>
                                <td class="initial" style="cursor:pointer;" onclick="optionsRepsTable();">Set</td>
                                <td class="initial">1st</td>
                            </tr>
                            <tr>
                                <td class="initial" style="cursor:pointer;" onclick="optionsRepsTable();">Rep</td>
                                <td class="initial"><input type="number" min="0"></input></td>
                            </tr>
                            <tr>
                                <td class="initial" style="cursor:pointer;" onclick="optionsRepsTable();">Wt</td>
                                <td class="initial"><input type="number" min="0"></input></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </li>
            <li class="session-reset-item" id="session-reset-item">
                <button type="button" id="session-reset-btn" class="session-reset-btn" title="Reset duration and sets only">
                    <i class="fas fa-undo" aria-hidden="true"></i>
                    <span>Reset</span>
                </button>
            </li>
        </ul>
        <div class="session-bar-toolbar" id="session-end-stack">
            <div class="control-panel cp-hidden session-history-panel" id="session-history-panel">
                <div id="session-history">
                    <div id="session-history-list" class="session-history-empty">No saved sessions yet</div>
                </div>
            </div>
            <div class="session-end-actions">
                <button type="button" class="session-end-btn" id="session-history-chip" aria-label="Session history" aria-expanded="false">
                    <i class="fas fa-history" aria-hidden="true"></i>
                    <span>History</span>
                </button>
                <button type="button" class="session-end-btn is-disabled" id="session-save-btn" aria-label="Save session to history" aria-disabled="true" title="Assign an exercise first">
                    <i class="fas fa-save" aria-hidden="true"></i>
                    <span>Save</span>
                </button>
            </div>
        </div>
    </div> <!-- bar-controls -->

    <div id="credits-modal" class="modal fd-credits-modal" hidden>
        <div class="modal-content fd-credits-content" role="dialog" aria-modal="true" aria-labelledby="credits-modal-title">
            <button type="button" class="fd-credits-close" id="credits-modal-close" aria-label="Close credits">&times;</button>
            <h2 id="credits-modal-title">Credits</h2>
            <div id="credits-modal-body"></div>
        </div>
    </div>

    <div id="modal" class="modal">
        <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Reps / Sets</h2>
            <p>
                <div style="position:relative; width:fit-content; margin:0 auto;">
                    <textarea id="reps-text" style="resize:none;" onclick="if(event.target.value.length===0) return; event.target.select(); document.execCommand('copy'); event.target.blur(); document.querySelector('#reps-text-copied').classList.remove('hidden'); setInterval(()=>{ document.querySelector('#reps-text-copied').classList.add('hidden') }, 500)"></textarea>
                    <div id="reps-text-copied" class="hidden" style="position:absolute; top:0; right:2.5px;">Copied</div>
                </div>
            </p>
        <p>
            <button onclick="resetRepsTable(); document.getElementById('modal').style.display='none';"><b>Reset</b> Reps table</button>
            &nbsp;&nbsp;
            <button onclick="document.getElementById('modal').style.display='none';"><b>Nevermind</b></button>
        </p>
        </div>
    </div> <!-- modal -->

    <script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/fixedcolumns/4.2.2/js/dataTables.fixedColumns.min.js"></script>
    <script src="https://cdn.datatables.net/fixedheader/3.1.9/js/dataTables.fixedHeader.min.js"></script>


    <script>
        // Interfaces PHP with Javascript
        // PHP brings in Google Sheet Data directly is faster
        eval("var filename = 'md-file/<?php echo $_GET["md-file"]; ?>.md'");
        console.log({filename})
        
        // Notes panel (.up.md file)
        var upMdExists = <?php echo $upMdExists ? 'true' : 'false'; ?>;
        var upMdFilename = 'md-file/<?php echo $upMdFile; ?>';
    </script>
    <script src="assets/js/tabularize-exercises.js?v=5.9"></script>
    <script src="assets/js/control-bar.js?v=5.9"></script>
    <script src="assets/js/countdown.js?v=5.7"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/reps.js?v=5.5"></script>
    <script src="assets/js/session-history.js?v=5.16"></script>
    
</body>

</html>
