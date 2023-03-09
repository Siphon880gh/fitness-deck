<?php
if(!isset($_GET["md-file"])) {
    die("<span style='color:red'>Failed. No md-file URL query or GET url param.</span>");
} else {
    if (substr($_GET["md-file"], -3) === ".md") {
        $_GET["md-file"] = substr($_GET["md-file"], 0, -3);
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <script>
        /** Change filename here */
        var filename = "md-file/<?php echo $_GET["md-file"]; ?>.md";
        console.log({filename})
    </script>

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fitness Deck - <?php echo $_GET["md-file"]; ?></title>

    <link href="https://cdn.datatables.net/1.10.21/css/jquery.dataTables.min.css" rel="stylesheet"/>
    <style>
        body {
            padding: 10px;
        }
        
        img {
            display: block;
            width: 100%;
            margin: 10px;
        }
        
        .container {
            font-size: 100%;
        }
        
        @media (min-width: 768px) {
            img {
                width: 50%;
                margin: 10px auto;
            }
            .container {
                font-size: 150%;
            }
        }

        .h2 {
            margin-left: 2ch;
        }
        
        .h2::before {
            content: "•\00a0";
        }
        
        .h3 {
            margin-left: 4ch;
        }
        
        .h3::before {
            content: "—";
        }
        
        .h4 {
            margin-left: 6ch;
        }
        
        .h4::before {
            content: "➣";
        }
        
        .h5 {
            margin-left: 8ch;
        }
        
        .h5::before {
            content: "➨";
        }
        
        .h6 {
            margin-left: 10ch;
        }
        
        .h6::before {
            content: "◦\00a0";
        }
    </style>
</head>

<body>
    <div class="container"></div>

    <script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js"></script>

    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
    <script>
        const isFailed = (myMarkdown) => {
            //return '<!DOCTYPE html> <html> <head> <title>File Not Found</title>".substring(0,70).toLowerCase().includes("file not found")'
            return myMarkdown.substring(0, 70).toLowerCase().includes("file not found");
        }
        const getFailed = () => {
            return 'ERROR: Not able to read. Has it been published? Contact author.'
        }
        fetch(encodeURI(filename), {
                cache: "no-cache"
            }).then(response => response.text())
            .then(myMarkdown => {
                if (isFailed(myMarkdown)) {
                    document.querySelector(".container").innerHTML = getFailed();
                    return;
                }
                var md = window.markdownit({
                    linkify: true
                });
                var result = md.render(myMarkdown);
                document.querySelector(".container").innerHTML = result;
                $( "table" ).DataTable();
            }).catch(err => {
                document.querySelector(".container").innerHTML = err;
            })
    </script>
</body>

</html>