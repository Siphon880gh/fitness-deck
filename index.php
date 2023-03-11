<?php
if(!isset($_GET["md-file"])) {
    // die("<span style='color:red'>Failed. No md-file URL query or GET url param.</span>");
    include("listing.php");
    die();
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
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" rel="stylesheet">
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
        td {
            vertical-align: top;
        }
        /* Search external */
        .ri-google-fill {
            background: -webkit-linear-gradient(left, rgba(66, 133, 244, 1), rgba(219, 68, 55,1 ), rgba(244, 180, 0, 1), rgba(66, 133, 244, 1), rgba(15, 157, 88,1), rgba(219, 68, 55,1 ));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            cursor: pointer;
            margin-right: 30px;
            opacity: .7;
        }
        .ri-youtube-fill {
            color:rgba(255,0,0,1);
            cursor: pointer;
            opacity: .7;
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
            cursor:  pointer;
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

        @media screen and (max-width: 570px) {
            .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_filter {
                float: none !important;
                display: block !important;
                margin: 10px auto !important;
            }
        }
    </style>
    <style>
        /*
        css-only-tooltip version 1.0.0
            ⓒ 2015 AHN JAE-HA http://github.com/eu81273
            MIT License
        */


        [data-tooltip-text]:hover {
            position: relative;
        }

        [data-tooltip-text]:hover:after {
            background-color: #000000;
            background-color: rgba(0, 0, 0, 0.8);

            -webkit-box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);
            -moz-box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);
            box-shadow: 0px 0px 3px 1px rgba(50, 50, 50, 0.4);

            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;

            color: #FFFFFF;
            font-size: 12px;
            content: attr(data-tooltip-text);

            margin-bottom: 10px;
            top: 130%;
            left: 0;    
            padding: 15px;
            position: absolute;
            width: 300px;
            word-wrap: break-word;

            z-index: 9999;
        }
    </style>
</head>

<body>
    <div style="position:absolute; top:5px; left:5px;"><a href="index.php">Directory</a></div>
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
                    linkify: true,
                    breaks: true
                });

                // Render, take care of \n breaks, and make sure links open in new windows
                var result = md.render(myMarkdown);
                document.querySelector(".container").innerHTML = result.replaceAll("\\n","<br/>");
                document.querySelectorAll(".container a").forEach(a=>{
                    a.setAttribute("target", "_blank");
                })

                // Rerender with an interactive table
                $( "table" ).DataTable({
                    "pageLength": 100,

                    /* drawCallback: Gets called every row drawn or re-drawn, including changing the view by ascending/descending/filtering */
                    "drawCallback": function( settings ) {
                        $(".ri-icon-hook").remove();
                        $("tr td:nth-child(1)").each((i,cellCol1)=>{
                            
                            // Create external icons
                            let $cell = $(cellCol1);
                            let textExercise = $cell.text();

                            let $iconGoogle = $(`<i class="ri-google-fill"></i>`);
                            let $iconYoutube = $(`<i class="ri-youtube-fill"></i>`);

                            $iconGoogle.click(()=>{
                                window.open(`https://www.google.com/search?q=${textExercise}`);
                            })
                            $iconYoutube.click(()=>{
                                window.open(`https://www.youtube.com/results?search_query=${textExercise}`);
                            })

                            let $div = $(`<div class='ri-icon-hook'></div>`)

                            $div.append($iconGoogle, $iconYoutube);
                            $cell.append($div);

                            // Create modelable
                            $cell.attr("data-id", textExercise);


                            $cell.closest("tr").find("td:not(:nth-child(1))").each((i,cell)=>{
                                let $cell = $(cell)
                                $cell.attr("data-id", `${textExercise}-${i}`);
                            });

                        });
                    }, // drawCallback

                    "initComplete": function(settings,json) {

                        // Create info tooltip at Search
                        let $infoIcon = $("<i class='ri-information-line'></i>");
                        $infoIcon.attr("data-tooltip-text", "Search Tip: Search for an exercise or instruction. Say you want exercises where you 'sit upright'");
                        $infoIcon.prependTo($("#DataTables_Table_0_filter label"))


                        // Create addressed statistic
                        let $addressed = $("<div id='addressed'><div/>")
                        $addressed.click(()=>{
                            let confirmed = confirm("Clear all addressed states?")
                            if(confirmed) {
                                clearAddressed();
                                rerenderAddressed();
                            }
                        })
                        $("#DataTables_Table_0_wrapper").prepend($addressed);

                        loadAddressed();
                        setTimeout(rerenderAddressed, 100);
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

                    saveAddressed();
                });
            } // hydrateCells

            window.dbVersion = 2.1;
            function loadAddressed() {
                let open = indexedDB.open("fitness-deck", window.dbVersion);

                open.onsuccess = function() {
                    let db = open.result;
                    let tx = db.transaction("FitnessAddressedStore", "readonly");
                    let store = tx.objectStore("FitnessAddressedStore");

                    // Get all data from store
                    let request = store.getAll();

                    request.onsuccess = function() {
                        // Logs all data to console
                        // console.log(request.result);
                        request.result.forEach(cellModel=>{
                            let {id, state} = cellModel;
                            $(`[data-id="${id}"]`)[0].className = state;
                        })
                    };

                    tx.oncomplete = function() {
                        db.close();
                    };
                };

                open.onerror = function() {
                    console.error("Error", open.error);
                };
            }; // loadAddressed
            
            function clearAddressed() {
                
                $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                    $(el).removeClass("addressed-1")
                        .removeClass("addressed-2")
                        .removeClass("addressed-3")
                        .removeClass("addressed-4")
                })
                saveAddressed();
            }

            function saveAddressed() {

                let open = indexedDB.open("fitness-deck", window.dbVersion);
                open.onupgradeneeded = function() {
                    let db = open.result;
                    let store = db.createObjectStore("FitnessAddressedStore", {keyPath: "id"});
                    let index = store.createIndex("cellID", ["id"]);
                };
                open.onsuccess = function() {
                    // Start a new transaction
                    let db = open.result;
                    let tx = db.transaction("FitnessAddressedStore", "readwrite");
                    let store = tx.objectStore("FitnessAddressedStore");

                    
                    // Clear all data from store
                    store.clear().onsuccess = function(event) {
                        $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                            let id = $(el).attr("data-id");
                            let state = $(el).attr("class");
                            store.put({id,state});
                        });
                    };


                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                };
                
                // console.group("A")
                $(".addressed-1,.addressed-2,.addressed-3,.addressed-4").each((i,el)=>{
                    let a = $(el).attr("data-id");
                    let b = $(el).attr("class");
                    // console.log({a,b})
                });
                // console.groupEnd();

                open.onerror = function() {
                    console.error("Error", open.error);
                };

            }; // saveAddressed
    </script>
</body>

</html>