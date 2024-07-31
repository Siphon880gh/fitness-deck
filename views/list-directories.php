<?php
    require("includes/ld-include.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Fitness Deck</title>
    <link href="//cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/list-directories.css">
</head>
<body>
    <?php
            // Bootstrap annoyingly removed Jumbotron, so to improve readability:
            $jumbo = "container bg-light text-start px-5 py-4 rounded-3 my-4";
        ?>
        
        <div id="directories-options">
            <i class="fas fa-eye clickable" onclick="document.querySelectorAll('.last-opened').forEach(el=>el.classList.toggle('hidden'))"></i><br/>
            <i class="fas fa-sort clickable" onclick="toggleIndexMode(); document.querySelector('.fa-eye').classList.add('invisible');"></i><br/>
        </div>
        
        <div class="container-fluid">
            <header class="site-header clearfix">
                <h1 class="site-title display-3">Exercises - AI Variations</h1>
            </header>
            <section>
                <p>
                    <h2>Pick type of exercises!</h2>
                </p>
            </section>

            <main class="site-body">
                <article class="intro <?php echo $jumbo; ?>" data-page=0>
                    <section class="dirs-wrapper my-4">
                        <ul class="dirs">

                        </ul>
                    </section>
                </article>
            </main>

            <footer class="container promote-features">
                <hr>
                Made with ❤️ by <a href="javascript:void(0)" onclick="document.querySelector('.creds-socials').classList.toggle('d-none');">Weng</a><br>
                <div class="creds-socials d-none">
                <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&amp;logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&amp;logo=GitHub" style="max-width:8.5ch;"></a>
                <a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
                <a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>
                </div>
                AI sourced of all truth exercises for different programs (bodybuilding, mobility, stretching) and all muscle groups. Tab a progression/variation cell to color it. The color is up to your meaning and can be your way of marking which progression you're at or addressing what exercises you just reviewed (if you aim to learn all exercises, for example). The last column lets you add comments per exercise.
                <br/><br/>
            </footer>
        </div> <!-- Ends container-fluid -->

        
        <script>
        // Interfaces PHP with Javascript
        // PHP brings in Google Sheet Data directly is faster
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