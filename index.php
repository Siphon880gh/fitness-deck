<?php
if(!isset($_GET["md-file"])) {
    die("<span style='color:red'>Failed. No md-file URL query or GET url param.</span>");
} else {
    if (substr($_GET["md-file"], -3) === ".md") {
        $_GET["md-file"] = substr($_GET["md-file"], 0, -3);
    }
}
// TODO: Instead of dieing if there's no md-file URL param, then show listing.php which will create the links based on files in md-file/
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
    <link href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css" rel="stylesheet">

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
        /* DataTable */
        .dataTables_length {
            float: right !important;
            margin-left: 20px !important;
            margin-bottom: 10px !important;
        }
        /* Search external */
        .ri-google-fill {
            background: -webkit-linear-gradient(left, rgba(66, 133, 244, 1), rgba(219, 68, 55,1 ), rgba(244, 180, 0, 1), rgba(66, 133, 244, 1), rgba(15, 157, 88,1), rgba(219, 68, 55,1 ));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            cursor: pointer;
            margin-right: 30px;
            opacity: .5;
        }
        .ri-youtube-fill {
            color:rgba(255,0,0,1);
            cursor: pointer;
            opacity: .5;
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
                $( "table" ).DataTable({
                    "pageLength": 100,
                    "drawCallback": function( settings ) {
                        $("tr td:nth-child(1)").each((i,cellCol1)=>{
                            let $cell = $(cellCol1);
                            let text = $cell.text();

                            let $iconGoogle = $(`<i class="ri-google-fill"></i>`);
                            let $iconYoutube = $(`<i class="ri-youtube-fill"></i>`);

                            $iconGoogle.click(()=>{
                                window.open(`https://www.google.com/search?q=${text}`);
                            })
                            $iconYoutube.click(()=>{
                                window.open(`https://www.youtube.com/results?search_query=${text}`);
                            })

                            $cell.append($("<br/>"), $iconGoogle, $iconYoutube);
                            
                        });
                    }
                });
            }).catch(err => {
                document.querySelector(".container").innerHTML = err;
            })
    </script>
</body>

</html>