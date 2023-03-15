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


    $relativePaths = array_map(function($filepath) {
        return basename(dirname($filepath)) . "/" . basename($filepath);
    }, $filepaths);


    // $list = $filePaths
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitness Deck</title>
    <style>
        body {
            text-align: center;
        }
        ul.dirs {
            font-size: 140%;
            list-style: none;
        }

        ul.dirs li.folder {
            margin-top: 1.2rem;
            font-size: 134%;
        }

        ul.dirs li.folder:not(.custom-icon)::before {
            content: "📂\00a0"
        }

        ul.dirs li.file::before {
            content: "\00a0\00a0\00a0\00a0\00a0-\00a0"
        }

        ul.dirs a {
            text-decoration: none;
        }
    </style>
    <style>
        .promote-features {
            color: rgba(0,0,0,0.5);
            font-size: .65rem;
            background-color: transparent;
            margin: 0 auto;
            text-align: right;
            line-height: .7rem;
        }
        .promote-features a {
            text-decoration: none;
        }
        .creds-socials {
            margin: 5px 0;
        }
    </style>
    <script>
            // PHP brings in Google Sheet Data directly is faster
            try {
                window.dirs = `<?php echo json_encode($relativePaths); ?>`;
                window.dirs = JSON.parse(window.dirs)
            } catch(err) {
                console.error({error:err, message: "To web developer: If error in JSON, then get the JSON from DevTools and copy it to Online JSON Editor. The top line it errors on is where the problem is, likely a character that is not recognized. You can immediately test in Online JSON Editor."})
            }
    </script>
    <link href="//cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">
</head>
<body>
    <?php
            // Bootstrap annoyingly removed Jumbotron, so to improve readability:
            $jumbo = "container bg-light text-start px-5 py-4 rounded-3 my-4";
        ?>
        
        <div class="container-fluid">
            <header class="site-header clearfix">
                <h1 class="site-title display-3">Exercises - A.I. Variations</h1>
            </header>
            <section>
                <p>
                    <h2>What exercises do you want to do? Just pick one!</h2>
                </p>
            </section>

            <main class="site-body">
                <article class="intro <?php echo $jumbo; ?>" data-page=0>
                    <!-- <h2 class="intro-title display-5">Choose a quiz:</h2> -->
                    <section class="dirs-wrapper my-4">
                        <ul class="dirs">

                        </ul>
                    </section>
                </article>
            </main>

            <footer class="container promote-features">
                <hr>
                Made with ❤️ by <a href="javascript:void(0)" onclick="document.querySelector('.creds-socials').classList.toggle('d-none');">Weng</a>.<br>
                <div class="creds-socials d-none">
                <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&amp;logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&amp;logo=GitHub" style="max-width:8.5ch;"></a>
                <a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://camo.githubusercontent.com/0f56393c2fe76a2cd803ead7e5508f916eb5f1e62358226112e98f7e933301d7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c696e6b6564496e2d626c75653f7374796c653d666c6174266c6f676f3d6c696e6b6564696e266c6162656c436f6c6f723d626c7565" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
                <a target="_blank" href="https://www.youtube.com/user/Siphon880yt/" rel="nofollow"><img src="https://camo.githubusercontent.com/0bf5ba8ac9f286f95b2a2e86aee46371e0ac03d38b64ee2b78b9b1490df38458/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f596f75747562652d7265643f7374796c653d666c6174266c6f676f3d796f7574756265266c6162656c436f6c6f723d726564" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>
                </div>
                AI sourced of all truth exercises for different programs (bodybuilding, mobility, stretching) and all muscle groups. Tab a progression/variation cell to color it. The color is up to your meaning and can be your way of marking which progression you're at or addressing what exercises you just reviewed (if you aim to learn all exercises, for example). The last column lets you add comments per exercise.
                <br/><br/>
            </footer>
        </div> <!-- Ends container-fluid -->

        <script>
        function initIndexUI() {
        const dirsEl = document.querySelector(".dirs");
        dirsEl.innerHTML = ""; // So can be reinit

        fetch("icons.config.js")
            .then((response) => {
            let customIcons = { icons: [] };
            if (response.ok) {
                return response.json();
            }
            return customIcons;
            })
            .then((customIconsConfig) => {
                customIcons = customIconsConfig;
                renderListing(customIcons.icons);
            })
            .catch((error) => {
                renderListing([]);
            });


        function renderListing(customIcons) {

            // window.dirs = window.dirs.reverse();
            window.dirs = window.dirs.sort();
            window.dirs.forEach(dir => {
            const isSegmentedPath = dir.split("/").length;
            if (isSegmentedPath) {
                let folderName = dir.split("/")[0];
                // If was password protected, remove password from the folder name
                if (folderName.length && folderName[0] === '-') {
                folderName = folderName.split(" ").slice(1).join(" ");
                }
                // console.log(folderName);

                const fileName = dir.split("/")[1];
                const isFirstListing = !Boolean(document.querySelector(`[data-folder="${folderName}"]`));
                if (isFirstListing) {
                dirsEl.append((() => {
                    const liEl = document.createElement("li");
                    liEl.textContent = folderName;
                    liEl.classList.add("folder")

                    const matchedCustomIcon = customIcons.filter(customIcon => customIcon.displayName === folderName);
                    if (matchedCustomIcon.length) {
                    liEl.classList.add("custom-icon")
                    liEl.innerHTML = matchedCustomIcon[0].replaceIcon + "&nbsp;" + liEl.innerHTML
                    }
                    liEl.setAttribute("data-folder", folderName);
                    return liEl;
                })())
                }
                dirsEl.append((() => {
                const liEl = document.createElement("li");
                liEl.classList.add("file")

                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.textContent = fileName.substr(0, fileName.length - 3);

                liEl.append(aEl);
                return liEl;
                })());
            } // isSegmentedPath
            else { // is not segmented with slashes, so is root file

                dirsEl.append((() => {
                const liEl = document.createElement("li");
                liEl.classList.add("file")

                const aEl = document.createElement("a");
                aEl.href = "?md-file=" + dir;
                aEl.textContent = fileName.substr(0, fileName.length - 3);

                liEl.append(aEl);
                return liEl;
                })());
            }
            });
        } // renderListing
        } // initIndexUI
        initIndexUI();
        </script>
        
</body>
</html>