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
    <link rel="stylesheet" href="assets/css/tabularize-exercises.css?v=4.4">
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
        <div class="fd-search-wrap">
            <input id="bind-inner-search" type="search" oninput="bindToInnerSearch()" placeholder="Search" aria-label="Search exercises">
            <small id="count-rows"></small>
        </div>
        <div id="save-status">Saved</div>
    </div>

    <div id="first-run-legend" class="fd-legend" hidden>
        <p>Each exercise shows a difficulty ladder—tap a step to mark it (colors mean what you decide). Add notes in Comments. Tools: notes, filter, random, detail, session.</p>
        <button type="button" id="dismiss-legend" class="fd-legend-dismiss">Got it</button>
    </div>

    <div class="container" style="display:flex;">
    </div>

    <div id="toggle-btns" class="fd-tools" role="toolbar" aria-label="Session tools">
        <?php if($upMdExists): ?>
        <button type="button" id="btn-notes" class="fd-tool" onclick="toggleNotesPanel()" aria-label="Notes">
            <i class="fas fa-book" aria-hidden="true"></i>
            <span>Notes</span>
        </button>
        <?php endif; ?>
        <button type="button" class="fd-tool" onclick="cycleMode()" aria-label="Filter by mark color">
            <i class="fas fa-filter" aria-hidden="true"></i>
            <span>Filter</span>
        </button>
        <button type="button" class="fd-tool" onclick="goRandomRow()" aria-label="Jump to random unmarked exercise">
            <i class="fas fa-random" aria-hidden="true"></i>
            <span>Random</span>
        </button>
        <button type="button" class="fd-tool" onclick='$(".text-parentheses").toggleClass("more")' aria-label="Toggle detail text in parentheses">
            <i class="fas fa-eye" aria-hidden="true"></i>
            <span>Detail</span>
        </button>
        <button type="button" class="fd-tool fd-tool-session" onclick="$(this).toggleClass('active'); $('#bar-controls').toggleClass('active'); $('#top-bar').toggleClass('active'); document.querySelector('#toggle-btns').classList.toggle('out-of-way')" aria-label="Session timer and reps">
            <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
            <span>Session</span>
        </button>
    </div>

    <!-- Notes slide-in panel -->
    <?php if($upMdExists): ?>
    <div id="notes-overlay" onclick="closeNotesPanel()"></div>
    <div id="notes-panel">
        <div id="notes-panel-header">
            <h3>Notes</h3>
            <button id="notes-close" type="button" onclick="closeNotesPanel()" aria-label="Close notes">✕</button>
        </div>
        <div id="notes-panel-content">
            Loading...
        </div>
    </div>
    <?php endif; ?>

    <div id="bar-controls">
        <ul id="control-panels">
            <li>
                <div class="icon">
                    <div class="icon-inner" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                        <img src="assets/icons/box.png" alt="">
                        <span>Info</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="300px">
                    <h3 style="max-width:300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><?php echo htmlspecialchars($exerciseGroupName); ?></h3>
                </div>
            </li>
            <li>
                <div class="icon" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                    <div class="icon-inner">
                        <img src="assets/icons/countdown.png" alt="">
                        <span>Time</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="300px">
                    <div id="cp-countdown">
                        <button id="countdown-operator" class='is-plus' onclick="event.target.classList.toggle('is-plus')"></button>
                        <button class='countdown-quant' data-value="10">10</button>
                        <button class='countdown-quant' data-value="30">30</button>
                        <button class='countdown-quant' data-value="60">60</button>
                        <button class='countdown-quant' data-value="90">90</button>
                        <hr id="countdown-divider"/>
                        <div id="countdown-mains">
                            <button id="countdown-stop-play"></button>
                            <div id="countdown-display"></div>
                        </div>
                    </div> <!-- cp-countdown -->
                </div>
            </li>
            <li>
                <div class="icon" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                    <div class="icon-inner">
                        <img src="assets/icons/counter.png" alt="">
                        <span>Reps</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="300px">
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
                    </div> <!-- reps-sets-wrapper -->
                </div>
            </li>
        </ul>
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
    <script src="assets/js/tabularize-exercises.js?v=4.4"></script>
    <script src="assets/js/control-bar.js"></script>
    <script src="assets/js/countdown.js"></script>
    <script src="assets/js/modal.js"></script>
    <script src="assets/js/reps.js"></script>
    
</body>

</html>
