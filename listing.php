<?php
// This area is for notes for now

// (new URLSearchParams(document.location.search)).get("md-file")
// returns string or null

// $folderPath = 'md-file/*/'; // Replace with the actual folder path

// $mdFiles = glob($folderPath . '/*.md');

// foreach ($mdFiles as $file) {
//     echo $file . "\n";
// }


$relativePathing = ".";

    /* SETUP: Setup listing */
    function glob_recursive($pattern, $flags = 0)
    {
        $files = glob($pattern, $flags);
        // foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR) as $dir)
        foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir)
    {
        $files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags));
    }
        return $files;
    }


    $filepaths = glob_recursive("$relativePathing/md-file/*\.md");
    // foreach ($filepaths as $filepath) {
    //     $filename = basename($filepath);       // Get the filename
    //     $folder = basename(dirname($filepath)); // Get the last folder
    
    //     echo "File: $filename\n";
    //     echo "Folder: $folder\n";
    //     echo "\n";
    // }

    $associativeArray = array_map(function($filepath) {
        return ['folder' => basename(dirname($filepath)), 'file' => substr(basename($filepath), 0, -3)];
    }, $filepaths);

    $associativeArray;

    // $list = $filePaths
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script>
            // PHP brings in Google Sheet Data directly is faster
            try {
                window.dirs = `<?php echo json_encode($associativeArray); ?>`;
                window.dirs = JSON.parse(window.dirs)
            } catch(err) {
                console.error({error:err, message: "To web developer: If error in JSON, then get the JSON from DevTools and copy it to Online JSON Editor. The top line it errors on is where the problem is, likely a character that is not recognized. You can immediately test in Online JSON Editor."})
            }
    </script>
</head>
<body>
    <?php
            // Bootstrap annoyingly removed Jumbotron, so to improve readability:
            $jumbo = "container bg-light text-start px-5 py-4 rounded-3 my-4";
        ?>
        
        <div class="container-fluid">
            <header class="site-header clearfix">
                <h1 class="site-title display-3 float-start">Exercises - AI Variations</h1>
            </header>

            <main class="site-body">
                <article class="intro <?php echo $jumbo; ?>" data-page=0>
                    <!-- <h2 class="intro-title display-5">Choose a quiz:</h2> -->
                    <section class="dirs-wrapper my-4">
                        <ul class="dirs">

                        </ul>
                    </section>
                </article>
            </main>
        </div> <!-- Ends container-fluid -->


        
</body>
</html>