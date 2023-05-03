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
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitness Deck - <?php echo $_GET["md-file"]; ?></title>

    <link href="https://cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" rel="stylesheet"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedheader/3.1.9/css/fixedHeader.dataTables.css">
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/tabularize-exercises.css">
</head>

<body>
    <div id="back-to-directory" style="z-index:2; width:100vw; background-color:white;"><button onclick="window.location.href='index.php'" style="cursor:pointer;">🗂️ All Directories</button></div>
    <div id="save-status">💾 Saved</div>
    <div style="text-align:center; width:100%; z-index:0; position: fixed;left: 0; top:40px;">
        <label>Search:</label>
        <input id="bind-inner-search" type="text" oninput="bindToInnerSearch()">
        <small id="count-rows"></small>
    </div>
    <div class="container"></div>

    <div id="bar-controls">
        <ul id="control-panels">
            <li>
                <div class="icon">
                    <div class="icon-inner" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                        <img src="assets/icons/box.png">
                        <span>Info</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="290px">
                    <h3 style="max-width:300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><?php echo $exerciseGroupName; ?></h3>
                </div>
            </li>
            <li>
                <div class="icon" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                    <div class="icon-inner">
                        <img src="assets/icons/countdown.png">
                        <span>Time</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="290px">Countdown here</div>
            </li>
            <li>
                <div class="icon" onclick="toggleElementRelative(event, 'li', '.control-panel')">
                    <div class="icon-inner">
                        <img src="assets/icons/counter.png">
                        <span>Reps</span>
                    </div>
                </div>
                <div class="control-panel cp-hidden" data-width="120px">Reps/Sets counter here</div>
            </li>
        </ul>
    </div> <!-- bar-controls -->

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
    </script>
    <script src="assets/js/tabularize-exercises.js"></script>
    <script src="assets/js/control-bar.js"></script>
    
</body>

</html>