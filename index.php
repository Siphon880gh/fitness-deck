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
        #addressed::before {
            content: "Addresssed:\00A0";
        }
        #addressed {
            float: right;
            color: #333;
            padding: 10px;
            margin-left: 15px;
            transform: translateY(-10px);
        }
        .addressed-1 {
            background-color: rgba(204, 255, 204, 1);
        }
        .addressed-2 {
            background-color: rgba(255, 255, 153, 1);
        }
        .addressed-3 {
            background-color: rgba(255, 204, 204, 1);
        }
        .addressed-4 {
            background-color: rgba(204, 153, 255, 1);
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
                    /* drawCallback: Gets called every row drawn or re-drawn, including changing the view by ascending/descending/filtering */
                    "drawCallback": function( settings ) {
                        $(".ri-icon-hook").remove();
                        $("tr td:nth-child(1)").each((i,cellCol1)=>{
                            
                            // Create external icons
                            let $cell = $(cellCol1);
                            let text = $cell.text();

                            let $iconGoogle = $(`<i class="ri-icon-hook ri-google-fill"></i>`);
                            let $iconYoutube = $(`<i class="ri-icon-hook ri-youtube-fill"></i>`);

                            $iconGoogle.click(()=>{
                                window.open(`https://www.google.com/search?q=${text}`);
                            })
                            $iconYoutube.click(()=>{
                                window.open(`https://www.youtube.com/results?search_query=${text}`);
                            })

                            let $div = $(`<div class='external-sources'></div>`)

                            $div.append($iconGoogle, $iconYoutube);
                            $cell.append($div);

                        });
                    }, // drawCallback
                    "initComplete": function(settings,json) {

                        let $addressed = $("<div id='addressed'><div/>")
                        $("#DataTables_Table_0_wrapper").prepend($addressed);
                        rerenderAddressed();
                        hydrateCells();

                    }, // initComplete
                });
            }).catch(err => {
                document.querySelector(".container").innerHTML = err;
            });

            function rerenderAddressed() {
                let count = $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").length;
                let total = $("tbody tr").length;
                $("#addressed").text(`${count} of ${total}`);
            }

            function hydrateCells() {
                function clearAllAddressedFlags($el) {
                    $el.removeClass("addressed-1")
                    .removeClass("addressed-2")
                    .removeClass("addressed-3")
                    .removeClass("addressed-4")
                }

                $("tr td:not(:nth-child(1))").on("click", event=>{
                    let el = event.target;
                    let $el = $(el);

                    let unaddressed = el.classList.length===0;
                    if(unaddressed) {
                        $el.addClass("addressed-1");
                    } else if($el.hasClass("addressed-1")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-2");
                    } else if($el.hasClass("addressed-2")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-3");
                    } else if($el.hasClass("addressed-3")) {
                        clearAllAddressedFlags($el);
                        $el.addClass("addressed-4");
                    } else if($el.hasClass("addressed-4")) {
                        clearAllAddressedFlags($el);
                    }
                    rerenderAddressed();

                });
            }
    </script>
</body>

</html>